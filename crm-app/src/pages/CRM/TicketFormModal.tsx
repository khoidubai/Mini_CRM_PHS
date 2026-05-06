import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { CRMTicket, Customer, TicketCategory, TicketStatus, TicketSource, CustomerType } from '../../types'
import { X, AlertTriangle, Search, Link2, Link2Off } from 'lucide-react'
import { ERROR_CODES, ERROR_GROUPS } from '../../data/errorCodes'

interface Props {
  ticket: (CRMTicket & { customers?: Customer | null }) | null
  customers: Customer[]
  onClose: () => void
  onSaved: () => void
}

const categories: TicketCategory[] = [
  'Quản lý Tài khoản PHS', 'Khác', 'Thay đổi bậc VIP',
  'Hỗ trợ Giao dịch', 'Failed E-Kyc', 'CMSN', 'Khảo sát E-kyc',
  'Nạp và Rút tiền', 'Công văn', 'Dịch vụ CSKH', 'Ứng dụng PHS', 'Môi giới',
]

const statuses: TicketStatus[] = ['Đã đóng', 'Đang xử lý', 'Chờ phản hồi']
const sources: TicketSource[] = ['Email', 'Hotline', 'Zalo', 'Chatbot_1', 'Mobile_app']
const customerTypes: CustomerType[] = ['KH có tài khoản', 'KH không có tài khoản']

async function generateTicketCode(): Promise<string> {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(-2)
  const prefix = `#${dd}${mm}${yy}`

  const { data } = await supabase
    .from('crm_tickets')
    .select('ticket_code')
    .like('ticket_code', `${prefix}%`)
    .order('ticket_code', { ascending: false })
    .limit(1)

  let seq = 1
  if (data && data.length > 0) {
    const lastCode = data[0].ticket_code
    const lastSeq = parseInt(lastCode.slice(prefix.length), 10)
    if (!isNaN(lastSeq)) seq = lastSeq + 1
  }

  return `${prefix}${String(seq).padStart(3, '0')}`
}

