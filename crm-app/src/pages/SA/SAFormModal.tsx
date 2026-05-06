import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { SARecord, Customer, CallResult, InterestLevel, CustomerGroup, RecordSnapshot } from '../../types'
import { X, History, FileEdit, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  )
}

interface Props {
  record: (SARecord & { customers?: Customer }) | null
  customers: Customer[]
  onClose: () => void
  onSaved: () => void
}

const callResults: CallResult[] = [
  'Nghe máy – trao đổi',
  'Không nghe máy / không bắt máy',
  'Thuê bao / số không tồn tại',
  'Không có thông tin liên hệ',
  'Trực tiếp',
]

const interestLevels: InterestLevel[] = [
  'Rất quan tâm – muốn giao dịch ngay',
  'Quan tâm – cần follow thêm',
  'Nghe nhưng chưa có nhu cầu',
  'Không quan tâm',
]

const customerGroups: CustomerGroup[] = [
  'A – Rất tiềm năng',
  'B – Tiềm năng',
  'C – Nuôi dưỡng',
  'D – Không tiềm năng',
  'E – Không nghe máy',
  'F – SĐT không hợp lệ',
  'G – Không có SĐT',
  'H – Tài khoản ảo',
]

const indirectTypes = [
  'Nạp phí liên tục hàng tháng',
  'KH mới mở TK được giới thiệu',
]

