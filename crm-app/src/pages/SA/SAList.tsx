import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { SARecord, Customer, CallResult } from '../../types'
import { GroupBadge } from '../../components/Badge'
import { Search, Filter, Plus, ChevronDown, ChevronUp, ArrowRightLeft, Upload } from 'lucide-react'
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

  // Filters
  const [filterGroup, setFilterGroup] = useState<string>('')
  const [filterPIC, setFilterPIC] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterCallResult, setFilterCallResult] = useState<string>('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Sort
  const [sortField, setSortField] = useState<string>('call_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => { setPage(1) }, [filterGroup, filterPIC, filterBranch, filterCallResult, filterDateFrom, filterDateTo, searchQuery])

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [custRes, saRes] = await Promise.all([
      supabase.from('customers').select('*').order('account_id'),
      supabase.from('sa_records').select('*').order('call_date', { ascending: false }),
    ])
    const custs = custRes.data || []
    setCustomers(custs)
    const custMap = new Map(custs.map(c => [c.account_id, c]))

    if (saRes.data) {
      let saData = saRes.data
      // SA role: only see own records (by pic_user_id or pic_name match)
      if (user?.role === 'sa') {
        saData = saData.filter(r =>
          r.pic_user_id === user.id ||
          (user.pic_name && r.pic?.toLowerCase() === user.pic_name.toLowerCase())
        )
      }
      setRecords(saData.map(r => ({
        ...r,
        customers: r.account_id ? custMap.get(r.account_id) || null : null,
      })) as any)
    }
    setLoading(false)
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('account_id')
    if (data) setCustomers(data)
  }

  async function fetchRecords() {
    await fetchAll()
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
      if (filterGroup && !r.customer_group?.startsWith(filterGroup)) return false
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

  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

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
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            ⚡ Ưu tiên follow — Nhóm A/B ({groupAB.length} KH)
          </h3>
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
                {groupLetters.map((g) => (
                  <option key={g} value={g}>Nhóm {g}</option>
                ))}
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
            <table className="w-full text-sm">
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
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      (r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B'))
                        ? 'bg-red-50/50'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">{r.account_id}</td>
                    <td className="px-4 py-3 text-gray-700">{r.customers?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.customers?.branch || '—'}</td>
                    <td className="px-4 py-3"><GroupBadge group={r.customer_group} /></td>
                    <td className="px-4 py-3 text-gray-600">{r.call_date ? format(new Date(r.call_date), 'dd/MM/yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.pic || '—'}</td>
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
                      <button
                        onClick={() => { setEditRecord(r); setShowModal(true) }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
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
