import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CRMTicket, Customer, TicketCategory, TicketStatus, TicketSource } from '../../types'
import { VipBadge, StatusBadge } from '../../components/Badge'
import { Search, Filter, Plus, AlertCircle, Upload } from 'lucide-react'
import Pagination from '../../components/Pagination'
import TicketFormModal from './TicketFormModal'
import ImportModal from '../../components/ImportModal'
import { format } from 'date-fns'

interface TicketWithCustomer extends CRMTicket {
  customers: Customer | null
}

const categories: TicketCategory[] = [
  'Quản lý Tài khoản PHS', 'Khác', 'Thay đổi bậc VIP',
  'Hỗ trợ Giao dịch', 'Failed E-Kyc', 'CMSN', 'Khảo sát E-kyc',
  'Nạp và Rút tiền', 'Công văn', 'Dịch vụ CSKH', 'Ứng dụng PHS', 'Môi giới',
]

const statuses: TicketStatus[] = ['Đã đóng', 'Đang xử lý', 'Chờ phản hồi']
const sources: TicketSource[] = ['Email', 'Hotline', 'Zalo', 'Chatbot_1', 'Mobile_app']
const vipTiers = ['Bình thường', 'VIP Gold', 'VIP Platinum', 'VIP Diamond']

export default function CRMList() {
  const [tickets, setTickets] = useState<TicketWithCustomer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTicket, setEditTicket] = useState<TicketWithCustomer | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'linked' | 'unlinked'>('linked')
  const [showImport, setShowImport] = useState(false)

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterVip, setFilterVip] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => { setPage(1) }, [filterStatus, filterCategory, filterVip, filterSource, filterDateFrom, filterDateTo, searchQuery, activeTab])

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [custRes, ticketRes] = await Promise.all([
      supabase.from('customers').select('*').order('account_id'),
      supabase.from('crm_tickets').select('*').order('created_at', { ascending: false }),
    ])
    const custs = custRes.data || []
    setCustomers(custs)
    const custMap = new Map(custs.map(c => [c.account_id, c]))

    if (ticketRes.data) {
      setTickets(ticketRes.data.map(t => ({
        ...t,
        customers: t.account_id ? custMap.get(t.account_id) || null : null,
      })) as TicketWithCustomer[])
    }
    setLoading(false)
  }

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').order('account_id')
    if (data) setCustomers(data)
  }

  async function fetchTickets() {
    await fetchAll()
  }

  const linkedTickets = tickets.filter((t) => !!t.account_id && !t.is_unlinked)
  const unlinkedTickets = tickets.filter((t) => !t.account_id || !!t.is_unlinked)
  const currentList = activeTab === 'linked' ? linkedTickets : unlinkedTickets

  // Ẩn "Thay đổi bậc VIP" khỏi báo cáo issue mặc định
  const filtered = currentList
    .filter((t) => {
      if (activeTab === 'linked' && t.category === 'Thay đổi bậc VIP') return false
      if (filterStatus && t.status !== filterStatus) return false
      if (filterCategory && t.category !== filterCategory) return false
      if (filterVip && t.customers?.vip_tier !== filterVip) return false
      if (filterSource && t.source !== filterSource) return false
      if (filterDateFrom && t.created_at < filterDateFrom) return false
      if (filterDateTo && t.created_at > filterDateTo + 'T23:59:59') return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          t.ticket_code?.toLowerCase().includes(q) ||
          t.account_id?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
        )
      }
      return true
    })

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  function efficiency(t: CRMTicket) {
    if (!t.total_time || !t.handling_time) return null
    return ((t.handling_time / t.total_time) * 100).toFixed(0)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">CRM Tickets</h2>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} tickets</p>
          {filtered.length !== tickets.length && <p className="text-xs text-blue-500">Đang lọc từ {tickets.length} tickets</p>}
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
            onClick={() => { setEditTicket(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Tạo Ticket
          </button>
        </div>
      </div>

      {/* Tabs: Linked vs Unlinked */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('linked')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'linked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Linked ({linkedTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('unlinked')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
            activeTab === 'unlinked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertCircle size={14} />
          Unlinked ({unlinkedTickets.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo mã ticket, số TK, mô tả..."
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Tất cả</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Tất cả</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">VIP Tier</label>
              <select value={filterVip} onChange={(e) => setFilterVip(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Tất cả</option>
                {vipTiers.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nguồn</label>
              <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                <option value="">Tất cả</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
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
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Mã Ticket</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Số TK</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">VIP</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Danh mục</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Phân loại</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Nguồn</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Hiệu suất</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((t) => (
                  <tr key={t.id} onClick={() => { setEditTicket(t); setShowModal(true) }} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">{t.ticket_code}</td>
                    <td className="px-4 py-3 text-gray-700">{t.account_id || <span className="text-gray-400 italic">N/A</span>}</td>
                    <td className="px-4 py-3">{t.customers?.vip_tier ? <VipBadge tier={t.customers.vip_tier} /> : '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{t.category}</td>
                    <td className="px-4 py-3 text-gray-600">{t.classification || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{t.source}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{t.created_at ? format(new Date(t.created_at), 'dd/MM/yyyy') : '—'}</td>
                    <td className="px-4 py-3">
                      {efficiency(t) !== null ? (
                        <span className={`font-medium ${Number(efficiency(t)) >= 70 ? 'text-green-600' : Number(efficiency(t)) >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {efficiency(t)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditTicket(t); setShowModal(true) }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">Không có dữ liệu</td>
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
        <TicketFormModal
          ticket={editTicket}
          customers={customers}
          onClose={() => { setShowModal(false); setEditTicket(null) }}
          onSaved={fetchTickets}
        />
      )}

      {showImport && (
        <ImportModal
          allowedType="crm"
          onClose={() => setShowImport(false)}
          onImported={() => { fetchTickets(); fetchCustomers() }}
        />
      )}
    </div>
  )
}
