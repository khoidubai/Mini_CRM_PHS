import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Customer, SARecord, CRMTicket, TransactionLog, ICPFeatures } from '../../types'
import { GroupBadge, VipBadge, StatusBadge } from '../../components/Badge'
import { Search, User, Phone, Ticket, Clock, DollarSign, TrendingUp, BarChart3, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'

type TimelineItem = {
  type: 'sa' | 'crm' | 'trade'
  date: string
  data: SARecord | CRMTicket | TransactionLog
}

function computeICP(txns: TransactionLog[]): ICPFeatures {
  const now = new Date()
  const currentYear = now.getFullYear()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]

  const validTxns = txns.filter(t => t.status === 'Khớp toàn phần' || t.status === 'Khớp một phần')
  const tradeDates = txns.map(t => new Date(t.trade_date).getTime())
  const maxTradeDate = tradeDates.length > 0 ? Math.max(...tradeDates) : 0
  const daysInactive = maxTradeDate ? Math.floor((now.getTime() - maxTradeDate) / 86400000) : 999

  const trades30d = txns.filter(t => t.trade_date >= thirtyDaysAgo).length
  const values = validTxns.map(t => t.transaction_value || 0).filter(v => v > 0)
  const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

  const ytdTxns = validTxns.filter(t => new Date(t.trade_date).getFullYear() === currentYear)
  const totalYtd = ytdTxns.reduce((sum, t) => sum + (t.transaction_value || 0), 0)

  const productTypes = new Set(txns.map(t => t.product_type))

  const channelCounts: Record<string, number> = {}
  txns.forEach(t => { channelCounts[t.channel] = (channelCounts[t.channel] || 0) + 1 })
  const preferredChannel = Object.entries(channelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  return {
    days_inactive: daysInactive,
    trade_frequency_30d: trades30d,
    avg_transaction_value: Math.round(avgValue),
    total_value_ytd: Math.round(totalYtd),
    product_diversity: productTypes.size,
    preferred_channel: preferredChannel,
  }
}

function formatVND(val: number): string {
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)} tỷ`
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)} triệu`
  if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`
  return val.toLocaleString('vi-VN')
}

export default function Customer360() {
  const [query, setQuery] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [saRecords, setSaRecords] = useState<SARecord[]>([])
  const [tickets, setTickets] = useState<CRMTicket[]>([])
  const [transactions, setTransactions] = useState<TransactionLog[]>([])
  const [icp, setIcp] = useState<ICPFeatures | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeSection, setActiveSection] = useState<'timeline' | 'trades' | 'sa' | 'tickets'>('timeline')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const { data: cust } = await supabase
      .from('customers')
      .select('*')
      .eq('account_id', query.trim())
      .single()

    if (cust) {
      setCustomer(cust)
      const [saRes, ticketRes, txnRes] = await Promise.all([
        supabase.from('sa_records').select('*').eq('account_id', cust.account_id).order('call_date', { ascending: false }),
        supabase.from('crm_tickets').select('*').eq('account_id', cust.account_id).order('created_at', { ascending: false }),
        supabase.from('transaction_logs').select('*').eq('account_id', cust.account_id).order('trade_date', { ascending: false }),
      ])
      setSaRecords(saRes.data || [])
      setTickets(ticketRes.data || [])
      const txns = (txnRes.data || []) as TransactionLog[]
      setTransactions(txns)
      setIcp(computeICP(txns))
    } else {
      setCustomer(null)
      setSaRecords([])
      setTickets([])
      setTransactions([])
      setIcp(null)
    }
    setLoading(false)
  }

  const timeline: TimelineItem[] = [
    ...saRecords.map((r) => ({ type: 'sa' as const, date: r.call_date || r.created_at, data: r })),
    ...tickets.map((t) => ({ type: 'crm' as const, date: t.created_at, data: t })),
    ...transactions.map((t) => ({ type: 'trade' as const, date: t.trade_date, data: t })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const latestGroup = saRecords[0]?.customer_group || '—'

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer 360</h2>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Nhập Số TK lưu ký (e.g. 022C111111)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Tìm kiếm
        </button>
      </form>

      {loading && <div className="text-center text-gray-400 py-12">Đang tải...</div>}

      {!loading && searched && !customer && (
        <div className="text-center py-12 text-gray-400">Không tìm thấy khách hàng với Số TK: {query}</div>
      )}

      {customer && !loading && (
        <div className="space-y-6">
          {/* Customer Info Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{customer.full_name}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                    <span className="font-mono text-blue-700 font-medium">{customer.account_id}</span>
                    <span>•</span>
                    <span>{customer.branch}</span>
                    <span>•</span>
                    <span>{customer.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GroupBadge group={latestGroup} />
                <VipBadge tier={customer.vip_tier} />
              </div>
            </div>
          </div>

          {/* Summary Cards Row 1: Core Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard icon={<Ticket size={16} />} label="Tickets" value={String(tickets.length)} color="blue" />
            <SummaryCard icon={<Phone size={16} />} label="SA Calls" value={String(saRecords.length)} color="green" />
            <SummaryCard icon={<TrendingUp size={16} />} label="Giao dịch" value={String(transactions.length)} color="purple" />
            <SummaryCard icon={<DollarSign size={16} />} label="GTGD YTD" value={icp ? formatVND(icp.total_value_ytd) : '—'} color="amber" />
            <SummaryCard icon={<Clock size={16} />} label="Inactive" value={icp ? `${icp.days_inactive} ngày` : '—'}
              color={icp && icp.days_inactive > 90 ? 'red' : 'green'} />
            <SummaryCard icon={<BarChart3 size={16} />} label="GD 30 ngày" value={icp ? String(icp.trade_frequency_30d) : '—'} color="indigo" />
          </div>

          {/* ICP Features Panel */}
          {icp && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
              <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <Activity size={16} />
                ICP Features Preview
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <ICPItem label="Days Inactive" value={String(icp.days_inactive)} warn={icp.days_inactive > 90} />
                <ICPItem label="Trade Freq (30d)" value={String(icp.trade_frequency_30d)} />
                <ICPItem label="Avg Txn Value" value={formatVND(icp.avg_transaction_value)} />
                <ICPItem label="Total YTD" value={formatVND(icp.total_value_ytd)} />
                <ICPItem label="Product Diversity" value={`${icp.product_diversity} loại`} />
                <ICPItem label="Preferred Channel" value={icp.preferred_channel || '—'} />
              </div>
            </div>
          )}

          {/* Section Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {([
              { key: 'timeline', label: `Timeline (${timeline.length})` },
              { key: 'trades', label: `Giao dịch (${transactions.length})` },
              { key: 'sa', label: `SA Records (${saRecords.length})` },
              { key: 'tickets', label: `Tickets (${tickets.length})` },
            ] as { key: typeof activeSection; label: string }[]).map(tab => (
              <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>{tab.label}</button>
            ))}
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeSection === 'timeline' && <TimelineView items={timeline} />}
            {activeSection === 'trades' && <TradesView txns={transactions} />}
            {activeSection === 'sa' && <SAView records={saRecords} />}
            {activeSection === 'tickets' && <TicketsView tickets={tickets} />}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600', amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600', indigo: 'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className={`inline-flex items-center gap-1.5 text-xs mb-1 ${colors[color] || 'text-gray-500'}`}>
        {icon} {label}
      </div>
      <div className="text-lg font-bold text-gray-900 truncate">{value}</div>
    </div>
  )
}

function ICPItem({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-xs text-indigo-600 font-medium">{label}</div>
      <div className={`text-sm font-bold mt-0.5 ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  )
}