export default function TicketFormModal({ ticket, customers, onClose, onSaved }: Props) {
  const isEdit = !!ticket

  const [form, setForm] = useState({
    ticket_code: ticket?.ticket_code || '',
    account_id: ticket?.account_id || '',
    category: ticket?.category || '',
    classification: ticket?.classification || '',
    customer_type: ticket?.customer_type || 'KH có tài khoản',
    source: ticket?.source || '',
    status: ticket?.status || 'Đang xử lý',
    priority: ticket?.priority || 'Bình thường',
    description: ticket?.description || '',
    resolution: ticket?.resolution || '',
    total_time: ticket?.total_time ?? '',
    handling_time: ticket?.handling_time ?? '',
    error_code: ticket?.error_code || '',
    error_custom: ticket?.error_custom || '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [generatingCode, setGeneratingCode] = useState(false)
  const [linkMode, setLinkMode] = useState<'none' | 'linked'>(ticket?.account_id ? 'linked' : 'none')
  const [accountSearch, setAccountSearch] = useState(
    ticket?.account_id ? `${ticket.account_id}${ticket.customers?.full_name ? ' — ' + ticket.customers.full_name : ''}` : ''
  )
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = accountSearch.trim().length >= 1
    ? customers.filter(c =>
        c.account_id.toLowerCase().includes(accountSearch.toLowerCase()) ||
        (c.full_name || '').toLowerCase().includes(accountSearch.toLowerCase())
      ).slice(0, 8)
    : []

  useEffect(() => {
    if (!isEdit) {
      setGeneratingCode(true)
      generateTicketCode().then((code) => {
        setForm((prev) => ({ ...prev, ticket_code: code }))
        setGeneratingCode(false)
      })
    }
  }, [])

  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const accountId = form.account_id || null
    const payload = {
      ticket_code: form.ticket_code,
      account_id: accountId,
      category: form.category || null,
      classification: form.classification || null,
      customer_type: form.customer_type || null,
      source: form.source || null,
      status: form.status,
      priority: form.priority,
      description: form.description,
      resolution: form.resolution || null,
      total_time: form.total_time !== '' ? Number(form.total_time) : null,
      handling_time: form.handling_time !== '' ? Number(form.handling_time) : null,
      is_unlinked: !accountId,
      created_at: ticket?.created_at || new Date().toISOString(),
      error_code: form.error_code || null,
      error_custom: form.error_code === 'ĐB000' ? (form.error_custom || null) : null,
    }

    try {
      if (isEdit) {
        const { error } = await supabase.from('crm_tickets').update(payload).eq('id', ticket.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('crm_tickets').insert(payload)
        if (error) throw error
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? `Ticket ${ticket.ticket_code}` : 'Tạo Ticket mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã Ticket *</label>
              <input
                value={generatingCode ? 'Đang tạo mã...' : form.ticket_code}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số TK lưu ký (optional)</label>
              <div className="flex gap-2 mb-2">
                <button type="button"
                  onClick={() => { setLinkMode('none'); handleChange('account_id', ''); setAccountSearch('') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    linkMode === 'none' ? 'bg-gray-100 border-gray-400 text-gray-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Link2Off size={13} /> Không link
                </button>
                <button type="button"
                  onClick={() => { setLinkMode('linked'); setShowSuggestions(true) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    linkMode === 'linked' ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Link2 size={13} /> Có link KH
                </button>
              </div>
              {linkMode === 'linked' && (
                <div className="relative">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={accountSearch}
                      onChange={(e) => {
                        setAccountSearch(e.target.value)
                        setShowSuggestions(true)
                        if (!e.target.value) handleChange('account_id', '')
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Nhập mã TK hoặc tên KH..."
                      className="w-full pl-8 pr-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {suggestions.map(c => (
                        <li key={c.account_id}
                          onMouseDown={() => {
                            handleChange('account_id', c.account_id)
                            setAccountSearch(`${c.account_id} — ${c.full_name || ''}`)
                            setShowSuggestions(false)
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-2"
                        >
                          <span className="font-mono text-xs text-blue-700 font-semibold">{c.account_id}</span>
                          <span className="text-gray-600 truncate">{c.full_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {showSuggestions && accountSearch.length > 0 && suggestions.length === 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow mt-1 px-3 py-2 text-xs text-gray-400">
                      Không tìm thấy tài khoản
                    </div>
                  )}
                  {form.account_id && (
                    <p className="text-xs text-blue-600 mt-1 font-mono">✓ Đã chọn: {form.account_id}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">— Chọn —</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
              <input
                value={form.classification}
                onChange={(e) => handleChange('classification', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Yêu cầu xử lý"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại KH</label>
              <select value={form.customer_type} onChange={(e) => handleChange('customer_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {customerTypes.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
              <select value={form.source} onChange={(e) => handleChange('source', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">— Chọn —</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ưu tiên</label>
              <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="Bình thường">Bình thường</option>
                <option value="Cao">Cao</option>
                <option value="Khẩn cấp">Khẩn cấp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng thời gian (phút)</label>
              <input
                type="number"
                value={form.total_time}
                onChange={(e) => handleChange('total_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian xử lý (phút)</label>
              <input
                type="number"
                value={form.handling_time}
                onChange={(e) => handleChange('handling_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Error Code */}
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">Mã lỗi (optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chọn mã lỗi</label>
                <select
                  value={form.error_code}
                  onChange={(e) => handleChange('error_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="">— Không có lỗi —</option>
                  {ERROR_GROUPS.map(group => (
                    <optgroup key={group} label={group}>
                      {ERROR_CODES.filter(e => e.group === group).map(e => (
                        <option key={e.code} value={e.code}>{e.code} — {e.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                {form.error_code === 'ĐB000' ? (
                  <>
                    <label className="block text-xs text-gray-600 mb-1">Mô tả lỗi cụ thể *</label>
                    <input
                      value={form.error_custom}
                      onChange={(e) => handleChange('error_custom', e.target.value)}
                      placeholder="Nhập mô tả lỗi..."
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </>
                ) : form.error_code ? (
                  <div className="flex items-center h-full">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-mono font-semibold">
                      {form.error_code}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hướng giải quyết</label>
            <textarea
              value={form.resolution}
              onChange={(e) => handleChange('resolution', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
