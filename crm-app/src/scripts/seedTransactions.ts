import { createClient } from '@supabase/supabase-js'

// ============================================
// CONFIG
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
// CONSTANTS
// ============================================
const TICKERS = ['SSI', 'VIX', 'SHB', 'POW', 'VHM', 'HPG', 'MWG', 'FPT', 'VNM', 'MSN']
const PRODUCT_TYPES = ['Cổ phiếu', 'Trái phiếu', 'Chứng chỉ quỹ', 'Phái sinh', 'Margin'] as const
const ORDER_TYPES = ['Mua', 'Bán'] as const
const CHANNELS = ['App PHS', 'Web', 'Môi giới', 'Điện thoại'] as const
const FEE_RATE = 0.002

// Giá tham khảo mỗi ticker (VNĐ)
const TICKER_PRICES: Record<string, [number, number]> = {
  SSI: [22000, 28000],
  VIX: [8000, 12000],
  SHB: [11000, 14000],
  POW: [12000, 16000],
  VHM: [38000, 48000],
  HPG: [24000, 30000],
  MWG: [48000, 58000],
  FPT: [120000, 145000],
  VNM: [68000, 82000],
  MSN: [62000, 78000],
}

// ============================================
// NHÓM A: KH có total_value thực
// ============================================
const GROUP_A: { account_id: string; total_value: number }[] = [
  { account_id: '022C111130', total_value: 71_215_000 },
  { account_id: '022C111160', total_value: 1_474_370_000 },
  { account_id: '022C111218', total_value: 179_700 },
  { account_id: '022C111219', total_value: 196_286_540 },
  { account_id: '022C111220', total_value: 1_391_000 },
  { account_id: '022C111306', total_value: 106_300_000 },
  { account_id: '022C111335', total_value: 1_197_430_000 },
  { account_id: '022C111336', total_value: 26_499_830_000 },
  { account_id: '022C111345', total_value: 2_495_700 },
  { account_id: '022C111420', total_value: 90_481_000 },
]

// ============================================
// HELPERS
// ============================================

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pick<T>(arr: readonly T[]): T {
  return arr[rand(0, arr.length - 1)]
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const d = new Date(s + Math.random() * (e - s))
  return d.toISOString().split('T')[0]
}