function TimelineView({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return <div className="text-center text-gray-400 py-8">Chưa có tương tác</div>

  const typeConfig = {
    sa: { bg: 'bg-green-100', icon: <Phone size={14} className="text-green-700" />, badge: 'bg-green-100 text-green-800', label: 'SA Call' },
    crm: { bg: 'bg-blue-100', icon: <Ticket size={14} className="text-blue-700" />, badge: 'bg-blue-100 text-blue-800', label: 'CRM Ticket' },
    trade: { bg: 'bg-purple-100', icon: <TrendingUp size={14} className="text-purple-700" />, badge: 'bg-purple-100 text-purple-800', label: 'Giao dịch' },
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {items.slice(0, 100).map((item, idx) => {
        const cfg = typeConfig[item.type]
        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>{cfg.icon}</div>
              {idx < Math.min(items.length, 100) - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                <span className="text-xs text-gray-400">{item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '—'}</span>
              </div>
              {item.type === 'sa' && <SATimelineItem data={item.data as SARecord} />}
              {item.type === 'crm' && <CRMTimelineItem data={item.data as CRMTicket} />}
              {item.type === 'trade' && <TradeTimelineItem data={item.data as TransactionLog} />}
            </div>
          </div>
        )
      })}
      {items.length > 100 && <div className="text-center text-gray-400 text-sm py-2">... và {items.length - 100} mục khác</div>}
    </div>
  )
}

function SATimelineItem({ data }: { data: SARecord }) {
  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium">PIC: {data.pic}</span> — {data.call_result}
      {data.notes && <p className="text-gray-500 mt-1 line-clamp-1">{data.notes}</p>}
    </div>
  )
}

function CRMTimelineItem({ data }: { data: CRMTicket }) {
  return (
    <div className="text-sm text-gray-600">
      <span className="font-mono font-medium text-blue-700">{data.ticket_code}</span> — {data.category}{' '}
      <StatusBadge status={data.status} />
    </div>
  )
}

