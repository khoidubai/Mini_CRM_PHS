import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'
import type { SARecord, KPITarget, KPIMetric } from '../../types'
import { ChevronLeft, ChevronRight, Save, Trophy, Medal } from 'lucide-react'

const METRICS: { key: KPIMetric; label: string; unit: string }[] = [
  { key: 'reactivation', label: 'Tái kích hoạt', unit: 'KH' },
  { key: 'contact_success_rate', label: 'Tỷ lệ liên hệ', unit: '%' },
  { key: 'call_count', label: 'Số cuộc gọi', unit: '' },
  { key: 'interest_rate', label: 'Tỷ lệ quan tâm', unit: '%' },
  { key: 'group_ab_count', label: 'Nhóm A/B', unit: 'KH' },
  { key: 'handover_rm_count', label: 'Bàn giao RM', unit: '' },
  { key: 'transaction_value', label: 'Tổng GTGD', unit: 'VNĐ' },
  { key: 'transaction_fee', label: 'Phí GD', unit: 'VNĐ' },
]

function getMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(m: string) {
  const [y, mo] = m.split('-')
  return `Tháng ${parseInt(mo)}/${y}`
}

export default function KPIAdmin() {
  const [saUsers, setSaUsers] = useState<UserProfile[]>([])
  const [allRecords, setAllRecords] = useState<SARecord[]>([])
  const [targets, setTargets] = useState<KPITarget[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getMonthStr(new Date()))
  const [tab, setTab] = useState<'ranking' | 'targets'>('ranking')
  const [targetEdits, setTargetEdits] = useState<Record<string, Record<KPIMetric, string>>>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [filterBranch, setFilterBranch] = useState<string>('all')

  useEffect(() => { fetchData() }, [month])

  async function fetchData() {
    setLoading(true)
    const monthStart = `${month}-01`
    const nextMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 1)
    const monthEnd = nextMonth.toISOString().split('T')[0]

    const [usersRes, saRes, kpiRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('role', 'sa').eq('is_active', true).order('full_name'),
      supabase.from('sa_records').select('*').gte('call_date', monthStart).lt('call_date', monthEnd),
      supabase.from('kpi_targets').select('*').eq('month', month),
    ])

    const users = (usersRes.data || []) as UserProfile[]
    setSaUsers(users)
    setAllRecords((saRes.data || []) as SARecord[])
    setTargets((kpiRes.data || []) as KPITarget[])

    // Init target edits
    const edits: Record<string, Record<KPIMetric, string>> = {}
    for (const u of users) {
      edits[u.id] = {} as Record<KPIMetric, string>
      for (const m of METRICS) {
        const existing = (kpiRes.data || []).find(
          (t: any) => t.user_id === u.id && t.metric === m.key
        )
        edits[u.id][m.key] = existing ? String(existing.target_value) : ''
      }
    }
    setTargetEdits(edits)
    setLoading(false)
  }

  function computeActual(userId: string, picName: string | null): Record<KPIMetric, number> {
    const recs = allRecords.filter(r =>
      r.pic_user_id === userId ||
      (picName && r.pic?.toLowerCase() === picName.toLowerCase())
    )
    const total = recs.length
    const contactSuccess = recs.filter(r =>
      r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp'
    ).length
    const interested = recs.filter(r =>
      r.interest_level === 'Rất quan tâm – muốn giao dịch ngay' ||
      r.interest_level === 'Quan tâm – cần follow thêm'
    ).length

    return {
      reactivation: recs.filter(r => r.reactivation).length,
      contact_success_rate: total > 0 ? Math.round((contactSuccess / total) * 100) : 0,
      call_count: total,
      interest_rate: contactSuccess > 0 ? Math.round((interested / contactSuccess) * 100) : 0,
      group_ab_count: recs.filter(r => r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B')).length,
      handover_rm_count: recs.filter(r => !!r.handover_rm).length,
      transaction_value: recs.reduce((s, r) => s + (r.total_transaction_value || 0), 0),
      transaction_fee: recs.reduce((s, r) => s + (r.transaction_fee || 0), 0),
    }
  }

  const branches = useMemo(() =>
    Array.from(new Set(saUsers.filter(u => u.branch).map(u => u.branch!))).sort()
  , [saUsers])

  const ranking = useMemo(() => {
    const users = filterBranch === 'all' ? saUsers : saUsers.filter(u => u.branch === filterBranch)
    return users.map(u => {
      const actual = computeActual(u.id, u.pic_name)
      const userTargets = targets.filter(t => t.user_id === u.id)
      let score = 0
      let metricCount = 0
      for (const t of userTargets) {
        if (t.target_value > 0) {
          score += Math.min((actual[t.metric] / t.target_value) * 100, 100)
          metricCount++
        }
      }
      return {
        user: u,
        actual,
        avgCompletion: metricCount > 0 ? Math.round(score / metricCount) : 0,
      }
    }).sort((a, b) => b.avgCompletion - a.avgCompletion)
  }, [saUsers, allRecords, targets, filterBranch])

  function changeMonth(delta: number) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMonth(getMonthStr(d))
  }

  function handleTargetChange(userId: string, metric: KPIMetric, value: string) {
    setTargetEdits(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [metric]: value },
    }))
    setSaveMsg('')
  }

  async function saveTargets() {
    setSaving(true)
    setSaveMsg('')
    const upserts: any[] = []

    for (const userId of Object.keys(targetEdits)) {
      for (const m of METRICS) {
        const val = targetEdits[userId]?.[m.key]
        if (val !== '' && val !== undefined) {
          upserts.push({
            user_id: userId,
            metric: m.key,
            month: month,
            target_value: Number(val) || 0,
            updated_at: new Date().toISOString(),
          })
        }
      }
    }

    if (upserts.length > 0) {
      const { error } = await supabase
        .from('kpi_targets')
        .upsert(upserts, { onConflict: 'user_id,metric,month' })
      if (error) {
        setSaveMsg('Lỗi: ' + error.message)
      } else {
        setSaveMsg(`Đã lưu ${upserts.length} chỉ tiêu!`)
        fetchData()
      }
    }
    setSaving(false)
  }

  function getRankIcon(idx: number) {
    if (idx === 0) return <Trophy size={18} className="text-yellow-500" />
    if (idx === 1) return <Medal size={18} className="text-gray-400" />
    if (idx === 2) return <Medal size={18} className="text-amber-600" />
    return <span className="text-xs text-gray-400 w-[18px] text-center">{idx + 1}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KPI Nhân viên SA</h2>
          <p className="text-sm text-gray-500 mt-1">{saUsers.length} nhân viên SA</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTab('ranking')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'ranking' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Bảng xếp hạng
            </button>
            <button onClick={() => setTab('targets')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'targets' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Set chỉ tiêu
            </button>
          </div>
          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="all">Tất cả chi nhánh</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18} /></button>
            <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">{getMonthLabel(month)}</span>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Đang tải...</div>
      ) : tab === 'ranking' ? (
        /* ===== RANKING TAB ===== */
        <div className="space-y-4">
          {ranking.map((item, idx) => (
            <div key={item.user.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8">{getRankIcon(idx)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.user.full_name || item.user.email}</h3>
                    {item.user.branch && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{item.user.branch}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">PIC: {item.user.pic_name || '—'} · {item.user.email}</p>
                </div>
                <div className={`text-lg font-bold ${item.avgCompletion >= 100 ? 'text-green-600' : item.avgCompletion >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {item.avgCompletion}%
                  <span className="text-xs font-normal text-gray-400 ml-1">hoàn thành</span>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-9 gap-3">
                {METRICS.map(m => {
                  const val = item.actual[m.key]
                  const target = targets.find(t => t.user_id === item.user.id && t.metric === m.key)
                  const pct = target && target.target_value > 0 ? Math.min(Math.round((val / target.target_value) * 100), 999) : null
                  return (
                    <div key={m.key} className="text-center">
                      <p className="text-xs text-gray-500 truncate mb-1">{m.label}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {m.unit === 'VNĐ' ? (val / 1e6).toFixed(1) + 'M' : val}{m.unit === '%' ? '%' : ''}
                      </p>
                      {pct !== null && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{pct}%</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {ranking.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              Chưa có nhân viên SA nào
            </div>
          )}
        </div>
      ) : (
        /* ===== TARGETS TAB ===== */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[180px]">Nhân viên</th>
                  {METRICS.map(m => (
                    <th key={m.key} className="px-3 py-3 text-center font-medium text-gray-600 min-w-[100px]">
                      <span className="text-xs">{m.label}</span>
                      {m.unit && <span className="text-[10px] text-gray-400 block">{m.unit}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {saUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 sticky left-0 bg-white">
                      <p className="font-medium text-gray-900 text-sm">{u.full_name || u.email}</p>
                      <p className="text-xs text-gray-400">
                        {u.branch && <span className="mr-1 text-blue-600">{u.branch}</span>}
                        {u.pic_name || '—'}
                      </p>
                    </td>
                    {METRICS.map(m => (
                      <td key={m.key} className="px-3 py-3">
                        <input
                          type="number"
                          value={targetEdits[u.id]?.[m.key] || ''}
                          onChange={e => handleTargetChange(u.id, m.key, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="—"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            {saveMsg && (
              <span className={`text-sm ${saveMsg.startsWith('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>{saveMsg}</span>
            )}
            <div className="flex-1" />
            <button onClick={saveTargets} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu chỉ tiêu'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
