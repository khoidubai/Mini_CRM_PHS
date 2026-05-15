import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SARecord, Customer, CallResult } from '../../types'
import { GroupBadge } from '../../components/Badge'
import { Search, Filter, Plus, ChevronDown, ChevronUp, ArrowRightLeft, Upload, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import Pagination from '../../components/Pagination'
import SAFormModal from './SAFormModal'
import ImportModal from '../../components/ImportModal'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

interface SARecordWithCustomer extends SARecord {
  customers: Customer
}

export default function SAList() {
  const { user } = useAuth()
  const [records, setRecords] = useState<SARecordWithCustomer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<SARecordWithCustomer | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showGroupAB, setShowGroupAB] = useState(false)
  // Filters
  const [filterGroup, setFilterGroup] = useState<string>('')
  const [filterPIC, setFilterPIC] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterCallResult, setFilterCallResult] = useState<string>('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Sort
  const [sortField, setSortField] = useState<string>('customer_group')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => { setPage(1) }, [filterGroup, filterPIC, filterBranch, filterCallResult, filterDateFrom, filterDateTo, searchQuery])

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)

    // Fetch branch colleagues for SA users
    let cIds = new Set<string>()
    let cPics = new Set<string>()
    if (user?.role === 'sa' && user.profile?.branch) {
      const { data: branchUsers } = await supabase
        .from('user_profiles')
        .select('id, pic_name')
        .eq('branch', user.profile.branch)
        .eq('role', 'sa')
        .eq('is_active', true)
      if (branchUsers) {
        for (const u of branchUsers) {
          if (u.id !== user.id) {
            cIds.add(u.id)
            if (u.pic_name) cPics.add(u.pic_name.toLowerCase())
          }
        }
      }
    }
    const [custRes, saRes] = await Promise.all([
      supabase.from('customers').select('*').order('account_id'),
      supabase.from('sa_records').select('*').order('call_date', { ascending: false }),
    ])
    const custs = custRes.data || []
    setCustomers(custs)
    const custMap = new Map(custs.map(c => [c.account_id, c]))

    if (saRes.data) {
      let saData = saRes.data
      if (user?.role === 'sa') {
        // Show own records + colleagues in same branch
        const ownId = user.id
        const ownPic = user.pic_name?.toLowerCase()
        saData = saData.filter(r =>
          r.pic_user_id === ownId ||
          (ownPic && r.pic?.toLowerCase() === ownPic) ||
          (r.pic_user_id && cIds.has(r.pic_user_id)) ||
          (r.pic && cPics.has(r.pic.toLowerCase()))
        )
      }
      setRecords(saData.map(r => ({
        ...r,
        customers: r.account_id ? custMap.get(r.account_id) || null : null,
      })) as any)
    }
    setLoading(false)
  }

  function isOwnRecord(r: SARecord): boolean {
    if (!user) return true
    return r.pic_user_id === user.id ||
      !!(user.pic_name && r.pic?.toLowerCase() === user.pic_name.toLowerCase())
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('account_id')
    if (data) setCustomers(data)
  }

  async function fetchRecords() {
    await fetchAll()
  }

  function exportTemplate() {
    const headers = [
      'Số TK lưu ký', 'Tên KH', 'Tên CN', 'Trạng thái', 'Phân loại VIP',
      'PIC', 'Ngày gọi', 'Lần follow',
      'Kết quả cuộc gọi', 'Mức độ quan tâm', 'Nhóm KH',
      'Giới thiệu sản phẩm', 'Tái kích hoạt TK', 'Hỗ trợ thông tin',
      'Tổng giá trị giao dịch', 'Phí giao dịch',
      'TL ghi chú', 'Bàn giao MG chăm sóc',
    ]
    const sample = [
      '022C1234', 'Nguyễn Văn A', 'Hà Nội', 'Active', 'Bình thường',
      'Trần Thị B', '15/04/2025', 1,
      'Nghe máy – trao đổi', 'Quan tâm – cần follow thêm', 'B – Tiềm năng',
      'Có', 'Không', 'Có',
      5000000, 250000,
      'KH quan tâm sản phẩm, hẹn gọi lại', '',
    ]
    const guide = [
      ['Cột', 'Giá trị hợp lệ'],
      ['Kết quả cuộc gọi', 'Nghe máy – trao đổi | Không nghe máy / không bắt máy | Thuê bao / số không tồn tại | Không có thông tin liên hệ | Trực tiếp'],
      ['Nhóm KH', 'A – Rất tiềm năng | B – Tiềm năng | C – Nuôi dưỡng | D – Không tiềm năng | E – Không nghe máy | F – SĐT không hợp lệ | G – Không có SĐT | H – Tài khoản ảo'],
      ['Mức độ quan tâm', 'Rất quan tâm – muốn giao dịch ngay | Quan tâm – cần follow thêm | Nghe nhưng chưa có nhu cầu | Không quan tâm'],
      ['Phân loại VIP', 'Bình thường | VIP Gold | VIP Platinum | VIP Diamond'],
      ['Giới thiệu sản phẩm / Tái kích hoạt / Hỗ trợ TT', 'Có (hoặc Có, TRUE, 1) / Không (hoặc Không, FALSE, 0)'],
      ['Ngày gọi', 'DD/MM/YYYY hoặc YYYY-MM-DD'],
      ['Trạng thái', 'Active / Inactive / … (tuỳ hệ thống)'],
    ]

    const wb = XLSX.utils.book_new()
    const wsData = XLSX.utils.aoa_to_sheet([headers, sample])
    wsData['!cols'] = headers.map(() => ({ wch: 22 }))
    XLSX.utils.book_append_sheet(wb, wsData, 'SA Records')
    const wsGuide = XLSX.utils.aoa_to_sheet(guide)
    wsGuide['!cols'] = [{ wch: 30 }, { wch: 100 }]
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Hướng dẫn')
    XLSX.writeFile(wb, 'mau_import_SA.xlsx')
  }

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const filtered = records
    .filter((r) => {
      if (filterGroup) {
        const cg = r.customer_group || ''
        // Map từng nhóm Ảo sang cả giá trị gốc (E/F/G/H) lẫn giá trị sau migration (Ảo –)
        const ghostPrefixes: Record<string, string[]> = {
          'E': ['E –', 'Ảo – Không nghe'],
          'F': ['F –', 'Ảo – Thuê bao'],
          'G': ['G –', 'Ảo – Không có th'],
          'H': ['H –', 'Ảo – Tài khoản'],
        }
        const prefixes = ghostPrefixes[filterGroup]
        if (prefixes) {
          if (!prefixes.some(p => cg.startsWith(p))) return false
        } else {
          if (!cg.startsWith(filterGroup)) return false
        }
      }
      if (filterPIC && !r.pic?.toLowerCase().includes(filterPIC.toLowerCase())) return false
      if (filterBranch && !r.customers?.branch?.toLowerCase().includes(filterBranch.toLowerCase())) return false
      if (filterCallResult && r.call_result !== filterCallResult) return false
      if (filterDateFrom && r.call_date < filterDateFrom) return false
      if (filterDateTo && r.call_date > filterDateTo) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.account_id?.toLowerCase().includes(q) ||
          r.customers?.full_name?.toLowerCase().includes(q) ||
          r.pic?.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const aVal = (a as any)[sortField] || ''
      const bVal = (b as any)[sortField] || ''
      if (sortDir === 'asc') return aVal > bVal ? 1 : -1
      return aVal < bVal ? 1 : -1
    })

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const groupAB = filtered.filter(
    (r) => r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B')
  )

  const callResults: CallResult[] = [
    'Nghe máy – trao đổi',
    'Không nghe máy / không bắt máy',
    'Thuê bao / số không tồn tại',
    'Không có thông tin liên hệ',
    'Trực tiếp',
  ]

  const realLetters = ['A', 'B', 'C', 'D']
  const ghostLetters = ['E', 'F', 'G', 'H']

  return (
    <div>
      {user?.role === 'sa' && !user.pic_name && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
          ⚠️ Bạn chưa set <strong>Tên PIC</strong> trong <a href="/profile" className="underline font-semibold">Hồ sơ cá nhân</a>.
          Hệ thống cần tên PIC để hiển thị SA records của bạn.
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sale System</h2>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} bản ghi</p>
          {filtered.length !== records.length && <p className="text-xs text-blue-500">Đang lọc từ {records.length} bản ghi</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportTemplate}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <Download size={18} />
            Tải mẫu
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Upload size={18} />
            Import Excel
          </button>
          <button
            onClick={() => { setEditRecord(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Tạo SA Record
          </button>
        </div>
      </div>

      {/* Highlight KH nhóm A/B */}
      {groupAB.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowGroupAB(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-100 transition-colors w-full"
          >
            <span>⚡ Ưu tiên follow — Nhóm A/B ({groupAB.length} KH)</span>
            <span className="ml-auto text-red-400">{showGroupAB ? '▲ Ẩn' : '▼ Xem'}</span>
          </button>
          {showGroupAB && (
            <div className="bg-red-50 border border-t-0 border-red-200 rounded-b-xl px-4 pb-4 pt-3">
              <div className="flex flex-wrap gap-2">
                {groupAB.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1 bg-white border border-red-200 rounded-lg px-3 py-1 text-sm">
                    <span className="font-medium">{r.account_id}</span>
                    <GroupBadge group={r.customer_group} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo Số TK, tên KH, PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Bộ lọc
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nhóm KH</label>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Tất cả</option>
                <optgroup label="Nhóm tiềm năng">
                  {realLetters.map((g) => (
                    <option key={g} value={g}>Nhóm {g}</option>
                  ))}
                </optgroup>
                <optgroup label="Nhóm Ảo">
                  {ghostLetters.map((g) => (
                    <option key={g} value={g}>Nhóm {g}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">PIC</label>
              <input
                value={filterPIC}
                onChange={(e) => setFilterPIC(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="Tên PIC"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Chi nhánh</label>
              <input
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                placeholder="Tên CN"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kết quả cuộc gọi</label>
              <select
                value={filterCallResult}
                onChange={(e) => setFilterCallResult(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Tất cả</option>
                {callResults.map((cr) => (
                  <option key={cr} value={cr}>{cr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-28" />     {/* Số TK */}
                <col className="w-36" />     {/* Tên KH */}
                <col className="w-32" />     {/* Chi nhánh */}
                <col className="w-32" />     {/* Nhóm */}
                <col className="w-24" />     {/* Ngày gọi */}
                <col className="w-20" />     {/* PIC */}
                <col className="w-28" />     {/* Kết quả */}
                <col className="w-44" />     {/* Mức quan tâm */}
                <col className="w-28" />     {/* Bàn giao RM */}
                <col className="w-32" />     {/* Phí & Giá trị GD */}
                <col className="w-16" />     {/* Thao tác */}
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer" onClick={() => toggleSort('account_id')}>
                    <span className="flex items-center gap-1">Số TK <SortIcon field="account_id" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Tên KH</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Chi nhánh</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nhóm</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer" onClick={() => toggleSort('call_date')}>
                    <span className="flex items-center gap-1">Ngày gọi <SortIcon field="call_date" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">PIC</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Kết quả</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mức quan tâm</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Bàn giao RM</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Phí &amp; Giá trị GD</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => { setEditRecord(r); setShowModal(true) }}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      (r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B')) ? 'bg-red-50/50' :
                      (user?.role === 'sa' && !isOwnRecord(r)) ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">{r.account_id}</td>
                    <td className="px-4 py-3 text-gray-700">{r.customers?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.customers?.branch || '—'}</td>
                    <td className="px-4 py-3"><GroupBadge group={r.customer_group} /></td>
                    <td className="px-4 py-3 text-gray-600">{r.call_date ? format(new Date(r.call_date), 'dd/MM/yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span>{r.pic || '—'}</span>
                      {user?.role === 'sa' && !isOwnRecord(r) && (
                        <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">CN</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{r.call_result || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{r.interest_level || '—'}</td>
                    <td className="px-4 py-3">
                      {r.handover_rm ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                          <ArrowRightLeft size={12} /> {r.handover_rm}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {r.transaction_fee != null ? (
                          <span className="text-xs font-medium text-emerald-700">
                            {r.transaction_fee >= 1e6
                              ? (r.transaction_fee / 1e6).toFixed(2) + 'M'
                              : r.transaction_fee.toLocaleString('vi-VN')} ₫
                          </span>
                        ) : <span className="text-xs text-gray-300">Phí: —</span>}
                        {r.total_transaction_value != null ? (
                          <span className="text-[11px] text-gray-500">
                            {r.total_transaction_value >= 1e6
                              ? (r.total_transaction_value / 1e6).toFixed(1) + 'M'
                              : r.total_transaction_value.toLocaleString('vi-VN')} ₫
                          </span>
                        ) : <span className="text-[11px] text-gray-300">GT: —</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditRecord(r); setShowModal(true) }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <Pagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
          />
        )}
      </div>

      {showModal && (
        <SAFormModal
          record={editRecord}
          customers={customers}
          onClose={() => { setShowModal(false); setEditRecord(null) }}
          onSaved={fetchRecords}
        />
      )}

      {showImport && (
        <ImportModal
          allowedType="sa"
          onClose={() => setShowImport(false)}
          onImported={() => { fetchRecords(); fetchCustomers() }}
        />
      )}
    </div>
  )
}