function randomTradeTime(): string {
  // HoSE: 09:00–11:30 hoặc 13:00–14:45
  const isMorning = Math.random() < 0.6
  let h: number, m: number, s: number
  if (isMorning) {
    // 09:00 – 11:30
    const totalMin = rand(0, 150) // 150 minutes
    h = 9 + Math.floor(totalMin / 60)
    m = totalMin % 60
  } else {
    // 13:00 – 14:45
    const totalMin = rand(0, 105) // 105 minutes
    h = 13 + Math.floor(totalMin / 60)
    m = totalMin % 60
  }
  s = rand(0, 59)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function roundTo100(n: number): number {
  return Math.round(n / 100) * 100
}

interface TradeRecord {
  account_id: string
  trade_date: string
  trade_time: string
  product_type: string
  ticker: string
  order_type: string
  order_volume: number
  matched_volume: number | null
  price: number
  transaction_value: number
  transaction_fee: number
  status: string
  channel: string
}

// ============================================
// TRADE GENERATORS
// ============================================

function generateGroupATrades(accountId: string, totalValue: number): TradeRecord[] {
  const numTrades = rand(3, 8)
  const trades: TradeRecord[] = []

  // Split totalValue into numTrades portions
  const portions: number[] = []
  let remaining = totalValue
  for (let i = 0; i < numTrades - 1; i++) {
    const minPortion = remaining * 0.05
    const maxPortion = remaining * 0.5
    const portion = randFloat(minPortion, maxPortion)
    portions.push(Math.round(portion))
    remaining -= Math.round(portion)
  }
  portions.push(Math.round(remaining))

  for (const txValue of portions) {
    const ticker = pick(TICKERS)
    const [pLow, pHigh] = TICKER_PRICES[ticker]
    const price = roundTo100(rand(pLow, pHigh))
    const volume = Math.max(100, Math.round(txValue / price / 100) * 100) // round to lot 100
    const actualValue = volume * price
    const status = weightedPick(
      ['Khớp toàn phần', 'Khớp một phần'],
      [0.85, 0.15],
    )
    const matchedVol = status === 'Khớp toàn phần' ? volume : Math.round(volume * randFloat(0.4, 0.9) / 100) * 100 || 100

    trades.push({
      account_id: accountId,
      trade_date: randomDate('2026-01-01', '2026-04-21'),
      trade_time: randomTradeTime(),
      product_type: weightedPick(['Cổ phiếu', 'Margin'], [0.8, 0.2]),
      ticker,
      order_type: pick(ORDER_TYPES),
      order_volume: volume,
      matched_volume: matchedVol,
      price,
      transaction_value: actualValue,
      transaction_fee: Math.round(actualValue * FEE_RATE),
      status,
      channel: weightedPick([...CHANNELS], [0.4, 0.3, 0.2, 0.1]),
    })
  }

  return trades
}

function generateGroupBTrades(accountId: string): TradeRecord[] {
  const numTrades = rand(1, 4)
  const trades: TradeRecord[] = []

  for (let i = 0; i < numTrades; i++) {
    const ticker = pick(TICKERS)
    const [pLow, pHigh] = TICKER_PRICES[ticker]
    const price = roundTo100(rand(pLow, pHigh))
    const txValue = rand(5_000_000, 50_000_000)
    const volume = Math.max(100, Math.round(txValue / price / 100) * 100)
    const actualValue = volume * price
    const status = weightedPick(
      ['Khớp toàn phần', 'Khớp một phần'],
      [0.8, 0.2],
    )
    const matchedVol = status === 'Khớp toàn phần' ? volume : Math.round(volume * randFloat(0.5, 0.9) / 100) * 100 || 100

    trades.push({
      account_id: accountId,
      trade_date: randomDate('2026-01-01', '2026-04-21'),
      trade_time: randomTradeTime(),
      product_type: weightedPick(['Cổ phiếu', 'Margin'], [0.8, 0.2]),
      ticker,
      order_type: pick(ORDER_TYPES),
      order_volume: volume,
      matched_volume: matchedVol,
      price,
      transaction_value: actualValue,
      transaction_fee: Math.round(actualValue * FEE_RATE),
      status,
      channel: weightedPick([...CHANNELS], [0.4, 0.3, 0.2, 0.1]),
    })
  }

  return trades
}

function generateGroupCTrades(accountId: string): TradeRecord[] {
  // 30% KH có 0 trade
  if (Math.random() < 0.3) return []

  const numTrades = rand(1, 2)
  const trades: TradeRecord[] = []

  for (let i = 0; i < numTrades; i++) {
    const ticker = pick(TICKERS)
    const [pLow, pHigh] = TICKER_PRICES[ticker]
    const price = roundTo100(rand(pLow, pHigh))
    const txValue = rand(1_000_000, 20_000_000)
    const volume = Math.max(100, Math.round(txValue / price / 100) * 100)
    const actualValue = volume * price
    const status = weightedPick(
      ['Khớp toàn phần', 'Hủy'],
      [0.7, 0.3],
    )

    trades.push({
      account_id: accountId,
      trade_date: randomDate('2026-01-01', '2026-04-21'),
      trade_time: randomTradeTime(),
      product_type: 'Cổ phiếu',
      ticker,
      order_type: pick(ORDER_TYPES),
      order_volume: volume,
      matched_volume: status === 'Hủy' ? 0 : volume,
      price,
      transaction_value: status === 'Hủy' ? 0 : actualValue,
      transaction_fee: status === 'Hủy' ? 0 : Math.round(actualValue * FEE_RATE),
      status,
      channel: weightedPick([...CHANNELS], [0.4, 0.3, 0.2, 0.1]),
    })
  }

  return trades
}

function generateDemoTrades(accountId: string): TradeRecord[] {
  // 6 tháng gần nhất, đủ các loại product_type
  const trades: TradeRecord[] = []
  const now = new Date()

  for (let monthBack = 0; monthBack < 6; monthBack++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthBack, 1)
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`

    const numTrades = rand(3, 6)
    for (let i = 0; i < numTrades; i++) {
      const productType = i === 0 && monthBack < 5
        ? PRODUCT_TYPES[monthBack % PRODUCT_TYPES.length]
        : weightedPick([...PRODUCT_TYPES], [0.50, 0.10, 0.10, 0.15, 0.15])

      const ticker = pick(TICKERS)
      const [pLow, pHigh] = TICKER_PRICES[ticker]
      const price = roundTo100(rand(pLow, pHigh))
      const txValue = rand(10_000_000, 200_000_000)
      const volume = Math.max(100, Math.round(txValue / price / 100) * 100)
      const actualValue = volume * price
      const status = weightedPick(
        ['Khớp toàn phần', 'Khớp một phần', 'Hủy', 'Chờ khớp'] as const,
        [0.65, 0.15, 0.10, 0.10],
      )
      const matchedVol = status === 'Khớp toàn phần' ? volume
        : status === 'Khớp một phần' ? Math.round(volume * randFloat(0.3, 0.8) / 100) * 100 || 100
        : status === 'Hủy' ? 0
        : null

      trades.push({
        account_id: accountId,
        trade_date: randomDate(startDate, endDate),
        trade_time: randomTradeTime(),
        product_type: productType,
        ticker,
        order_type: pick(ORDER_TYPES),
        order_volume: volume,
        matched_volume: matchedVol,
        price,
        transaction_value: status === 'Hủy' ? 0 : actualValue,
        transaction_fee: status === 'Hủy' ? 0 : Math.round(actualValue * FEE_RATE),
        status,
        channel: pick(CHANNELS),
      })
    }
  }

  return trades
}

// ============================================
// MAIN SEED
// ============================================

async function seedAll() {
  console.log('🚀 Seeding transaction_logs...\n')

  // 1. Fetch all customers to get account_ids with their groups
  const { data: saRecords } = await supabase
    .from('sa_records')
    .select('account_id, customer_group')

  // Build segment map
  const segmentMap = new Map<string, string>()
  for (const r of (saRecords || [])) {
    if (r.account_id && r.customer_group) {
      segmentMap.set(r.account_id, r.customer_group)
    }
  }

  const allTrades: TradeRecord[] = []
  let accountCount = 0

  // Ensure Group A customers exist in DB
  console.log('📦 Ensuring customers exist...')
  const groupACustomers = GROUP_A.map(g => ({
    account_id: g.account_id,
    full_name: `KH ${g.account_id}`,
    branch: 'QUẬN 3',
    status: 'Active',
  }))
  const { error: custErr } = await supabase
    .from('customers')
    .upsert(groupACustomers, { onConflict: 'account_id' })
  if (custErr) console.error('  ⚠️ Customer upsert:', custErr.message)
  else console.log(`  ✅ ${groupACustomers.length} Group A customers ready`)

  // Group A: real total_value
  const groupAIds = new Set(GROUP_A.map(g => g.account_id))
  for (const g of GROUP_A) {
    allTrades.push(...generateGroupATrades(g.account_id, g.total_value))
    accountCount++
    console.log(`  [A] ${g.account_id}: ${allTrades.length} trades (target ≈ ${(g.total_value / 1e6).toFixed(1)}M)`)
  }

  // Group B, C from sa_records (exclude Group A, exclude D/E/F/G/H)
  for (const [accountId, group] of segmentMap.entries()) {
    if (groupAIds.has(accountId)) continue
    const letter = group.charAt(0)

    if (letter === 'B') {
      const trades = generateGroupBTrades(accountId)
      allTrades.push(...trades)
      accountCount++
    } else if (letter === 'C') {
      const trades = generateGroupCTrades(accountId)
      allTrades.push(...trades)
      accountCount++
    }
    // D, E, F, G, H → skip
  }

  console.log(`\n  Group B/C accounts processed. Total so far: ${allTrades.length} trades`)

  // Demo accounts
  const DEMO_IDS = ['DEMO001', 'DEMO002', 'DEMO003']

  // Ensure demo customers exist
  const demoCustomers = DEMO_IDS.map(id => ({
    account_id: id,
    full_name: `Demo Account ${id.slice(-1)}`,
    branch: 'Hội sở',
    status: 'Active',
    vip_tier: id === 'DEMO003' ? 'VIP Gold' : 'Bình thường',
  }))
  await supabase.from('customers').upsert(demoCustomers, { onConflict: 'account_id' })

  for (const demoId of DEMO_IDS) {
    const trades = generateDemoTrades(demoId)
    allTrades.push(...trades)
    accountCount++
    console.log(`  [DEMO] ${demoId}: +${trades.length} trades (6 months)`)
  }

  console.log(`\n📊 Total: ${allTrades.length} trades for ${accountCount} accounts`)

  // Sort by trade_date
  allTrades.sort((a, b) => a.trade_date.localeCompare(b.trade_date))

  // Batch insert
  console.log('\n💾 Inserting...')
  const total = allTrades.length
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = allTrades.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('transaction_logs')
      .insert(batch)

    if (error) {
      console.error(`  ❌ Batch ${i}-${i + batch.length}: ${error.message}`)
    } else {
      console.log(`  ✅ Seeded ${Math.min(i + BATCH_SIZE, total)}/${total} trades`)
    }
  }

  console.log('\n🎉 Transaction seed hoàn tất!')
}

seedAll().catch(err => {
  console.error('💥 Seed failed:', err)
  process.exit(1)
})
