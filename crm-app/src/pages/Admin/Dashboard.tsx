import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Customer, SARecord, CRMTicket, TransactionLog } from '../../types'
import { Upload, Settings, X, Check, TrendingUp, TrendingDown, Users, RefreshCw, Star } from 'lucide-react'
import ImportModal from '../../components/ImportModal'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap,
} from 'recharts'

type ChartType = 'donut' | 'hbar' | 'vbar' | 'radar' | 'treemap'
type ChartKey =
  | 'vip_tier' | 'customer_branch'
  | 'crm_status' | 'crm_category' | 'crm_source' | 'crm_priority' | 'crm_customer_type' | 'crm_classification'
  | 'sa_group' | 'sa_call_result' | 'sa_interest' | 'sa_pic' | 'sa_flags'
  | 'txn_product' | 'txn_channel' | 'txn_status' | 'txn_order_type' | 'txn_top_tickers'

const ALL_CHARTS: { key: ChartKey; label: string; section: string; chartType: ChartType }[] = [
  { key: 'vip_tier', label: 'Phân bổ VIP Tier', section: 'Khách hàng', chartType: 'donut' },
  { key: 'customer_branch', label: 'Phân bổ Chi nhánh', section: 'Khách hàng', chartType: 'hbar' },
  { key: 'crm_status', label: 'Trạng thái Ticket', section: 'CRM Tickets', chartType: 'donut' },
  { key: 'crm_category', label: 'Danh mục Ticket', section: 'CRM Tickets', chartType: 'hbar' },
  { key: 'crm_source', label: 'Nguồn Ticket', section: 'CRM Tickets', chartType: 'donut' },
  { key: 'crm_priority', label: 'Mức độ ưu tiên', section: 'CRM Tickets', chartType: 'donut' },
  { key: 'crm_customer_type', label: 'Loại KH (CRM)', section: 'CRM Tickets', chartType: 'donut' },
  { key: 'crm_classification', label: 'Phân loại Ticket', section: 'CRM Tickets', chartType: 'hbar' },
  { key: 'sa_group', label: 'Nhóm KH (A-H)', section: 'Sale System', chartType: 'vbar' },
  { key: 'sa_call_result', label: 'Kết quả cuộc gọi', section: 'Sale System', chartType: 'hbar' },
  { key: 'sa_interest', label: 'Mức độ quan tâm', section: 'Sale System', chartType: 'radar' },
  { key: 'sa_pic', label: 'Theo PIC', section: 'Sale System', chartType: 'vbar' },
  { key: 'sa_flags', label: 'GTSP / Tái kích hoạt / HTTT', section: 'Sale System', chartType: 'vbar' },
  { key: 'txn_product', label: 'Loại sản phẩm GD', section: 'Giao dịch', chartType: 'radar' },
  { key: 'txn_channel', label: 'Kênh giao dịch', section: 'Giao dịch', chartType: 'donut' },
  { key: 'txn_status', label: 'Trạng thái lệnh', section: 'Giao dịch', chartType: 'donut' },
  { key: 'txn_order_type', label: 'Mua / Bán', section: 'Giao dịch', chartType: 'donut' },
  { key: 'txn_top_tickers', label: 'Top mã CK', section: 'Giao dịch', chartType: 'treemap' },
]

const DEFAULT_VISIBLE: ChartKey[] = [
  'vip_tier', 'crm_status', 'crm_category', 'crm_source', 'sa_group', 'sa_call_result', 'txn_product', 'txn_channel',
]

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#6366f1','#14b8a6','#f97316','#06b6d4','#84cc16','#a855f7']