export default function SAFormModal({ record, customers, onClose, onSaved }: Props) {
  const { user } = useAuth()
  const isEdit = !!record
  const [tab, setTab] = useState<'form' | 'history'>('form')

  const [form, setForm] = useState({
    account_id: record?.account_id || '',
    pic: record?.pic || user?.pic_name || user?.full_name || '',
    call_date: record?.call_date || new Date().toISOString().split('T')[0],
    follow_count: record?.follow_count || 1,
    call_result: record?.call_result || '',
    interest_level: record?.interest_level || '',
    customer_group: record?.customer_group || '',
    product_introduced: record?.product_introduced || false,
    reactivation: record?.reactivation || false,
    info_support: record?.info_support || false,
    total_transaction_value: record?.total_transaction_value ?? '',
    transaction_fee: record?.transaction_fee ?? '',
    indirect_type: record?.indirect_type || '',
    indirect_fee: record?.indirect_fee ?? '',
    notes: record?.notes || '',
    handover_rm: record?.handover_rm || '',
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showInterestLevel = form.call_result === 'Nghe máy – trao đổi' || form.call_result === 'Trực tiếp'

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.account_id === form.account_id) || null,
    [form.account_id, customers]
  )

  const history: RecordSnapshot[] = record?.record_history || []

  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'call_result' && value !== 'Nghe máy – trao đổi' && value !== 'Trực tiếp') {
      setForm((prev) => ({ ...prev, interest_level: '' }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const showInterest = form.call_result === 'Nghe máy – trao đổi' || form.call_result === 'Trực tiếp'

      const payload: any = {
        account_id: form.account_id,
        pic: form.pic,
        pic_user_id: (record as any)?.pic_user_id || user?.id || null,
        call_date: form.call_date,
        follow_count: form.follow_count,
        call_result: form.call_result || null,
        interest_level: showInterest ? (form.interest_level || null) : null,
        customer_group: form.customer_group || null,
        product_introduced: form.product_introduced,
        reactivation: form.reactivation,
        info_support: form.info_support,
        total_transaction_value: form.total_transaction_value !== '' ? Number(form.total_transaction_value) : null,
        transaction_fee: form.transaction_fee !== '' ? Number(form.transaction_fee) : null,
        indirect_type: form.indirect_type || null,
        indirect_fee: form.indirect_fee !== '' ? Number(form.indirect_fee) : null,
        notes: form.notes,
        handover_rm: form.handover_rm,
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        // Push current state to history before updating
        const snapshot: RecordSnapshot = {
          snapshot_at: record.updated_at || record.created_at,
          changed_by: record.pic || '',
          data: {
            call_date: record.call_date,
            call_result: record.call_result,
            interest_level: record.interest_level,
            customer_group: record.customer_group,
            follow_count: record.follow_count,
            reactivation: record.reactivation,
            total_transaction_value: record.total_transaction_value,
            transaction_fee: record.transaction_fee,
            indirect_type: record.indirect_type,
            indirect_fee: record.indirect_fee,
            notes: record.notes,
            handover_rm: record.handover_rm,
          },
        }
        payload.record_history = [...history, snapshot]

        const { error } = await supabase.from('sa_records').update(payload).eq('id', record.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('sa_records').insert(payload)
        if (error) throw error
      }

      onSaved()
      setToast({ type: 'success', message: isEdit ? 'Cập nhật thành công!' : 'Tạo record thành công!' })
      setTimeout(onClose, 1200)
    } catch (err: any) {
      setError(err.message)
      setToast({ type: 'error', message: err.message || 'Lưu thất bại, vui lòng thử lại.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Cập nhật SA Record' : 'Tạo SA Record mới'}
          </h3>
          <div className="flex items-center gap-2">
            {isEdit && (
              <>
                <button
                  type="button"
                  onClick={() => setTab('form')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'form' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <FileEdit size={13} /> Thông tin
                </button>
                <button
                  type="button"
                  onClick={() => setTab('history')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === 'history' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <History size={13} /> Lịch sử {history.length > 0 && <span className="bg-amber-100 text-amber-700 rounded-full px-1.5">{history.length}</span>}
                </button>
              </>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ===== HISTORY TAB ===== */}
        {tab === 'history' && (
          <div className="p-6 space-y-3">
            {/* Current state */}
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Hiện tại</span>
                <span className="text-xs text-gray-500">{record?.updated_at ? new Date(record.updated_at).toLocaleString('vi-VN') : ''}</span>
                <span className="text-xs text-gray-500">bởi {record?.pic}</span>
              </div>
              <SnapshotDetail data={record as any} />
            </div>
            {/* Past snapshots (newest first) */}
            {[...history].reverse().map((snap, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">Lần {history.length - i}</span>
                  <span className="text-xs text-gray-500">{new Date(snap.snapshot_at).toLocaleString('vi-VN')}</span>
                  <span className="text-xs text-gray-500">bởi {snap.changed_by}</span>
                </div>
                <SnapshotDetail data={snap.data as any} />
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">Chưa có lịch sử chỉnh sửa</p>
            )}
          </div>
        )}

        {/* ===== FORM TAB ===== */}
        {tab === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
            )}

            {/* Account select */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số TK lưu ký *</label>
                <input
                  value={form.account_id}
                  onChange={(e) => handleChange('account_id', e.target.value.trim())}
                  disabled={isEdit}
                  required
                  placeholder="VD: 123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIC</label>
                {user?.role === 'sa' ? (
                  <input value={form.pic} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700" />
                ) : (
                  <input value={form.pic} onChange={(e) => handleChange('pic', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                )}
              </div>
            </div>

            {/* Customer info card */}
            {selectedCustomer && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500 text-xs">Tên KH</span><div className="font-medium truncate">{selectedCustomer.full_name}</div></div>
                <div><span className="text-gray-500 text-xs">Chi nhánh</span><div className="font-medium">{selectedCustomer.branch || '—'}</div></div>
                <div><span className="text-gray-500 text-xs">Trạng thái TK</span><div className="font-medium truncate">{selectedCustomer.status || '—'}</div></div>
              </div>
            )}

            {/* Call info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày gọi</label>
                <input type="date" value={form.call_date} onChange={(e) => handleChange('call_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lần follow</label>
                <input type="number" min={1} value={form.follow_count} onChange={(e) => handleChange('follow_count', parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kết quả gọi</label>
                <select value={form.call_result} onChange={(e) => handleChange('call_result', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">— Chọn —</option>
                  {callResults.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm KH</label>
                <select value={form.customer_group} onChange={(e) => handleChange('customer_group', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">— Chọn —</option>
                  {customerGroups.map((cg) => <option key={cg} value={cg}>{cg}</option>)}
                </select>
              </div>
            </div>

            {showInterestLevel && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ quan tâm</label>
                <select value={form.interest_level} onChange={(e) => handleChange('interest_level', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">— Chọn —</option>
                  {interestLevels.map((il) => <option key={il!} value={il!}>{il}</option>)}
                </select>
              </div>
            )}

            {/* Tái kích hoạt GD */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-emerald-800">💳 Tái kích hoạt giao dịch</h4>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.reactivation} onChange={(e) => handleChange('reactivation', e.target.checked)} className="rounded border-gray-300" />
                  <span className="text-emerald-700 font-medium">Tái kích hoạt</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">Có phí GD {'>'} 0 = tính kích hoạt thành công</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Giá trị GD (VNĐ)</label>
                  <input type="number" value={form.total_transaction_value} onChange={(e) => handleChange('total_transaction_value', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phí GD (VNĐ)</label>
                  <input type="number" value={form.transaction_fee} onChange={(e) => handleChange('transaction_fee', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                </div>
              </div>
            </div>

            {/* Đóng góp gián tiếp */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-green-800">💰 Đóng góp gián tiếp doanh thu</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Loại đóng góp</label>
                  <select value={form.indirect_type} onChange={(e) => handleChange('indirect_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="">— Chọn —</option>
                    {indirectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Giá trị (VNĐ)</label>
                  <input type="number" value={form.indirect_fee} onChange={(e) => handleChange('indirect_fee', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0" />
                </div>
              </div>
            </div>

            {/* Bàn giao + Giới thiệu SP + Hỗ trợ TT */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bàn giao MG/RM</label>
                <input value={form.handover_rm} onChange={(e) => handleChange('handover_rm', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Tên MG/RM nhận bàn giao" />
              </div>
              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.product_introduced} onChange={(e) => handleChange('product_introduced', e.target.checked)} className="rounded border-gray-300" />
                  Giới thiệu sản phẩm
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.info_support} onChange={(e) => handleChange('info_support', e.target.checked)} className="rounded border-gray-300" />
                  Hỗ trợ thông tin
                </label>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  )
}

function SnapshotDetail({ data }: { data: Partial<SARecord> }) {
  const fields = [
    { label: 'Ngày gọi', value: data.call_date },
    { label: 'Kết quả gọi', value: data.call_result },
    { label: 'Mức độ QT', value: data.interest_level },
    { label: 'Nhóm KH', value: data.customer_group },
    { label: 'Follow', value: data.follow_count },
    { label: 'Tái KH', value: data.reactivation ? 'Có' : 'Không' },
    { label: 'GTGD', value: data.total_transaction_value != null ? data.total_transaction_value.toLocaleString('vi-VN') + ' ₫' : null },
    { label: 'Phí GD', value: data.transaction_fee != null ? data.transaction_fee.toLocaleString('vi-VN') + ' ₫' : null },
    { label: 'Loại đóng góp', value: data.indirect_type },
    { label: 'GT đóng góp', value: data.indirect_fee != null ? data.indirect_fee.toLocaleString('vi-VN') + ' ₫' : null },
    { label: 'Bàn giao', value: data.handover_rm },
    { label: 'Ghi chú', value: data.notes },
  ].filter((f) => f.value != null && f.value !== '' && f.value !== 0)

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {fields.map((f) => (
        <div key={f.label} className="text-xs">
          <span className="text-gray-400">{f.label}: </span>
          <span className="text-gray-700 font-medium">{String(f.value)}</span>
        </div>
      ))}
    </div>
  )
}
