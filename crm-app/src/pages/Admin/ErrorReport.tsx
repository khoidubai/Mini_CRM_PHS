import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import type { CRMTicket } from '../../types'
import { ERROR_GROUPS, getErrorByCode } from '../../data/errorCodes'
import { AlertTriangle, TrendingUp, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const GROUP_COLORS: Record<string, string> = {
  'Lệnh Đặt': '#ef4444',
  'Đăng Nhập': '#f97316',
  'Hiển Thị': '#eab308',
  'eKYC / Tài Khoản': '#8b5cf6',
  'Portal / Hệ Thống': '#3b82f6',
  'Chuyển Khoản / Thanh Toán': '#06b6d4',
  'Khiếu Nại': '#ec4899',
  'Đặc Biệt': '#6b7280',
}

function getMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(m: string) {
  const [y, mo] = m.split('-')
  return `T${parseInt(mo)}/${y}`
}

export default function ErrorReport() {
  const [tickets, setTickets] = useState<CRMTicket[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [fromMonth, setFromMonth] = useState(getMonthStr(new Date(now.getFullYear(), now.getMonth() - 5, 1)))
  const [toMonth, setToMonth] = useState(getMonthStr(now))
  const [topK, setTopK] = useState(10)
  const [filterGroup, setFilterGroup] = useState('all')
  const [sortField, setSortField] = useState<'count' | 'avgTime'>('count')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    setLoading(true)
    const { data } = await supabase
      .from('crm_tickets')
      .select('id,created_at,error_code,error_custom,category,source,status,handling_time')
      .not('error_code', 'is', null)
    setTickets((data || []) as CRMTicket[])
    setLoading(false)
  }

  const filtered = useMemo(() => {
    const from = fromMonth + '-01'
    const to = toMonth + '-31'
    return tickets.filter(t => {
      const d = t.created_at?.slice(0, 10) || ''
      return d >= from && d <= to
    })
  }, [tickets, fromMonth, toMonth])

  const stats = useMemo(() => {
    const map: Record<string, { code: string; count: number; totalTime: number; timeCount: number; customs: string[] }> = {}
    filtered.forEach(t => {
      const code = t.error_code!
      if (!map[code]) map[code] = { code, count: 0, totalTime: 0, timeCount: 0, customs: [] }
      map[code].count++
      if (t.handling_time) { map[code].totalTime += t.handling_time; map[code].timeCount++ }
      if (code === 'ĐB000' && t.error_custom) map[code].customs.push(t.error_custom)
    })
    return Object.values(map).map(s => ({
      ...s,
      meta: getErrorByCode(s.code),
      avgTime: s.timeCount > 0 ? Math.round(s.totalTime / s.timeCount) : null,
    }))
  }, [filtered])

  const totalWithError = filtered.length

  const displayStats = useMemo(() => {
    let rows = [...stats]
    if (filterGroup !== 'all') rows = rows.filter(r => r.meta?.group === filterGroup)
    rows.sort((a, b) => {
      const aVal = sortField === 'count' ? a.count : (a.avgTime ?? 0)
      const bVal = sortField === 'count' ? b.count : (b.avgTime ?? 0)
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal
    })
    return rows.slice(0, topK)
  }, [stats, filterGroup, sortField, sortDir, topK])

  const chartData = useMemo(() =>
    displayStats.map(s => ({
      name: s.code,
      label: s.meta?.name?.slice(0, 28) || s.code,
      count: s.count,
      group: s.meta?.group || 'Đặc Biệt',
    }))
  , [displayStats])

  function toggleSort(field: 'count' | 'avgTime') {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Đang tải...</div>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle size={22} className="text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo cáo Lỗi / Sự cố</h1>
          <p className="text-sm text-gray-500">Thống kê mã lỗi từ CRM tickets theo thời gian</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ tháng</label>
          <input type="month" value={fromMonth} onChange={e => setFromMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Đến tháng</label>
          <input type="month" value={toMonth} onChange={e => setToMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nhóm lỗi</label>
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Tất cả nhóm</option>
            {ERROR_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Top K</label>
          <select value={topK} onChange={e => setTopK(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {[5, 10, 15, 20].map(k => <option key={k} value={k}>Top {k}</option>)}
          </select>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Khoảng thời gian</p>
          <p className="text-sm font-semibold text-gray-700">{monthLabel(fromMonth)} → {monthLabel(toMonth)}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-600 font-medium">Tickets có lỗi</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{totalWithError}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium">Loại mã lỗi</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{stats.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">Lỗi phổ biến nhất</p>
          <p className="text-sm font-bold text-blue-700 mt-1 truncate">
            {stats.length > 0
              ? `${stats.sort((a, b) => b.count - a.count)[0].code} (${stats[0].count})`
              : '—'}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-xs text-purple-600 font-medium">Lỗi chưa giải quyết</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            {filtered.filter(t => (t as any).status === 'Đang xử lý').length}
          </p>
        </div>
      </div>

      {totalWithError === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
          <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Không có ticket lỗi nào trong khoảng thời gian này</p>
          <p className="text-xs mt-1 text-gray-300">Thử mở rộng bộ lọc tháng hoặc tạo ticket có mã lỗi</p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-700">Top {topK} mã lỗi phổ biến</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={62} tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip
                  formatter={(val: any, _name: any, props: any) => [
                    `${val ?? 0} tickets`,
                    props.payload.label,
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={GROUP_COLORS[entry.group] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {Object.entries(GROUP_COLORS).map(([g, color]) => (
                <span key={g} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Detail table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Chi tiết</h2>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">Mã lỗi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tên lỗi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Nhóm</th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer select-none"
                    onClick={() => toggleSort('count')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Số lần
                      {sortField === 'count' ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null}
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">% tổng</th>
                  <th
                    className="text-right px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer select-none"
                    onClick={() => toggleSort('avgTime')}
                  >
                    <span className="inline-flex items-center gap-1">
                      Avg xử lý
                      {sortField === 'avgTime' ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />) : null}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayStats.map((row, i) => (
                  <tr key={row.code} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-xs font-semibold px-2 py-1 rounded"
                        style={{
                          background: (GROUP_COLORS[row.meta?.group || ''] || '#6b7280') + '20',
                          color: GROUP_COLORS[row.meta?.group || ''] || '#6b7280',
                        }}
                      >
                        {row.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.code === 'ĐB000' && row.customs.length > 0 ? (
                        <div>
                          <span className="text-gray-400 italic">Lỗi khác:</span>
                          <ul className="mt-0.5 space-y-0.5">
                            {Array.from(new Set(row.customs)).slice(0, 3).map((c, ci) => (
                              <li key={ci} className="text-xs text-gray-600">• {c}</li>
                            ))}
                            {row.customs.length > 3 && (
                              <li className="text-xs text-gray-400">+{row.customs.length - 3} khác...</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        row.meta?.name || row.code
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{row.meta?.group || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-800">{row.count}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.round((row.count / totalWithError) * 100)}%`,
                              background: GROUP_COLORS[row.meta?.group || ''] || '#6b7280',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">
                          {Math.round((row.count / totalWithError) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {row.avgTime != null ? `${row.avgTime} phút` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
