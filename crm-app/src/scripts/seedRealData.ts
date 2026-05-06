import { createClient } from '@supabase/supabase-js'

// ============================================
// CONFIG — dùng service role key để bypass RLS
// ============================================
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BATCH_SIZE = 50

// ============================================
// PLACEHOLDER DATA — paste data thật vào đây
// ============================================
const SA_DATA: any[] = [/* PASTE SA DATA HERE */]
const CCC_DATA: any[] = [/* PASTE CCC DATA HERE */]

// ============================================
// HELPERS
// ============================================

function today() {
  return new Date()
}

function addDays(d: Date, n: number): string {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result.toISOString().split('T')[0]
}

function getNextActionDate(group: string | null): string | null {
  if (!group) return null
  const letter = group.charAt(0)
  switch (letter) {
    case 'A': return addDays(today(), 1)
    case 'B': return addDays(today(), 3)
    case 'C': return addDays(today(), 14)
    case 'D': return addDays(today(), 90)
    default: return null // E, F, G, H → null
  }
}

function parseBool(val: any): boolean {
  if (val === null || val === undefined) return false
  const s = String(val).trim()
  return s.length > 0
}

function normalizeTicketCode(raw: string): string {
  // Format gốc: #DDMMYYNNN → target: YYYYMMDD-NNN
  // Ví dụ: '#020126002' → DD=02, MM=01, YY=26, NNN=002 → '20260102-002'
  const cleaned = raw.replace('#', '').trim()
  if (cleaned.length < 9) return cleaned

  const dd = cleaned.substring(0, 2)
  const mm = cleaned.substring(2, 4)
  const yy = cleaned.substring(4, 6)
  const nnn = cleaned.substring(6)
  const yyyy = `20${yy}`
  return `${yyyy}${mm}${dd}-${nnn}`
}

function getRootCauseTag(category: string | null): string {
  if (!category) return 'OTHER'
  switch (category) {
    case 'Failed E-Kyc': return 'SYSTEM_BUG'
    case 'Quản lý Tài khoản PHS': return 'SOP_GAP'
    case 'Hỗ trợ Giao dịch': return 'PROCESS_GAP'
    case 'CMSN': return 'INFO_GAP'
    case 'Ứng dụng PHS': return 'SYSTEM_BUG'
    case 'Môi giới': return 'PROCESS_GAP'
    default: return 'OTHER'
  }
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function fakeCsatScore(status: string | null, priority: string | null): number | null {
  if (status !== 'Đã đóng') return null
  if (priority === 'Cao') {
    return weightedRandom([2, 3, 4], [0.20, 0.50, 0.30])
  }
  // Bình thường hoặc khác
  return weightedRandom([3, 4, 5], [0.15, 0.45, 0.40])
}

async function batchUpsert(
  table: string,
  data: any[],
  onConflict: string,
  label: string,
) {
  const total = data.length
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict })

    if (error) {
      console.error(`❌ ${label} batch ${i}-${i + batch.length}: ${error.message}`)
    } else {
      console.log(`✅ ${label}: ${Math.min(i + BATCH_SIZE, total)}/${total}`)
    }
  }
}

// ============================================
// 1. SEED CUSTOMERS
// ============================================
async function seedCustomers() {
  console.log('\n📦 Seeding customers...')

  // Extract từ SA data
  const saCustomers = SA_DATA
    .filter((r: any) => r.account_id || r['Số tài khoản'])
    .map((r: any) => {
      const accountId = String(r.account_id || r['Số tài khoản']).trim()
      return {
        account_id: accountId,
        full_name: r.full_name || r['Họ tên KH'] || r['Tên KH'] || null,
        branch: r.branch || r['Chi nhánh'] || 'QUẬN 3',
        status: r.status || r['Trạng thái TK'] || null,
      }
    })

  // Extract từ CCC data
  const cccCustomers = CCC_DATA
    .filter((r: any) => {
      const aid = String(r.account_id || r['Số tài khoản'] || r['Số TK'] || '').trim()
      // Bỏ masked accounts (kết thúc XX)
      return aid.length > 0 && !aid.endsWith('XX') && !aid.endsWith('xx')
    })
    .map((r: any) => {
      const accountId = String(r.account_id || r['Số tài khoản'] || r['Số TK']).trim()
      return {
        account_id: accountId,
        full_name: r.full_name || r['Họ tên'] || r['Tên KH'] || null,
        branch: r.branch || r['Chi nhánh'] || null,
        status: null,
        vip_tier: r.vip_tier || r['Phân loại VIP'] || 'Bình thường',
      }
    })

  // Deduplicate by account_id
  const map = new Map<string, any>()
  for (const c of [...saCustomers, ...cccCustomers]) {
    if (!map.has(c.account_id)) {
      map.set(c.account_id, c)
    } else {
      // Merge: prefer non-null values
      const existing = map.get(c.account_id)!
      for (const key of Object.keys(c)) {
        if (c[key] && !existing[key]) existing[key] = c[key]
      }
    }
  }

  const customers = Array.from(map.values())
  console.log(`  Found ${customers.length} unique customers`)
  await batchUpsert('customers', customers, 'account_id', 'Customers')
}

