import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { UserProfile, UserRole } from '../../lib/supabase'
import { Plus, Pencil, X, Check, Shield, ShieldOff, Search, UserPlus } from 'lucide-react'

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'sa',    label: 'SA',    color: 'bg-green-100 text-green-700' },
  { value: 'sup',   label: 'SUP',   color: 'bg-orange-100 text-orange-700' },
  { value: 'ccc',   label: 'CCC',   color: 'bg-purple-100 text-purple-700' },
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700' },
]

function autoKpiType(role: UserRole): 'sa' | 'sup' {
  return role === 'sup' ? 'sup' : 'sa'
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterBranch, setFilterBranch] = useState<string>('all')

  useEffect(() => { fetchProfiles() }, [])

  async function fetchProfiles() {
    setLoading(true)
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setProfiles((data || []) as UserProfile[])
    setLoading(false)
  }

  const branches = Array.from(new Set(profiles.filter(p => p.branch).map(p => p.branch!))).sort()

  const filtered = profiles.filter(p => {
    if (filterRole !== 'all' && p.role !== filterRole) return false
    if (filterBranch !== 'all') {
      if (filterBranch === 'hoi-so' && p.role !== 'ccc') return false
      if (filterBranch !== 'hoi-so' && p.branch !== filterBranch) return false
    }
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.email?.toLowerCase().includes(q) ||
      p.full_name?.toLowerCase().includes(q) ||
      p.pic_name?.toLowerCase().includes(q) ||
      p.employee_code?.toLowerCase().includes(q) ||
      p.branch?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Nhân viên</h2>
          <p className="text-sm text-gray-500 mt-1">{profiles.length} tài khoản</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <UserPlus size={18} /> Tạo tài khoản
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm theo email, tên, PIC, mã NV, chi nhánh..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">Tất cả role</option>
          <option value="sa">SA</option>
          <option value="sup">SUP</option>
          <option value="ccc">CCC</option>
          <option value="admin">Admin</option>
        </select>
        <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">Tất cả chi nhánh</option>
          <option value="hoi-so">Hội sở (CCC)</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Họ tên</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tên PIC</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mã NV</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Chi nhánh</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Phòng ban</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">SĐT</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-sm text-gray-700">{p.email}</td>
                    <td className="px-4 py-3 text-gray-700">{p.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.pic_name || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{p.employee_code || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.role === 'ccc' ? <span className="text-xs text-purple-600 font-medium">Hội sở</span> : (p.branch || '—')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.department || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase w-fit ${ROLES.find(r => r.value === p.role)?.color || 'bg-gray-100 text-gray-600'}`}>
                          {p.role}
                        </span>
                        {(p.role === 'sa' || p.role === 'sup') && p.kpi_type && (
                          <span className="text-[9px] text-violet-500 font-medium">KPI: {p.kpi_type.toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                          <Shield size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                          <ShieldOff size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditId(p.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">Không có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={fetchProfiles} />}
      {editId && <EditUserModal profile={profiles.find(p => p.id === editId)!} onClose={() => setEditId(null)} onSaved={fetchProfiles} />}
    </div>
  )
}

/* ========== CREATE USER MODAL ========== */
function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    email: '', password: '', role: 'sa' as UserRole,
    full_name: '', pic_name: '', employee_code: '', phone: '', department: '', branch: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Email và mật khẩu bắt buộc'); return }
    if (form.password.length < 6) { setError('Mật khẩu phải >= 6 ký tự'); return }
    setSaving(true)

    try {
      // 1. Create auth user via Supabase (signUp won't sign in because we're already signed in as admin)
      // Use the admin approach: insert directly into user_profiles after signup
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            role: form.role,
            full_name: form.full_name,
            pic_name: form.pic_name,
          }
        }
      })
      if (signUpErr) throw signUpErr
      if (!signUpData.user) throw new Error('Không tạo được user')

      // 2. Update user_profiles with full info (trigger already created basic profile)
      // Wait a moment for trigger to create the profile
      await new Promise(r => setTimeout(r, 500))
      const { data: updateData, error: updateErr } = await supabase
        .from('user_profiles')
        .update({
          full_name: form.full_name || null,
          pic_name: form.pic_name || null,
          employee_code: form.employee_code || null,
          phone: form.phone || null,
          department: form.department || null,
          branch: (form.role === 'sa' || form.role === 'sup') ? (form.branch || null) : null,
          role: form.role,
          kpi_type: (form.role === 'sa' || form.role === 'sup') ? autoKpiType(form.role) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', signUpData.user.id)
        .select()

      if (updateErr) throw updateErr
      if (!updateData || updateData.length === 0) throw new Error('Không thể cập nhật profile — kiểm tra RLS policies')

      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Tạo tài khoản mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="nv@phs.vn" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Tối thiểu 6 ký tự" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => handleChange('role', r.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.role === r.value ? r.color + ' border-current' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input value={form.full_name} onChange={e => handleChange('full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên PIC (mapping SA)</label>
              <input value={form.pic_name} onChange={e => handleChange('pic_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Tên trong cột PIC" />
            </div>
          </div>

          {(form.role === 'sa' || form.role === 'sup') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
              <input value={form.branch} onChange={e => handleChange('branch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="VD: CN Quận 1, CN Bình Thạnh" />
            </div>
          )}
          {(form.role === 'ccc' || form.role === 'admin') && (
            <div className="text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
              {form.role === 'ccc' ? '📍 CCC → Hội sở (mặc định)' : '📍 Admin → Hội sở'}
            </div>
          )}
          {form.role === 'sup' && (
            <div className="text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
              📊 SUP → KPI khung Supervisor (Phần A: 24%+15%+11%+10%)
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã NV</label>
              <input value={form.employee_code} onChange={e => handleChange('employee_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="PHS001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="0901234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <input value={form.department} onChange={e => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Phòng CSKH" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Plus size={16} /> {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ========== EDIT USER MODAL ========== */
function EditUserModal({ profile, onClose, onSaved }: { profile: UserProfile; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    role: profile.role,
    full_name: profile.full_name || '',
    pic_name: profile.pic_name || '',
    employee_code: profile.employee_code || '',
    phone: profile.phone || '',
    department: profile.department || '',
    branch: profile.branch || '',
    is_active: profile.is_active,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { data: updateData, error: updateErr } = await supabase
        .from('user_profiles')
        .update({
          role: form.role,
          full_name: form.full_name || null,
          pic_name: form.pic_name || null,
          employee_code: form.employee_code || null,
          phone: form.phone || null,
          department: form.department || null,
          branch: (form.role === 'sa' || form.role === 'sup') ? (form.branch || null) : null,
          is_active: form.is_active,
          kpi_type: (form.role === 'sa' || form.role === 'sup') ? autoKpiType(form.role) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()

      if (updateErr) throw updateErr
      if (!updateData || updateData.length === 0) throw new Error('Không thể cập nhật — kiểm tra quyền admin (RLS policy)')

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa nhân viên</h3>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <div className="flex gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => handleChange('role', r.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${form.role === r.value ? r.color + ' border-current' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => handleChange('is_active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className={form.is_active ? 'text-green-700' : 'text-red-600'}>
                {form.is_active ? 'Tài khoản đang hoạt động' : 'Tài khoản bị vô hiệu hoá'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input value={form.full_name} onChange={e => handleChange('full_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên PIC (SA)</label>
              <input value={form.pic_name} onChange={e => handleChange('pic_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          {(form.role === 'sa' || form.role === 'sup') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
              <input value={form.branch} onChange={e => handleChange('branch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="VD: CN Quận 1" />
            </div>
          )}
          {(form.role === 'ccc' || form.role === 'admin') && (
            <div className="text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
              {form.role === 'ccc' ? '📍 CCC → Hội sở (mặc định)' : '📍 Admin → Hội sở'}
            </div>
          )}
          {form.role === 'sup' && (
            <div className="text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
              📊 SUP → KPI khung Supervisor (Phần A: 24%+15%+11%+10%)
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã NV</label>
              <input value={form.employee_code} onChange={e => handleChange('employee_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
              <input value={form.department} onChange={e => handleChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Check size={16} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
