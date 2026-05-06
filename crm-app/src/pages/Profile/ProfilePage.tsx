import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Save, User, Mail, Phone, Building, BadgeCheck, Hash } from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const profile = user?.profile

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    pic_name: profile?.pic_name || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
    employee_code: profile?.employee_code || '',
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: err } = await supabase
      .from('user_profiles')
      .update({
        full_name: form.full_name || null,
        pic_name: form.pic_name || null,
        phone: form.phone || null,
        department: form.department || null,
        employee_code: form.employee_code || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id)

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      await refreshProfile()
    }
    setSaving(false)
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ nhân viên</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.full_name || user.email}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="inline-flex items-center gap-1"><Mail size={14} /> {user.email}</span>
              <span className="uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{user.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">Cập nhật thành công!</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <User size={14} /> Họ tên
              </label>
              <input value={form.full_name} onChange={e => handleChange('full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <BadgeCheck size={14} /> Tên PIC (mapping SA)
              </label>
              <input value={form.pic_name} onChange={e => handleChange('pic_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Tên hiển thị trong cột PIC" />
              <p className="text-xs text-gray-400 mt-1">Nhập đúng tên PIC trong file Excel SA để hệ thống mapping tự động</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Hash size={14} /> Mã nhân viên
              </label>
              <input value={form.employee_code} onChange={e => handleChange('employee_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="PHS001" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Phone size={14} /> Số điện thoại
              </label>
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0901234567" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Building size={14} /> Phòng ban
              </label>
              <input value={form.department} onChange={e => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Phòng CSKH" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                <Building size={14} /> Chi nhánh
              </label>
              {user.role === 'sa' ? (
                <input value={profile?.branch || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                  placeholder="Do admin phân công" />
              ) : (
                <input value={user.role === 'ccc' ? 'Hội sở' : '—'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-purple-700 font-medium" />
              )}
              <p className="text-xs text-gray-400 mt-1">Được phân công bởi admin</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
        <p><strong>Lưu ý quan trọng:</strong></p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><strong>Tên PIC</strong> phải khớp chính xác với tên PIC trong file Excel SA để hệ thống tự gán record cho bạn.</li>
          <li>Khi tạo SA Record mới, hệ thống sẽ tự động gán PIC = tên PIC của bạn.</li>
          <li>Nhân viên SA chỉ xem được các records có PIC trùng với mình.</li>
        </ul>
      </div>
    </div>
  )
}