// ============================================
// 2. SEED SA RECORDS
// ============================================
async function seedSARecords() {
  console.log('\n📋 Seeding SA records...')

  const records = SA_DATA.map((r: any) => {
    const accountId = String(r.account_id || r['Số tài khoản']).trim()
    const callResult = r.call_result || r['Kết quả cuộc gọi'] || null
    const interestLevel = r.interest_level || r['Mức độ quan tâm'] || null
    const customerGroup = r.customer_group || r['Phân nhóm KH'] || r['Phân nhóm'] || null
    const pic = r.pic || r['PIC'] || null

    return {
      account_id: accountId,
      pic: pic,
      pic_user_id: null,
      call_date: r.call_date || r['Ngày gọi'] || null,
      follow_count: r.follow_count || r['Lần chăm sóc'] || r['Lần CS'] || 1,
      call_result: callResult,
      interest_level: interestLevel,
      customer_group: customerGroup,
      product_introduced: parseBool(r.product_introduced ?? r['Giới thiệu sản phẩm']),
      reactivation: parseBool(r.reactivation ?? r['Tái kích hoạt TK']),
      info_support: parseBool(r.info_support ?? r['Hỗ trợ thông tin']),
      total_transaction_value: r.total_transaction_value || r['Tổng GTGD'] || null,
      transaction_fee: r.transaction_fee || r['Phí GD'] || null,
      notes: r.notes || r['Ghi chú'] || null,
      handover_rm: r.handover_rm || r['Bàn giao MG chăm sóc'] || null,
      status_at_call: r.status_at_call || r['Trạng thái'] || null,
      next_action_date: getNextActionDate(customerGroup),
    }
  })

  // SA records don't have a natural unique key, insert directly
  const total = records.length
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('sa_records')
      .insert(batch)

    if (error) {
      console.error(`❌ SA records batch ${i}-${i + batch.length}: ${error.message}`)
    } else {
      console.log(`✅ SA records: ${Math.min(i + BATCH_SIZE, total)}/${total}`)
    }
  }
}

// ============================================
// 3. SEED CCC TICKETS
// ============================================
async function seedCCCTickets() {
  console.log('\n🎫 Seeding CCC tickets...')

  // First pass: build tickets
  const tickets = CCC_DATA.map((r: any) => {
    const rawCode = r.ticket_code || r['Mã phiếu'] || r['Ticket Code'] || ''
    const ticketCode = normalizeTicketCode(String(rawCode))

    const rawAccountId = String(r.account_id || r['Số tài khoản'] || r['Số TK'] || '').trim()
    const isMasked = rawAccountId.endsWith('XX') || rawAccountId.endsWith('xx')
    const accountId = (!rawAccountId || isMasked) ? null : rawAccountId

    const category = r.category || r['Loại'] || r['Phân loại'] || null
    const status = r.status || r['Trạng thái'] || 'Đang xử lý'
    const priority = r.priority || r['Mức độ ưu tiên'] || r['Ưu tiên'] || 'Bình thường'
    const source = r.source || r['Nguồn'] || r['Kênh'] || null

    return {
      ticket_code: ticketCode,
      account_id: accountId,
      category: category,
      classification: r.classification || r['Phân loại chi tiết'] || r['Chi tiết'] || null,
      customer_type: r.customer_type || r['Loại KH'] || null,
      source: source,
      status: status,
      priority: priority,
      description: r.description || r['Mô tả'] || r['Nội dung'] || null,
      resolution: r.resolution || r['Xử lý'] || r['Cách giải quyết'] || null,
      total_time: r.total_time || r['Tổng thời gian'] || null,
      handling_time: r.handling_time || r['Thời gian xử lý'] || null,
      is_unlinked: !accountId,
      root_cause_tag: getRootCauseTag(category),
      csat_score: fakeCsatScore(status, priority),
      is_recurring: false, // Will update in second pass
    }
  })

  // Second pass: mark is_recurring (same account_id + same category ≥ 2 tickets)
  const countMap = new Map<string, number>()
  for (const t of tickets) {
    if (t.account_id) {
      const key = `${t.account_id}__${t.category}`
      countMap.set(key, (countMap.get(key) || 0) + 1)
    }
  }
  for (const t of tickets) {
    if (t.account_id) {
      const key = `${t.account_id}__${t.category}`
      if ((countMap.get(key) || 0) >= 2) {
        t.is_recurring = true
      }
    }
  }

  console.log(`  ${tickets.filter(t => t.is_recurring).length} recurring tickets detected`)

  await batchUpsert('crm_tickets', tickets, 'ticket_code', 'CCC tickets')

  // Update VIP tier on customers from CCC data
  console.log('\n🏆 Updating customer VIP tiers...')
  const vipUpdates: { account_id: string; vip_tier: string }[] = []
  for (const r of CCC_DATA) {
    const rawAccountId = String(r.account_id || r['Số tài khoản'] || r['Số TK'] || '').trim()
    const vip = r.vip_tier || r['Phân loại VIP'] || null
    if (rawAccountId && !rawAccountId.endsWith('XX') && vip && vip !== 'Bình thường') {
      vipUpdates.push({ account_id: rawAccountId, vip_tier: vip })
    }
  }

  // Deduplicate
  const vipMap = new Map<string, string>()
  for (const v of vipUpdates) {
    vipMap.set(v.account_id, v.vip_tier)
  }

  let vipCount = 0
  for (const [accountId, vipTier] of vipMap.entries()) {
    const { error } = await supabase
      .from('customers')
      .update({ vip_tier: vipTier })
      .eq('account_id', accountId)
    if (!error) vipCount++
  }
  console.log(`✅ Updated VIP tier for ${vipCount} customers`)
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('🚀 Starting seed...')
  console.log(`  SA records: ${SA_DATA.length}`)
  console.log(`  CCC tickets: ${CCC_DATA.length}`)
  console.log('')

  await seedCustomers()
  await seedSARecords()
  await seedCCCTickets()

  console.log('\n🎉 Seed hoàn tất!')
}

main().catch(err => {
  console.error('💥 Seed failed:', err)
  process.exit(1)
})