function countBy<T>(arr: T[], fn: (item: T) => string | undefined | null): Record<string, number> {
  const out: Record<string, number> = {}
  arr.forEach(item => {
    const k = fn(item) || '(trống)'
    out[k] = (out[k] || 0) + 1
  })
  return out
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saRecords, setSaRecords] = useState<SARecord[]>([])
  const [tickets, setTickets] = useState<CRMTicket[]>([])
  const [transactions, setTransactions] = useState<TransactionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [detailPane, setDetailPane] = useState<string | null>(null)
  const [editingMetric, setEditingMetric] = useState<string | null>(null)
  const [healthConfig, setHealthConfig] = useState({ aarInactiveDays: 180, churnDays: 90 })

  const [visibleCharts, setVisibleCharts] = useState<ChartKey[]>(() => {
    try { const s = localStorage.getItem('dashboard_charts'); return s ? JSON.parse(s) : DEFAULT_VISIBLE } catch { return DEFAULT_VISIBLE }
  })
  const [showConfig, setShowConfig] = useState(false)
  const [pendingCharts, setPendingCharts] = useState<ChartKey[]>(visibleCharts)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [custRes, saRes, ticketRes, txnRes] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase.from('sa_records').select('*'),
      supabase.from('crm_tickets').select('*'),
      supabase.from('transaction_logs').select('*'),
    ])
    setCustomers(custRes.data || [])
    setSaRecords(saRes.data || [])
    setTickets(ticketRes.data || [])
    setTransactions((txnRes.data || []) as TransactionLog[])
    setLoading(false)
  }

  function applyConfig() {
    setVisibleCharts(pendingCharts)
    localStorage.setItem('dashboard_charts', JSON.stringify(pendingCharts))
    setShowConfig(false)
  }

  function togglePending(key: ChartKey) {
    setPendingCharts(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Đang tải...</div>

  // === Portfolio Health Metrics ===
  const portfolioMetrics = computePortfolioMetrics(customers, transactions, saRecords, healthConfig)

  // === Build all chart data ===
  const totalCustomers = customers.length
  const totalTickets = tickets.length
  const totalTxn = transactions.length
  const unlinkedTickets = tickets.filter(t => t.is_unlinked).length
  const validTxnValue = transactions.filter(t => t.status === 'Khớp toàn phần' || t.status === 'Khớp một phần').reduce((s, t) => s + (t.transaction_value || 0), 0)

  const chartDataMap: Record<ChartKey, Record<string, number>> = {
    vip_tier: countBy(customers, c => c.vip_tier || 'Bình thường'),
    customer_branch: countBy(customers, c => c.branch),
    crm_status: countBy(tickets, t => t.status),
    crm_category: countBy(tickets.filter(t => t.category !== 'Thay đổi bậc VIP'), t => t.category),
    crm_source: countBy(tickets, t => t.source),
    crm_priority: countBy(tickets, t => t.priority),
    crm_customer_type: countBy(tickets, t => t.customer_type),
    crm_classification: countBy(tickets, t => t.classification),
    sa_group: countBy(saRecords, r => r.customer_group),
    sa_call_result: countBy(saRecords, r => r.call_result),
    sa_interest: countBy(saRecords.filter(r => r.interest_level), r => r.interest_level as string),
    sa_pic: countBy(saRecords, r => r.pic),
    sa_flags: {
      'Giới thiệu SP': saRecords.filter(r => r.product_introduced).length,
      'Tái kích hoạt': saRecords.filter(r => r.reactivation).length,
      'Hỗ trợ TT': saRecords.filter(r => r.info_support).length,
    },
    txn_product: countBy(transactions, t => t.product_type),
    txn_channel: countBy(transactions, t => t.channel),
    txn_status: countBy(transactions, t => t.status),
    txn_order_type: countBy(transactions, t => t.order_type),
    txn_top_tickers: (() => {
      const c = countBy(transactions, t => t.ticker || '?')
      const entries = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 15)
      return Object.fromEntries(entries)
    })(),
  }

  function formatVND(val: number): string {
    if (val >= 1e9) return `${(val / 1e9).toFixed(1)} tỷ`
    if (val >= 1e6) return `${(val / 1e6).toFixed(1)}tr`
    return val.toLocaleString('vi-VN')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex gap-2">
          <button onClick={() => { setPendingCharts(visibleCharts); setShowConfig(true) }}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            <Settings size={18} /> Tuỳ chỉnh
          </button>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
            <Upload size={18} /> Import Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-2">
        <StatCard label="Khách hàng" value={String(totalCustomers)} color="blue"
          active={detailPane === 'customers'} onClick={() => setDetailPane(p => p === 'customers' ? null : 'customers')} />
        <StatCard label="KH có GD" value={String(portfolioMetrics.totalWithTrades)} color="green"
          sub={`${Math.round(portfolioMetrics.totalWithTrades / Math.max(1, totalCustomers) * 100)}% tổng KH`}
          active={detailPane === 'kdgd'} onClick={() => setDetailPane(p => p === 'kdgd' ? null : 'kdgd')} />
        <StatCard label="CRM Tickets" value={String(totalTickets)} color="purple"
          sub={`${unlinkedTickets} unlinked`}
          active={detailPane === 'tickets'} onClick={() => setDetailPane(p => p === 'tickets' ? null : 'tickets')} />
        <StatCard label="Giao dịch" value={String(totalTxn)} color="indigo"
          active={detailPane === 'transactions'} onClick={() => setDetailPane(p => p === 'transactions' ? null : 'transactions')} />
        <StatCard label="GTGD Khớp" value={formatVND(validTxnValue)} color="amber"
          active={detailPane === 'gtgd'} onClick={() => setDetailPane(p => p === 'gtgd' ? null : 'gtgd')} />
      </div>

      {/* Detail Pane */}
      {detailPane && (
        <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">
              {detailPane === 'customers' && `Danh sách khách hàng (${customers.length})`}
              {detailPane === 'kdgd' && `KH có giao dịch (${portfolioMetrics.totalWithTrades})`}
              {detailPane === 'tickets' && `CRM Tickets (${tickets.length})`}
              {detailPane === 'transactions' && `Giao dịch gần đây (${transactions.length})`}
              {detailPane === 'gtgd' && `Top GTGD Khớp`}
            </span>
            <button onClick={() => setDetailPane(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            {(detailPane === 'customers') && (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0"><tr>
                  <th className="px-3 py-2 text-left text-gray-500">Số TK</th><th className="px-3 py-2 text-left text-gray-500">Tên KH</th>
                  <th className="px-3 py-2 text-left text-gray-500">Chi nhánh</th><th className="px-3 py-2 text-left text-gray-500">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-gray-500">VIP</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.slice(0, 50).map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 font-mono text-blue-700">{c.account_id}</td>
                      <td className="px-3 py-1.5 text-gray-700">{c.full_name}</td>
                      <td className="px-3 py-1.5 text-gray-500">{c.branch}</td>
                      <td className="px-3 py-1.5 text-gray-500">{c.status}</td>
                      <td className="px-3 py-1.5 text-gray-500">{c.vip_tier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(detailPane === 'kdgd') && (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0"><tr>
                  <th className="px-3 py-2 text-left text-gray-500">Số TK</th><th className="px-3 py-2 text-left text-gray-500">Tên KH</th>
                  <th className="px-3 py-2 text-right text-gray-500">Tổng GD</th><th className="px-3 py-2 text-right text-gray-500">GD gần nhất</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {customers
                    .filter(c => transactions.some(t => t.account_id === c.account_id))
                    .slice(0, 50).map(c => {
                      const cTxns = transactions.filter(t => t.account_id === c.account_id)
                      const lastDate = cTxns.reduce((max, t) => t.trade_date > max ? t.trade_date : max, cTxns[0]?.trade_date || '')
                      return (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-mono text-blue-700">{c.account_id}</td>
                          <td className="px-3 py-1.5 text-gray-700">{c.full_name}</td>
                          <td className="px-3 py-1.5 text-right text-gray-600">{cTxns.length}</td>
                          <td className="px-3 py-1.5 text-right text-gray-500">{lastDate}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            )}
            {(detailPane === 'tickets') && (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0"><tr>
                  <th className="px-3 py-2 text-left text-gray-500">Mã</th><th className="px-3 py-2 text-left text-gray-500">Danh mục</th>
                  <th className="px-3 py-2 text-left text-gray-500">Nguồn</th><th className="px-3 py-2 text-left text-gray-500">Trạng thái</th>
                  <th className="px-3 py-2 text-left text-gray-500">Số TK</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets.slice(0, 50).map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 font-mono text-blue-700">{t.ticket_code}</td>
                      <td className="px-3 py-1.5 text-gray-600 max-w-[120px] truncate">{t.category}</td>
                      <td className="px-3 py-1.5 text-gray-500">{t.source}</td>
                      <td className="px-3 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          t.status === 'Đã đóng' ? 'bg-green-100 text-green-700' :
                          t.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-3 py-1.5 font-mono text-xs text-gray-400">{t.account_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {(detailPane === 'transactions' || detailPane === 'gtgd') && (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0"><tr>
                  <th className="px-3 py-2 text-left text-gray-500">Ngày</th><th className="px-3 py-2 text-left text-gray-500">Số TK</th>
                  <th className="px-3 py-2 text-left text-gray-500">Mã CK</th><th className="px-3 py-2 text-center text-gray-500">Lệnh</th>
                  <th className="px-3 py-2 text-right text-gray-500">Giá trị</th><th className="px-3 py-2 text-left text-gray-500">TT</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {[...transactions]
                    .sort((a, b) => detailPane === 'gtgd' ? (b.transaction_value || 0) - (a.transaction_value || 0) : b.trade_date.localeCompare(a.trade_date))
                    .slice(0, 50).map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-1.5 text-gray-500">{t.trade_date}</td>
                        <td className="px-3 py-1.5 font-mono text-blue-700">{t.account_id}</td>
                        <td className="px-3 py-1.5 font-mono font-bold">{t.ticker}</td>
                        <td className="px-3 py-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.order_type === 'Mua' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>{t.order_type}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-medium text-gray-700">{formatVND(t.transaction_value || 0)}</td>
                        <td className="px-3 py-1.5 text-gray-400 text-[10px]">{t.status?.replace('Khớp ', '')}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Health */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Portfolio Health — <span className="normal-case font-normal">nhấp vào thẻ để xem công thức &amp; chỉnh sửa</span></p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <HealthCard icon={<Star size={15} />} label="ICP Score" value={`${portfolioMetrics.icpScore}%`}
            sub={`${portfolioMetrics.profiledCount}/${portfolioMetrics.totalCalled} KH được phân nhóm`}
            color="indigo" trend={portfolioMetrics.icpScore >= 80 ? 'up' : 'down'} onClick={() => setEditingMetric('icp')} />
          <HealthCard icon={<TrendingUp size={15} />} label="Avg LTV" value={formatVND(portfolioMetrics.avgLTV)}
            sub={`Phí GD tb / KH (${portfolioMetrics.ltvCustomerCount} KH)`}
            color="emerald" onClick={() => setEditingMetric('ltv')} />
          <HealthCard icon={<RefreshCw size={15} />} label="AAR (Tái KH)" value={`${portfolioMetrics.aar}%`}
            sub={`${portfolioMetrics.reactivatedSuccess}/${portfolioMetrics.reactivationTotal} KH tái khởp`}
            color="blue" trend={portfolioMetrics.aar >= 30 ? 'up' : 'down'} onClick={() => setEditingMetric('aar')} />
          <HealthCard icon={<TrendingDown size={15} />} label={`Churn (${healthConfig.churnDays}ng)`} value={`${portfolioMetrics.churn}%`}
            sub={`${portfolioMetrics.churnedCount}/${portfolioMetrics.totalWithTrades} KH ngưng GD`}
            color="red" trend={portfolioMetrics.churn <= 30 ? 'up' : 'down'} onClick={() => setEditingMetric('churn')} />
          <HealthCard icon={<Users size={15} />} label="Referral" value={`${portfolioMetrics.referralRate}%`}
            sub={`${portfolioMetrics.referralCount} KH giới thiệu / ${portfolioMetrics.totalWithTrades} active`}
            color="amber" trend={portfolioMetrics.referralRate >= 5 ? 'up' : 'down'} onClick={() => setEditingMetric('referral')} />
        </div>
      </div>

      {/* Formula Modal */}
      {editingMetric && (
        <FormulaModal
          metric={editingMetric}
          config={healthConfig}
          onSave={(newCfg) => { setHealthConfig(newCfg); setEditingMetric(null) }}
          onClose={() => setEditingMetric(null)}
        />
      )}

      {/* Charts grid — only visible ones */}
      {visibleCharts.length === 0 ? (
        <div className="text-center text-gray-400 py-12 bg-white rounded-xl border border-gray-200">
          Chưa chọn mục nào. Nhấn <strong>Tuỳ chỉnh</strong> để chọn.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleCharts.map(key => {
            const chartMeta = ALL_CHARTS.find(c => c.key === key)
            if (!chartMeta) return null
            return <ChartCard key={key} data={chartDataMap[key]} title={chartMeta.label} section={chartMeta.section} chartType={chartMeta.chartType} />
          })}
        </div>
      )}

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Tuỳ chỉnh Dashboard</h3>
              <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {['Khách hàng', 'CRM Tickets', 'Sale System', 'Giao dịch'].map(section => (
                <div key={section}>
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">{section}</h4>
                  <div className="space-y-1">
                    {ALL_CHARTS.filter(c => c.section === section).map(c => {
                      const checked = pendingCharts.includes(c.key)
                      return (
                        <label key={c.key} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                          <input type="checkbox" checked={checked} onChange={() => togglePending(c.key)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700">{c.label}</span>
                          <span className="ml-auto text-xs text-gray-400">{Object.keys(chartDataMap[c.key]).length} mục</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">{pendingCharts.length} / {ALL_CHARTS.length} mục</span>
              <div className="flex gap-2">
                <button onClick={() => setPendingCharts(ALL_CHARTS.map(c => c.key))}
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Chọn tất cả</button>
                <button onClick={() => setPendingCharts([])}
                  className="px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg">Bỏ chọn</button>
                <button onClick={applyConfig}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Check size={16} /> Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} onImported={fetchAll} />}
    </div>
  )
}

function toChartData(data: Record<string, number>) {
  return Object.entries(data).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
}

const RADIAN = Math.PI / 180
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>{`${(percent * 100).toFixed(0)}%`}</text>
}

function ChartCard({ data, title, section, chartType }: { data: Record<string, number>; title: string; section: string; chartType: ChartType }) {
  const entries = toChartData(data)
  const total = entries.reduce((s, e) => s + e.value, 0)

  const sectionColors: Record<string, string> = {
    'Khách hàng': 'text-blue-600', 'CRM Tickets': 'text-purple-600',
    'Sale System': 'text-green-600', 'Giao dịch': 'text-amber-600',
  }

  const chartTypeLabels: Record<ChartType, string> = {
    donut: 'Donut', hbar: 'Bar ngang', vbar: 'Bar dọc', radar: 'Radar', treemap: 'Treemap',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{chartTypeLabels[chartType]}</span>
          <span className={`text-xs font-medium ${sectionColors[section] || 'text-gray-500'}`}>{section}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{total}</span>
        </div>
      </div>
      <div className="w-full" style={{ height: chartType === 'hbar' ? Math.max(200, entries.length * 32) : 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'donut' ? (
            <PieChart>
              <Pie data={entries} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="40%" outerRadius="75%"
                paddingAngle={2} label={renderCustomLabel} labelLine={false}>
                {entries.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v ?? 0} (${total > 0 ? Math.round(((v ?? 0) / total) * 100) : 0}%)`, 'Số lượng']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          ) : chartType === 'hbar' ? (
            <BarChart data={entries} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => [`${v ?? 0} (${total > 0 ? Math.round(((v ?? 0) / total) * 100) : 0}%)`, 'Số lượng']} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {entries.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : chartType === 'vbar' ? (
            <BarChart data={entries} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${v ?? 0} (${total > 0 ? Math.round(((v ?? 0) / total) * 100) : 0}%)`, 'Số lượng']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {entries.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          ) : chartType === 'radar' ? (
            <RadarChart data={entries} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip formatter={(v: any) => [`${v ?? 0}`, 'Số lượng']} />
            </RadarChart>
          ) : chartType === 'treemap' ? (
            <Treemap data={entries} dataKey="value" nameKey="name" aspectRatio={4 / 3}
              content={({ x, y, width, height, name, value, index }: any) => (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill={COLORS[(index || 0) % COLORS.length]} rx={3} stroke="#fff" strokeWidth={2} />
                  {width > 40 && height > 25 && (
                    <>
                      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{name}</text>
                      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize={10}>{value}</text>
                    </>
                  )}
                </g>
              )}
            />
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function computePortfolioMetrics(
  _customers: Customer[],
  transactions: TransactionLog[],
  saRecords: SARecord[],
  config: { aarInactiveDays: number; churnDays: number }
) {
  const now = new Date()
  const dChurnAgo = new Date(now.getTime() - config.churnDays * 86400000).toISOString().split('T')[0]

  const validTxns = transactions.filter(t => t.status === 'Khớp toàn phần' || t.status === 'Khớp một phần')
  const txnsByCustomer: Record<string, TransactionLog[]> = {}
  validTxns.forEach(t => {
    if (!txnsByCustomer[t.account_id]) txnsByCustomer[t.account_id] = []
    txnsByCustomer[t.account_id].push(t)
  })
  const custWithTrades = Object.keys(txnsByCustomer)
  const totalWithTrades = custWithTrades.length

  // 1. ICP Score: % KH được phân nhóm (customer_group set) / tổng KH được gọi
  const calledCustomers = new Set(saRecords.map(r => r.account_id))
  const profiledCustomers = new Set(saRecords.filter(r => r.customer_group).map(r => r.account_id))
  const icpScore = calledCustomers.size > 0 ? Math.round((profiledCustomers.size / calledCustomers.size) * 100) : 0

  // 2. LTV: Avg phí GD tích lũy / KH (từ sa_records.transaction_fee)
  const feeByCustomer: Record<string, number> = {}
  saRecords.forEach(r => {
    const fee = Number(r.transaction_fee)
    if (fee > 0) feeByCustomer[r.account_id] = (feeByCustomer[r.account_id] || 0) + fee
  })
  const feeValues = Object.values(feeByCustomer)
  const avgLTV = feeValues.length > 0 ? feeValues.reduce((a, b) => a + b, 0) / feeValues.length : 0
  const ltvCustomerCount = feeValues.length

  // 3. AAR: KH inactive >N ngày được tái kích hoạt thành công
  //    Tái kích hoạt = sa_records.reactivation=true + customer có GD sau ngày gọi
  const dInactiveAgo = new Date(now.getTime() - config.aarInactiveDays * 86400000).toISOString().split('T')[0]
  const reactivationRecords = saRecords.filter(r => r.reactivation)
  // earliest reactivation call per customer
  const reactivationCallDate: Record<string, string> = {}
  reactivationRecords.forEach(r => {
    if (!reactivationCallDate[r.account_id] || r.call_date < reactivationCallDate[r.account_id]) {
      reactivationCallDate[r.account_id] = r.call_date
    }
  })
  const reactivationTotal = Object.keys(reactivationCallDate).length
  const reactivatedSuccess = Object.entries(reactivationCallDate).filter(([accId, callDate]) => {
    const custTxns = txnsByCustomer[accId] || []
    return custTxns.some(t => t.trade_date >= callDate && t.trade_date >= dInactiveAgo)
  }).length
  const aar = reactivationTotal > 0 ? Math.round((reactivatedSuccess / reactivationTotal) * 100) : 0

  // 4. Churn: % KH có GD nhưng không GD trong churnDays ngày
  const churnedCount = custWithTrades.filter(accId =>
    !txnsByCustomer[accId].some(t => t.trade_date >= dChurnAgo)
  ).length
  const churn = totalWithTrades > 0 ? Math.round((churnedCount / totalWithTrades) * 100) : 0

  // 5. Referral: unique KH được giới thiệu + rate
  const referralSet = new Set(
    saRecords.filter(r => r.indirect_type === 'KH mới mở TK được giới thiệu').map(r => r.account_id)
  )
  const referralCount = referralSet.size
  const referralRate = totalWithTrades > 0 ? Math.round((referralCount / totalWithTrades) * 100) : 0

  return {
    icpScore, profiledCount: profiledCustomers.size, totalCalled: calledCustomers.size,
    avgLTV, ltvCustomerCount,
    aar, reactivatedSuccess, reactivationTotal,
    churn, churnedCount, totalWithTrades,
    referralCount, referralRate,
  }
}

function FormulaModal({ metric, config, onSave, onClose }: {
  metric: string
  config: { aarInactiveDays: number; churnDays: number }
  onSave: (cfg: { aarInactiveDays: number; churnDays: number }) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState({ ...config })

  const META: Record<string, { title: string; color: string; formula: string; note?: string; fields: { key: keyof typeof draft; label: string; unit: string }[] }> = {
    icp: {
      title: 'ICP Score — Phân nhóm KH trên CRM',
      color: 'indigo',
      formula: '(Số KH được gần nhóm sau cuộc gọi / Tổng KH được gọi) × 100%',
      note: 'KH có customer_group được chọn trong SA record = đã phân nhóm. Mục tiêu: ≥98%.',
      fields: [],
    },
    ltv: {
      title: 'Avg LTV — Phí GD tích lũy / KH',
      color: 'emerald',
      formula: 'Tổng phí GD (transaction_fee) từng KH / Số KH có phí',
      note: 'Dựa trên trường transaction_fee trong SA records. Khác với tổng giá trị lệnh (transaction_value).',
      fields: [],
    },
    aar: {
      title: 'AAR — Account Activation Rate (Tái kích hoạt)',
      color: 'blue',
      formula: '(KH inactive > N ngày được gọi và có GD mới) / (Tổng KH inactive được gọi) × 100%',
      note: 'KH inactive = chưa GD trong N ngày. Tái kích hoạt thành công = có lệnh GD sau ngày SA gọi. Mục tiêu: 1–3 KH/tháng.',
      fields: [{ key: 'aarInactiveDays', label: 'Ngưỡng inactive', unit: 'ngày' }],
    },
    churn: {
      title: 'Churn Rate — Tỷ lệ KH ngừng GD',
      color: 'red',
      formula: '(KH có GD nhưng không GD trong N ngày gần nhất / Tổng KH có GD) × 100%',
      note: 'Chỉ tính KH đã từng GD. Churn thấp là tốt.',
      fields: [{ key: 'churnDays', label: 'Ngưỡng inactive', unit: 'ngày' }],
    },
    referral: {
      title: 'Referral Rate — Tỷ lệ KH giới thiệu',
      color: 'amber',
      formula: '(Số KH mới được giới thiệu / Tổng KH active có GD) × 100%',
      note: 'SA records có indirect_type = "KH mới mở TK được giới thiệu". Mục tiêu: ≥1 KH referral/quý.',
      fields: [],
    },
  }

  const m = META[metric]
  if (!m) return null

  const borderColor: Record<string, string> = {
    indigo: 'border-indigo-300', emerald: 'border-emerald-300',
    blue: 'border-blue-300', red: 'border-red-300', amber: 'border-amber-300',
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className={`bg-gray-50 rounded-xl border-l-4 ${borderColor[m.color]} px-4 py-3`}>
            <p className="text-xs font-semibold text-gray-500 mb-1">Công thức</p>
            <p className="text-sm text-gray-700 font-mono">{m.formula}</p>
          </div>
          {m.note && (
            <div className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2 leading-relaxed">{m.note}</div>
          )}
          {m.fields.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Tuỳ chỉnh tham số</p>
              {m.fields.map(f => (
                <div key={f.key} className="flex items-center gap-3 mb-2">
                  <label className="text-sm text-gray-600 flex-1">{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={1} max={3650}
                      value={draft[f.key]}
                      onChange={e => setDraft(d => ({ ...d, [f.key]: Number(e.target.value) }))}
                      className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-sm text-gray-400">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Hủy</button>
          <button onClick={() => onSave(draft)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Check size={14} className="inline mr-1" />Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

function HealthCard({ icon, label, value, sub, color, trend, onClick }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string; trend?: 'up' | 'down'; onClick?: () => void
}) {
  const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  badge: 'bg-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    badge: 'bg-blue-100' },
    red:     { bg: 'bg-red-50',     text: 'text-red-700',     badge: 'bg-red-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   badge: 'bg-amber-100' },
  }
  const c = colorMap[color] || colorMap['blue']
  return (
    <div onClick={onClick} className={`rounded-xl border border-gray-200 p-4 ${c.bg} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${c.text}`}>
        {icon} {label}
        {trend && (
          <span className="ml-auto">
            {trend === 'up'
              ? <TrendingUp size={12} className="text-emerald-500" />
              : <TrendingDown size={12} className="text-red-400" />}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>
    </div>
  )
}

function StatCard({ label, value, sub, color, active, onClick }: {
  label: string; value: string; sub?: string; color: string; active?: boolean; onClick?: () => void
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-700', green: 'text-green-700',
    purple: 'text-purple-700', orange: 'text-orange-700',
    indigo: 'text-indigo-700', amber: 'text-amber-700',
  }
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50', green: 'bg-green-50',
    purple: 'bg-purple-50', orange: 'bg-orange-50',
    indigo: 'bg-indigo-50', amber: 'bg-amber-50',
  }
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 cursor-pointer transition-all ${
        active
          ? `${bgMap[color] || 'bg-gray-50'} border-current shadow-md ring-2 ring-offset-1 ring-current/30`
          : `${bgMap[color] || 'bg-gray-50'} border-gray-200 hover:shadow-sm`
      } ${colorMap[color] || 'text-gray-700'}`}
    >
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1 truncate">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5 truncate">{sub}</p>}
    </div>
  )
}