function TradeTimelineItem({ data }: { data: TransactionLog }) {
  const isBuy = data.order_type === 'Mua'
  return (
    <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
      {isBuy ? <ArrowUpRight size={14} className="text-green-600" /> : <ArrowDownRight size={14} className="text-red-500" />}
      <span className={`font-semibold ${isBuy ? 'text-green-700' : 'text-red-600'}`}>{data.order_type}</span>
      <span className="font-mono font-bold text-gray-900">{data.ticker}</span>
      <span className="text-gray-400">×</span>
      <span>{(data.matched_volume || 0).toLocaleString('vi-VN')}</span>
      <span className="text-gray-400">@</span>
      <span>{(data.price || 0).toLocaleString('vi-VN')}đ</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${
        data.status === 'Khớp toàn phần' ? 'bg-green-100 text-green-700' :
        data.status === 'Khớp một phần' ? 'bg-yellow-100 text-yellow-700' :
        data.status === 'Hủy' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
      }`}>{data.status}</span>
      <span className="text-xs text-gray-400">{data.channel}</span>
    </div>
  )
}

function TradesView({ txns }: { txns: TransactionLog[] }) {
  if (txns.length === 0) return <div className="text-center text-gray-400 py-8">Chưa có giao dịch</div>

  // Product type summary
  const byProduct: Record<string, { count: number; value: number }> = {}
  txns.forEach(t => {
    if (!byProduct[t.product_type]) byProduct[t.product_type] = { count: 0, value: 0 }
    byProduct[t.product_type].count++
    if (t.status === 'Khớp toàn phần' || t.status === 'Khớp một phần') {
      byProduct[t.product_type].value += t.transaction_value || 0
    }
  })

  return (
    <div className="space-y-4">
      {/* Product breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(byProduct).map(([type, data]) => (
          <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">{type}</div>
            <div className="text-lg font-bold text-gray-900">{data.count}</div>
            <div className="text-xs text-gray-400">{formatVND(data.value)}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Ngày</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Giờ</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Loại</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Mã CK</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">Lệnh</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">KL đặt</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">KL khớp</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">Giá</th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">Giá trị</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600">TT</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Kênh</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{format(new Date(t.trade_date), 'dd/MM/yy')}</td>
                <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{t.trade_time?.slice(0, 5) || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{t.product_type}</td>
                <td className="px-3 py-2 font-mono font-bold">{t.ticker}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${t.order_type === 'Mua' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.order_type}</span>
                </td>
                <td className="px-3 py-2 text-right">{(t.order_volume || 0).toLocaleString('vi-VN')}</td>
                <td className="px-3 py-2 text-right">{(t.matched_volume || 0).toLocaleString('vi-VN')}</td>
                <td className="px-3 py-2 text-right">{(t.price || 0).toLocaleString('vi-VN')}</td>
                <td className="px-3 py-2 text-right font-medium">{formatVND(t.transaction_value || 0)}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    t.status === 'Khớp toàn phần' ? 'bg-green-100 text-green-700' :
                    t.status === 'Khớp một phần' ? 'bg-yellow-100 text-yellow-700' :
                    t.status === 'Hủy' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                  }`}>{t.status?.replace('Khớp ', '')}</span>
                </td>
                <td className="px-3 py-2 text-xs text-gray-400">{t.channel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SAView({ records }: { records: SARecord[] }) {
  if (records.length === 0) return <div className="text-center text-gray-400 py-8">Chưa có SA records</div>
  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ngày gọi</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">PIC</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Kết quả</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Nhóm</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Quan tâm</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Follow</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 whitespace-nowrap">{r.call_date ? format(new Date(r.call_date), 'dd/MM/yy') : '—'}</td>
              <td className="px-3 py-2 font-medium">{r.pic}</td>
              <td className="px-3 py-2">{r.call_result}</td>
              <td className="px-3 py-2"><GroupBadge group={r.customer_group} /></td>
              <td className="px-3 py-2 text-xs">{r.interest_level || '—'}</td>
              <td className="px-3 py-2 text-center">{r.follow_count}</td>
              <td className="px-3 py-2 text-gray-500 max-w-[200px] truncate">{r.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TicketsView({ tickets }: { tickets: CRMTicket[] }) {
  if (tickets.length === 0) return <div className="text-center text-gray-400 py-8">Chưa có tickets</div>
  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Mã</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Ngày tạo</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Danh mục</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Nguồn</th>
            <th className="px-3 py-2 text-center font-medium text-gray-600">Trạng thái</th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-mono font-bold text-blue-700">{t.ticket_code}</td>
              <td className="px-3 py-2 whitespace-nowrap">{format(new Date(t.created_at), 'dd/MM/yy HH:mm')}</td>
              <td className="px-3 py-2">{t.category}</td>
              <td className="px-3 py-2">{t.source}</td>
              <td className="px-3 py-2 text-center"><StatusBadge status={t.status} /></td>
              <td className="px-3 py-2 text-gray-500 max-w-[250px] truncate">{t.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
