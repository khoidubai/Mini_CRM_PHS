import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Props {
  onClose: () => void
  onImported: () => void
  allowedType?: 'sa' | 'crm' | 'all'
}

type ImportType = 'sa' | 'crm'

export default function ImportModal({ onClose, onImported, allowedType = 'all' }: Props) {
  const [importType, setImportType] = useState<ImportType>(allowedType === 'all' ? 'sa' : allowedType)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json = parseSheetSmart(ws)
      setPreview(json.slice(0, 5))
    }
    reader.readAsArrayBuffer(f)
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    setResult(null)

    try {
      const reader = new FileReader()
      const json: any[] = await new Promise((resolve) => {
        reader.onload = (evt) => {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer)
          const wb = XLSX.read(data, { type: 'array', cellDates: false })
          const ws = wb.Sheets[wb.SheetNames[0]]
          resolve(parseSheetSmart(ws))
        }
        reader.readAsArrayBuffer(file)
      })

      let success = 0
      const errors: string[] = []

      if (importType === 'sa') {
        await importSAData(json, (s, e) => { success = s; errors.push(...e) })
      } else {
        await importCRMData(json, (s, e) => { success = s; errors.push(...e) })
      }

      setResult({ success, errors })
      if (success > 0) onImported()
    } catch (err: any) {
      setResult({ success: 0, errors: [err.message] })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-green-600" />
            Import dữ liệu từ Excel
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Import type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại dữ liệu</label>
            {allowedType !== 'all' ? (
              <div className="px-4 py-2 rounded-lg border text-sm font-medium bg-gray-50 border-gray-300 text-gray-700">
                {allowedType === 'sa' ? 'SA Records (Sale System)' : 'CRM Tickets'}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setImportType('sa')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    importType === 'sa' ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  SA Records (Sale System)
                </button>
                <button
                  onClick={() => setImportType('crm')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                    importType === 'crm' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600'
                  }`}
                >
                  CRM Tickets
                </button>
              </div>
            )}
          </div>

          {/* File upload */}
          <div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
            >
              <Upload size={24} className="text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">{file ? file.name : 'Chọn file Excel'}</p>
                <p className="text-xs text-gray-400">.xlsx hoặc .xls</p>
              </div>
            </button>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Xem trước (5 dòng đầu):</p>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${result.errors.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.errors.length > 0 ? (
                  <AlertTriangle size={18} className="text-yellow-600" />
                ) : (
                  <CheckCircle size={18} className="text-green-600" />
                )}
                <span className="font-medium text-sm">
                  Import thành công: {result.success} bản ghi
                </span>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 20).map((e, i) => <p key={i}>• {e}</p>)}
                  {result.errors.length > 20 && <p>... và {result.errors.length - 20} lỗi khác</p>}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Đóng
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {importing ? 'Đang import...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function parseSheetSmart(ws: XLSX.WorkSheet): any[] {
  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  if (rawRows.length < 2) return []

  // Find the real header row: the first row that has the most non-empty cells
  // and contains recognizable column names
  const knownHeaders = ['số tk', 'tên kh', 'mã ticket', 'stt', 'pic', 'ngày', 'trạng thái', 'danh mục', 'nguồn', 'kết quả']
  let headerIdx = 0
  let bestScore = 0

  for (let i = 0; i < Math.min(5, rawRows.length); i++) {
    const row = rawRows[i]
    const nonEmpty = row.filter((c: any) => String(c).trim() !== '').length
    const matchScore = row.filter((c: any) => {
      const val = String(c).toLowerCase().trim()
      return knownHeaders.some(h => val.includes(h))
    }).length
    const score = nonEmpty + matchScore * 3
    if (score > bestScore) {
      bestScore = score
      headerIdx = i
    }
  }

  const headers = rawRows[headerIdx].map((h: any) => String(h).trim())
  const dataRows = rawRows.slice(headerIdx + 1)

  return dataRows
    .filter(row => row.some((c: any) => String(c).trim() !== ''))
    .map(row => {
      const obj: any = {}
      headers.forEach((h, i) => {
        if (h) obj[h] = row[i] !== undefined ? row[i] : ''
      })
      return obj
    })
}

function excelSerialToDate(serial: number): string {
  // Excel serial → YYYY-MM-DD (UTC)
  const utcDays = Math.floor(serial - 25569)
  const ms = utcDays * 86400 * 1000
  const d = new Date(ms)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function excelDateToJSDate(serial: any): string | null {
  if (serial === null || serial === undefined || serial === '') return null

  // Date object (from cellDates:true or JS)
  if (serial instanceof Date) {
    const y = serial.getFullYear()
    const m = String(serial.getMonth() + 1).padStart(2, '0')
    const d = String(serial.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Number → Excel serial date
  if (typeof serial === 'number' && serial > 1) {
    return excelSerialToDate(serial)
  }

  if (typeof serial === 'string') {
    let str = serial.trim()

    // If multiple dates/values in one cell, try to extract a date pattern
    const datePatterns = str.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g)
    if (datePatterns && datePatterns.length > 0) {
      str = datePatterns[datePatterns.length - 1] // take last date
    }

    // DD/MM/YYYY or DD/MM/YY
    const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
    if (slashMatch) {
      const a = parseInt(slashMatch[1])
      const b = parseInt(slashMatch[2])
      let yr = parseInt(slashMatch[3])
      if (yr < 100) yr += 2000
      // Vietnamese format: DD/MM/YYYY (day first)
      const dd = String(a).padStart(2, '0')
      const mm = String(b).padStart(2, '0')
      return `${yr}-${mm}-${dd}`
    }

    // DD-MM-YYYY
    const dashMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/)
    if (dashMatch) {
      const a = parseInt(dashMatch[1])
      const b = parseInt(dashMatch[2])
      let yr = parseInt(dashMatch[3])
      if (yr < 100) yr += 2000
      const dd = String(a).padStart(2, '0')
      const mm = String(b).padStart(2, '0')
      return `${yr}-${mm}-${dd}`
    }

    // Already YYYY-MM-DD
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str

    // Try as Excel serial number in string form
    const num = Number(str)
    if (!isNaN(num) && num > 10000) {
      return excelSerialToDate(num)
    }

    return null
  }
  return null
}

function findCol(row: any, candidates: string[]): any {
  const keys = Object.keys(row)
  // Pass 1: exact match
  for (const c of candidates) {
    const lower = c.toLowerCase().trim()
    for (const key of keys) {
      if (key.toLowerCase().trim() === lower) return row[key]
    }
  }
  // Pass 2: includes match
  for (const c of candidates) {
    const lower = c.toLowerCase().trim()
    for (const key of keys) {
      if (key.toLowerCase().trim().includes(lower)) return row[key]
    }
  }
  return undefined
}

const BATCH_SIZE = 50

async function importSAData(
  rows: any[],
  callback: (success: number, errors: string[]) => void
) {
  let success = 0
  const errors: string[] = []

  // Collect unique customers and batch upsert
  const customerMap = new Map<string, any>()
  for (const r of rows) {
    const accId = findCol(r, ['Số TK lưu ký', 'Số TK', 'account_id', 'Mã TK', 'STK'])
    if (!accId || customerMap.has(String(accId).trim())) continue
    customerMap.set(String(accId).trim(), {
      account_id: String(accId).trim(),
      full_name: findCol(r, ['Tên KH', 'Họ tên', 'full_name', 'Tên khách hàng']) || '',
      branch: findCol(r, ['Tên CN', 'Chi nhánh', 'branch']) || '',
      status: findCol(r, ['Trạng thái', 'status']) || '',
      vip_tier: findCol(r, ['Phân loại VIP', 'VIP', 'vip_tier']) || 'Bình thường',
    })
  }

  const custBatches = chunkArray([...customerMap.values()], BATCH_SIZE)
  for (const batch of custBatches) {
    const { error } = await supabase.from('customers').upsert(batch, { onConflict: 'account_id' })
    if (error) errors.push(`Customers batch: ${error.message}`)
  }

  // Delete old SA records for these customers, then insert fresh
  const accIds = [...customerMap.keys()]
  const delBatches = chunkArray(accIds, BATCH_SIZE)
  for (const batch of delBatches) {
    const { error } = await supabase.from('sa_records').delete().in('account_id', batch)
    if (error) errors.push(`Delete old SA: ${error.message}`)
  }

  // Build SA records and batch insert
  const records: any[] = []
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const accountId = findCol(r, ['Số TK lưu ký', 'Số TK', 'account_id', 'Mã TK', 'STK'])
    if (!accountId) { errors.push(`Row ${i + 2}: Thiếu Số TK`); continue }

    records.push({
      account_id: String(accountId).trim(),
      pic: String(findCol(r, ['PIC', 'pic', 'Người phụ trách']) || ''),
      call_date: excelDateToJSDate(findCol(r, ['Ngày gọi', 'call_date', 'Ngày'])),
      follow_count: Number(findCol(r, ['Lần follow', 'follow_count', 'Số lần follow'])) || 1,
      call_result: findCol(r, ['Kết quả cuộc gọi', 'call_result', 'Kết quả']) || null,
      interest_level: findCol(r, ['Mức độ quan tâm', 'interest_level']) || null,
      customer_group: findCol(r, ['Nhóm KH', 'customer_group', 'Nhóm']) || null,
      product_introduced: toBool(findCol(r, ['Giới thiệu sản phẩm', 'Giới thiệu SP', 'product_introduced', 'GTSP'])),
      reactivation: toBool(findCol(r, ['Tái kích hoạt TK', 'Tái kích hoạt', 'reactivation'])),
      info_support: toBool(findCol(r, ['Hỗ trợ thông tin', 'Hỗ trợ TT', 'info_support', 'HTTT'])),
      total_transaction_value: toNum(findCol(r, ['Tổng giá trị giao dịch', 'Tổng GTGD', 'total_transaction_value'])),
      transaction_fee: toNum(findCol(r, ['Phí giao dịch', 'Phí GD', 'transaction_fee'])),
      notes: String(findCol(r, ['TL ghi chú', 'Ghi chú', 'notes', 'Note']) || ''),
      handover_rm: String(findCol(r, ['Bàn giao MG chăm sóc', 'Bàn giao MG', 'Bàn giao RM', 'handover_rm']) || ''),
    })
  }

  const saBatches = chunkArray(records, BATCH_SIZE)
  for (const batch of saBatches) {
    const { error } = await supabase.from('sa_records').insert(batch)
    if (error) {
      errors.push(`SA batch: ${error.message}`)
    } else {
      success += batch.length
    }
  }

  callback(success, errors)
}

async function importCRMData(
  rows: any[],
  callback: (success: number, errors: string[]) => void
) {
  let success = 0
  const errors: string[] = []

  // 1. Fetch existing SA account_ids to use as canonical source
  const { data: existingCustomers } = await supabase
    .from('customers')
    .select('account_id')
  const saAccountIds = (existingCustomers || []).map((c: any) => c.account_id as string)

  function resolveMaskedAccount(raw: string): string | null {
    // Strip trailing X's to get the known prefix
    // e.g. '022C11XXXX' → '022C11', '022C1111XX' → '022C1111'
    const prefix = raw.replace(/[Xx]+$/, '')
    if (prefix.length < 3) return null

    // Find all SA account_ids that start with this prefix
    const candidates = saAccountIds.filter(aid => aid.startsWith(prefix))
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }

    // Fallback: try shorter prefixes (in case of extra chars)
    for (let len = prefix.length - 1; len >= 4; len--) {
      const shorter = prefix.substring(0, len)
      const matches = saAccountIds.filter(aid => aid.startsWith(shorter))
      if (matches.length > 0) {
        return matches[Math.floor(Math.random() * matches.length)]
      }
    }

    return null
  }

  // 2. Process rows: resolve masked accounts, collect unique customers
  const customerMap = new Map<string, any>()
  const resolvedRows: { row: any; accountId: string | null; isUnlinked: boolean }[] = []

  for (const r of rows) {
    const rawAccId = String(findCol(r, ['Số TK lưu ký', 'Số TK', 'Số tài khoản', 'account_id', 'Mã TK', 'STK']) || '').trim()
    const customerType = String(findCol(r, ['Loại khách hàng', 'Loại KH', 'customer_type']) || '')

    let accountId: string | null = null
    let isUnlinked = false

    if (!rawAccId || customerType.includes('không có tài khoản') || customerType.includes('khong co')) {
      // KH không có tài khoản → unlinked
      isUnlinked = true
    } else if (rawAccId.match(/[Xx]{2,}$/)) {
      // Masked account (XX) → resolve to random SA match
      accountId = resolveMaskedAccount(rawAccId)
      if (!accountId) isUnlinked = true // No match found
    } else {
      accountId = rawAccId
    }

    // Collect customer for upsert (only non-null, non-existing)
    if (accountId && !customerMap.has(accountId) && !saAccountIds.includes(accountId)) {
      const vipTier = findCol(r, ['Phân loại VIP', 'VIP', 'vip_tier'])
      customerMap.set(accountId, {
        account_id: accountId,
        full_name: findCol(r, ['Tên KH', 'Họ tên', 'full_name', 'Tên khách hàng']) || '',
        vip_tier: vipTier || 'Bình thường',
      })
    }

    resolvedRows.push({ row: r, accountId, isUnlinked })
  }

  // Upsert new customers
  if (customerMap.size > 0) {
    const custBatches = chunkArray([...customerMap.values()], BATCH_SIZE)
    for (const batch of custBatches) {
      const { error } = await supabase.from('customers').upsert(batch, { onConflict: 'account_id' })
      if (error) errors.push(`Customers batch: ${error.message}`)
    }
  }

  // Update VIP tier for existing customers
  for (const r of rows) {
    const rawAccId = String(findCol(r, ['Số TK lưu ký', 'Số TK', 'Số tài khoản', 'account_id', 'Mã TK', 'STK']) || '').trim()
    const vipTier = findCol(r, ['Phân loại VIP', 'VIP', 'vip_tier'])
    if (rawAccId && !rawAccId.match(/[Xx]{2,}$/) && vipTier && vipTier !== 'Bình thường' && saAccountIds.includes(rawAccId)) {
      await supabase.from('customers').update({ vip_tier: vipTier }).eq('account_id', rawAccId)
    }
  }

  // 3. Build tickets
  const tickets: any[] = []
  for (let i = 0; i < resolvedRows.length; i++) {
    const { row: r, accountId, isUnlinked } = resolvedRows[i]
    const ticketCode = findCol(r, ['Mã Ticket', 'Mã ticket', 'ticket_code', 'Số ticket', 'Mã phiếu'])
    if (!ticketCode) { errors.push(`Row ${i + 2}: Thiếu mã ticket`); continue }

    const createdAt = findCol(r, ['Ngày tạo', 'created_at', 'Thời gian tạo'])

    tickets.push({
      ticket_code: String(ticketCode).trim(),
      account_id: accountId,
      created_at: createdAt ? excelDateToJSDate(createdAt) || new Date().toISOString() : new Date().toISOString(),
      category: findCol(r, ['Danh mục hỗ trợ', 'Danh mục', 'category', 'Phân loại danh mục']) || null,
      classification: findCol(r, ['Phân loại', 'classification']) || null,
      customer_type: findCol(r, ['Loại khách hàng', 'Loại KH', 'customer_type']) || null,
      source: findCol(r, ['Nguồn Ticket', 'Nguồn', 'source', 'Kênh']) || null,
      status: findCol(r, ['Tình trạng', 'Trạng thái', 'status']) || 'Đang xử lý',
      priority: findCol(r, ['Mức độ ưu tiên', 'Ưu tiên', 'priority', 'Độ ưu tiên']) || 'Bình thường',
      description: String(findCol(r, ['Mô tả', 'description', 'Nội dung']) || ''),
      resolution: String(findCol(r, ['Hướng xử lý', 'Hướng giải quyết', 'resolution', 'Xử lý']) || ''),
      total_time: toNum(findCol(r, ['Tổng thời gian', 'total_time'])),
      handling_time: toNum(findCol(r, ['Tổng thời gian xử lý', 'Thời gian xử lý', 'handling_time', 'TG xử lý'])),
      is_unlinked: isUnlinked,
    })
  }

  const ticketBatches = chunkArray(tickets, BATCH_SIZE)
  for (const batch of ticketBatches) {
    const { error } = await supabase.from('crm_tickets').upsert(batch, { onConflict: 'ticket_code' })
    if (error) {
      errors.push(`Tickets batch: ${error.message}`)
    } else {
      success += batch.length
    }
  }

  callback(success, errors)
}


function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function toBool(val: any): boolean {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val === 1
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim()
    return lower === 'true' || lower === '1' || lower === 'x' || lower === 'có' || lower === 'yes'
  }
  return false
}

function toNum(val: any): number | null {
  if (val === '' || val === null || val === undefined) return null
  const num = Number(val)
  return isNaN(num) ? null : num
}
