import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { SARecord, KPITarget, KPIMetric, RecordSnapshot } from '../../types'
import { Phone, Users, Database, Target, DollarSign, Gift, Headphones, Package, TrendingUp, ChevronLeft, ChevronRight, ClipboardList, Lightbulb, ShieldCheck, UsersRound, BookOpen, Share2 } from 'lucide-react'

type MetricMeta = { label: string; icon: any; unit: string; color: string; weight: number; desc: string }

const METRIC_META: Record<KPIMetric, MetricMeta> = {
  // Part A — admin-entered
  a1_sop:                { label: 'SOP & CSTT',               icon: ClipboardList, unit: '%',   color: 'slate',  weight: 5,  desc: '100% hoàn thành' },
  a1_nvqltk:             { label: 'Vận hành NVQLTK',          icon: ClipboardList, unit: '%',   color: 'slate',  weight: 5,  desc: '100% hoàn thành' },
  a1_nvkd:               { label: 'Vận hành NVKD',             icon: ClipboardList, unit: '%',   color: 'slate',  weight: 5,  desc: '100% hoàn thành' },
  a1_admin:              { label: 'Vận hành Admin',            icon: ClipboardList, unit: '%',   color: 'slate',  weight: 4,  desc: '100% hoàn thành' },
  a1_other:              { label: 'Công việc khác',            icon: ClipboardList, unit: '%',   color: 'slate',  weight: 5,  desc: '100% hoàn thành' },
  a2_project:            { label: 'Dẫn dắt dự án',           icon: Lightbulb,     unit: '%',   color: 'violet', weight: 9,  desc: '≥1 dự án/quý, 100% đúng hạn' },
  a2_improve:            { label: 'Đề xuất cải tiến',         icon: Lightbulb,     unit: '%',   color: 'violet', weight: 6,  desc: '≥1 SP/quý, ≥1 QT/quý' },
  a3_compliance:         { label: 'Tuân thủ & nêu gương',     icon: ShieldCheck,   unit: '%',   color: 'rose',   weight: 4,  desc: '0 vi phạm' },
  a3_teamwork:           { label: 'Xây dựng đội nhóm',        icon: UsersRound,    unit: '%',   color: 'rose',   weight: 7,  desc: '≥90% tich cực, team ≥90% KPI' },
  a4_knowledge:          { label: 'Kiểm tra kiến thức',      icon: BookOpen,      unit: '%',   color: 'amber',  weight: 5,  desc: '≥80% thi, 100% CC' },
  a4_share:              { label: 'Lan truyền kiến thức',    icon: Share2,        unit: '%',   color: 'amber',  weight: 5,  desc: '≥85% quiz, ≥2 buổi/năm' },
  // Part A SA — admin-entered
  a1_mo_tk:              { label: 'Mở Tài Khoản',             icon: ClipboardList, unit: '%',   color: 'slate',  weight: 7,  desc: '100% hoàn thành' },
  a1_lenh_gd:            { label: 'Lệnh Giao Dịch',           icon: ClipboardList, unit: '%',   color: 'slate',  weight: 5,  desc: '100% hoàn thành' },
  a1_luu_ky:             { label: 'Lưu Ký CK',                icon: ClipboardList, unit: '%',   color: 'slate',  weight: 7,  desc: '100% hoàn thành' },
  a1_gd_tien:            { label: 'GD Tiền',                  icon: ClipboardList, unit: '%',   color: 'slate',  weight: 5,  desc: '100% hoàn thành' },
  a1_ky_quy:             { label: 'Ký Quỹ',                   icon: ClipboardList, unit: '%',   color: 'slate',  weight: 7,  desc: '100% hoàn thành' },
  a2_test:               { label: 'Test Công Cụ',              icon: Lightbulb,     unit: '%',   color: 'violet', weight: 4,  desc: '100% hoàn thành' },
  a3_event:              { label: 'Tham Gia Sự Kiện',          icon: ShieldCheck,   unit: '%',   color: 'rose',   weight: 2,  desc: '100% hoàn thành' },
  a4_cert:               { label: 'Chứng Chỉ & Đào Tạo',      icon: BookOpen,      unit: '%',   color: 'amber',  weight: 3,  desc: '100% hoàn thành' },
  // Part B — CRM-computed
  call_count:            { label: 'Số KH được gọi',        icon: Phone,         unit: 'KH',  color: 'indigo', weight: 8,  desc: '≥100 KH/tháng' },
  contact_success_rate:  { label: 'Tỷ lệ liên lạc',        icon: Phone,         unit: '%',   color: 'green',  weight: 4,  desc: '≥30%' },
  icp_grouping_rate:     { label: 'ICP: Phân nhóm',         icon: Users,         unit: '%',   color: 'blue',   weight: 4,  desc: '100% KH gọi có nhóm' },
  icp_data_quality:      { label: 'ICP: Chất lượng data',   icon: Database,      unit: '%',   color: 'sky',    weight: 4,  desc: '≥98% data sạch' },
  reactivation_count:    { label: 'AAR: Tái kích hoạt',     icon: Target,        unit: 'KH',  color: 'purple', weight: 6,  desc: '1–3 KH/tháng' },
  ltv_fee:               { label: 'LTV: Phí tái KH',        icon: DollarSign,    unit: 'VNĐ', color: 'emerald',weight: 4,  desc: '≥10% phí target' },
  referral_rate:         { label: 'Referral A/B',            icon: Gift,          unit: '%',   color: 'teal',   weight: 2,  desc: '≥80% cuộc gọi A/B' },
  support_count:         { label: 'Hỗ trợ CSKH',            icon: Headphones,    unit: 'KH',  color: 'orange', weight: 3,  desc: '100% KH được hỗ trợ' },
  new_product_count:     { label: 'KH dùng SP mới',          icon: Package,       unit: 'KH',  color: 'yellow', weight: 2,  desc: '≥1 KH/quý' },
  group_conversion_rate: { label: 'Chuyển đổi nhóm KH',     icon: TrendingUp,    unit: '%',   color: 'red',    weight: 3,  desc: '≥5%/quý' },
}

const SUP_GROUPS = [
  { id: 'A1', label: 'A1 — Vận hành & Quản lý Đội nhóm', weight: 24, part: 'A', metrics: ['a1_sop','a1_nvqltk','a1_nvkd','a1_admin','a1_other'] as KPIMetric[] },
  { id: 'A2', label: 'A2 — Dự án & Cải tiến', weight: 15, part: 'A', metrics: ['a2_project','a2_improve'] as KPIMetric[] },
  { id: 'A3', label: 'A3 — Tuân thủ & Lãnh đạo', weight: 11, part: 'A', metrics: ['a3_compliance','a3_teamwork'] as KPIMetric[] },
  { id: 'A4', label: 'A4 — Kiến thức & Học hỏi', weight: 10, part: 'A', metrics: ['a4_knowledge','a4_share'] as KPIMetric[] },
  { id: 'B1', label: 'B1 — Gọi điện & Tiếp cận KH Inactive', weight: 12, part: 'B', metrics: ['call_count', 'contact_success_rate'] as KPIMetric[] },
  { id: 'B2', label: 'B2 — ICP Phân nhóm KH', weight: 8, part: 'B', metrics: ['icp_grouping_rate', 'icp_data_quality'] as KPIMetric[] },
  { id: 'B3', label: 'B3 — AAR Tái kích hoạt Giao dịch', weight: 12, part: 'B', metrics: ['reactivation_count', 'ltv_fee', 'referral_rate'] as KPIMetric[] },
  { id: 'B4', label: 'B4 — Hỗ trợ CSKH & Giới thiệu SP', weight: 8, part: 'B', metrics: ['support_count', 'new_product_count', 'group_conversion_rate'] as KPIMetric[] },
]

const SA_GROUPS = [
  { id: 'A1', label: 'A1 — Nghiệp vụ Tài khoản', weight: 36, part: 'A', metrics: ['a1_mo_tk','a1_lenh_gd','a1_luu_ky','a1_gd_tien','a1_ky_quy','a1_other'] as KPIMetric[] },
  { id: 'A2', label: 'A2 — Dự án & Cải tiến', weight: 10, part: 'A', metrics: ['a2_project','a2_test'] as KPIMetric[] },
  { id: 'A3', label: 'A3 — Tuân thủ & Sự kiện', weight: 5, part: 'A', metrics: ['a3_compliance','a3_event'] as KPIMetric[] },
  { id: 'A4', label: 'A4 — Kiến thức & Đào tạo', weight: 9, part: 'A', metrics: ['a4_knowledge','a4_cert','a4_share'] as KPIMetric[] },
  { id: 'B1', label: 'B1 — Gọi điện & Tiếp cận KH Inactive', weight: 12, part: 'B', metrics: ['call_count', 'contact_success_rate'] as KPIMetric[] },
  { id: 'B2', label: 'B2 — ICP Phân nhóm KH', weight: 8, part: 'B', metrics: ['icp_grouping_rate', 'icp_data_quality'] as KPIMetric[] },
  { id: 'B3', label: 'B3 — AAR Tái kích hoạt Giao dịch', weight: 12, part: 'B', metrics: ['reactivation_count', 'ltv_fee', 'referral_rate'] as KPIMetric[] },
  { id: 'B4', label: 'B4 — Hỗ trợ CSKH & Giới thiệu SP', weight: 8, part: 'B', metrics: ['support_count', 'new_product_count', 'group_conversion_rate'] as KPIMetric[] },
]

function getMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(m: string) {
  const [y, mo] = m.split('-')
  return `Tháng ${parseInt(mo)}/${y}`
}

const LOW_GROUPS = ['C', 'D', 'E', 'F', 'G', 'H']
const HIGH_GROUPS = ['A', 'B']

function computeActual(records: SARecord[], targets: KPITarget[]): Record<KPIMetric, number> {
  const total = records.length
  const contactSuccess = records.filter(r =>
    r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp'
  ).length
  const withGroup = records.filter(r => !!r.customer_group).length

  const reactivatedRecs = records.filter(r => r.reactivation)
  const ltv = reactivatedRecs.reduce((s, r) => s + (r.transaction_fee || 0), 0)

  const abCalls = records.filter(r =>
    (r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp') &&
    (r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B'))
  )
  const referralDone = abCalls.filter(r => r.referral_introduced).length
  const referralRate = abCalls.length > 0 ? Math.round((referralDone / abCalls.length) * 100) : 0

  const upgraded = records.filter(r => {
    const curGroup = r.customer_group?.charAt(0)
    if (!curGroup || !HIGH_GROUPS.includes(curGroup)) return false
    const history = (r.record_history || []) as RecordSnapshot[]
    return history.some(snap => {
      const prev = snap.data.customer_group?.charAt(0)
      return prev && LOW_GROUPS.includes(prev)
    })
  })
  const lowRecs = records.filter(r => {
    const g = r.customer_group?.charAt(0)
    return g && LOW_GROUPS.includes(g)
  })
  const convBase = lowRecs.length + upgraded.length
  const groupConvRate = convBase > 0 ? Math.round((upgraded.length / convBase) * 100) : 0

  function adminActual(metric: KPIMetric) {
    return targets.find(t => t.metric === metric)?.actual_override ?? 0
  }

  return {
    // Part A — admin-entered
    a1_sop:                adminActual('a1_sop'),
    a1_nvqltk:             adminActual('a1_nvqltk'),
    a1_nvkd:               adminActual('a1_nvkd'),
    a1_admin:              adminActual('a1_admin'),
    a1_other:              adminActual('a1_other'),
    a2_project:            adminActual('a2_project'),
    a2_improve:            adminActual('a2_improve'),
    a3_compliance:         adminActual('a3_compliance'),
    a3_teamwork:           adminActual('a3_teamwork'),
    a4_knowledge:          adminActual('a4_knowledge'),
    a4_share:              adminActual('a4_share'),
    // Part A SA — admin-entered
    a1_mo_tk:              adminActual('a1_mo_tk'),
    a1_lenh_gd:            adminActual('a1_lenh_gd'),
    a1_luu_ky:             adminActual('a1_luu_ky'),
    a1_gd_tien:            adminActual('a1_gd_tien'),
    a1_ky_quy:             adminActual('a1_ky_quy'),
    a2_test:               adminActual('a2_test'),
    a3_event:              adminActual('a3_event'),
    a4_cert:               adminActual('a4_cert'),
    // Part B — CRM-computed
    call_count: total,
    contact_success_rate: total > 0 ? Math.round((contactSuccess / total) * 100) : 0,
    icp_grouping_rate: total > 0 ? Math.round((withGroup / total) * 100) : 0,
    icp_data_quality: adminActual('icp_data_quality'),
    reactivation_count: reactivatedRecs.length,
    ltv_fee: ltv,
    referral_rate: referralRate,
    support_count: records.filter(r => r.info_support).length,
    new_product_count: records.filter(r => r.product_introduced).length,
    group_conversion_rate: groupConvRate,
  }
}

function weightedScore(actual: Record<KPIMetric, number>, targets: KPITarget[]): number {
  let ws = 0, tw = 0
  for (const [metric, meta] of Object.entries(METRIC_META) as [KPIMetric, MetricMeta][]) {
    const t = targets.find(t => t.metric === metric)
    if (t && t.target_value > 0) {
      ws += Math.min(actual[metric] / t.target_value, 1) * meta.weight
      tw += meta.weight
    }
  }
  return tw > 0 ? Math.round((ws / tw) * 100) : 0
}

export default function KPIDashboard() {
  const { user } = useAuth()
  const [records, setRecords] = useState<SARecord[]>([])
  const [targets, setTargets] = useState<KPITarget[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getMonthStr(new Date()))

  useEffect(() => { fetchData() }, [month])

  async function fetchData() {
    if (!user) return
    setLoading(true)
    const monthStart = `${month}-01`
    const nextMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 1)
    const monthEnd = nextMonth.toISOString().split('T')[0]

    const [saRes, kpiRes] = await Promise.all([
      supabase.from('sa_records').select('*').gte('call_date', monthStart).lt('call_date', monthEnd),
      supabase.from('kpi_targets').select('*').eq('user_id', user.id).eq('month', month),
    ])

    const allSa = (saRes.data || []) as SARecord[]
    const myRecords = allSa.filter(r =>
      r.pic_user_id === user.id ||
      (user.pic_name && r.pic?.toLowerCase() === user.pic_name.toLowerCase())
    )
    setRecords(user.role === 'admin' ? allSa : myRecords)
    setTargets((kpiRes.data || []) as KPITarget[])
    setLoading(false)
  }

  const [kpiTab, setKpiTab] = useState<'A' | 'B'>('B')
  const groups = user?.profile?.kpi_type === 'sa' ? SA_GROUPS : SUP_GROUPS
  const actual = useMemo(() => computeActual(records, targets), [records, targets])
  const score = useMemo(() => weightedScore(actual, targets), [actual, targets])

  function getTarget(metric: KPIMetric) {
    return targets.find(t => t.metric === metric) ?? null
  }

  function partScore(part: 'A' | 'B') {
    let ws = 0, tw = 0
    for (const g of groups.filter(g => g.part === part)) {
      for (const m of g.metrics) {
        const t = getTarget(m)
        if (t && t.target_value > 0) {
          ws += Math.min(actual[m] / t.target_value, 1) * METRIC_META[m].weight
          tw += METRIC_META[m].weight
        }
      }
    }
    return tw > 0 ? Math.round((ws / tw) * 100) : null
  }

  function changeMonth(delta: number) {
    const [y, m] = month.split('-').map(Number)
    setMonth(getMonthStr(new Date(y, m - 1 + delta, 1)))
  }

  function fmtVal(metric: KPIMetric, val: number) {
    const meta = METRIC_META[metric]
    if (meta.unit === 'VNĐ') return val >= 1e6 ? (val / 1e6).toFixed(1) + 'M ₫' : val.toLocaleString('vi-VN') + ' ₫'
    if (meta.unit === '%') return val + '%'
    return String(val)
  }

  if (!user) return null

  const sA = partScore('A')
  const sB = partScore('B')

  function pctColor(p: number | null) {
    if (p === null) return 'text-gray-400'
    if (p >= 100) return 'text-green-600'
    if (p >= 70) return 'text-yellow-600'
    return 'text-red-500'
  }

  function barColor(p: number | null) {
    if (p === null) return 'bg-gray-200'
    if (p >= 100) return 'bg-green-500'
    if (p >= 70) return 'bg-yellow-400'
    return 'bg-red-400'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">KPI Cá nhân</h2>
          <p className="text-xs text-gray-400 mt-0.5">{user.full_name || user.email} · {user.pic_name || 'Chưa set PIC'}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold text-gray-700 min-w-[110px] text-center">{getMonthLabel(month)}</span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ChevronRight size={16} /></button>
        </div>
      </div>

      {!user.pic_name && user.role === 'sa' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4 text-xs text-amber-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>Chưa set <strong>Tên PIC</strong> — hệ thống cần PIC để lọc SA records của bạn.
            <a href="/profile" className="underline ml-1 font-medium">Cập nhật ngay</a>
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
      ) : (
        <>
          {/* Score cards row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* Overall */}
            <div className="col-span-1 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4 text-white flex flex-col justify-between">
              <p className="text-blue-200 text-xs font-medium">Tổng điểm KPI</p>
              <div>
                <p className="text-4xl font-bold mt-1">{score}<span className="text-xl">%</span></p>
                <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-white transition-all" style={{ width: `${Math.min(score, 100)}%` }} />
                </div>
              </div>
              <p className="text-blue-300 text-[10px] mt-2">A (60%) + B (40%)</p>
            </div>
            {/* Part A */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 rounded-full px-2 py-0.5">Phần A</span>
                <span className="text-[10px] text-gray-400">60% · Admin nhập</span>
              </div>
              <p className={`text-4xl font-bold mt-2 ${pctColor(sA)}`}>{sA !== null ? sA + '%' : '—'}</p>
              <div className="mt-2 space-y-1">
                {['A1','A2','A3','A4'].map(gid => {
                  const g = groups.find(g => g.id === gid)!
                  let gWs = 0, gTw = 0
                  for (const m of g.metrics) { const t = getTarget(m); if (t && t.target_value > 0) { gWs += Math.min(actual[m]/t.target_value,1)*METRIC_META[m].weight; gTw += METRIC_META[m].weight } }
                  const gs = gTw > 0 ? Math.round((gWs/gTw)*100) : null
                  return (
                    <div key={gid} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-4">{gid}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div className={`h-1 rounded-full ${barColor(gs)}`} style={{ width: `${Math.min(gs ?? 0, 100)}%` }} />
                      </div>
                      <span className={`text-[10px] font-semibold w-8 text-right ${pctColor(gs)}`}>{gs !== null ? gs+'%' : '—'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Part B */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">Phần B</span>
                <span className="text-[10px] text-gray-400">40% · CRM</span>
              </div>
              <p className={`text-4xl font-bold mt-2 ${pctColor(sB)}`}>{sB !== null ? sB + '%' : '—'}</p>
              <div className="mt-2 space-y-1">
                {['B1','B2','B3','B4'].map(gid => {
                  const g = groups.find(g => g.id === gid)!
                  let gWs = 0, gTw = 0
                  for (const m of g.metrics) { const t = getTarget(m); if (t && t.target_value > 0) { gWs += Math.min(actual[m]/t.target_value,1)*METRIC_META[m].weight; gTw += METRIC_META[m].weight } }
                  const gs = gTw > 0 ? Math.round((gWs/gTw)*100) : null
                  return (
                    <div key={gid} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-4">{gid}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div className={`h-1 rounded-full ${barColor(gs)}`} style={{ width: `${Math.min(gs ?? 0, 100)}%` }} />
                      </div>
                      <span className={`text-[10px] font-semibold w-8 text-right ${pctColor(gs)}`}>{gs !== null ? gs+'%' : '—'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Part A / Part B tab switch */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
            <button onClick={() => setKpiTab('B')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${kpiTab === 'B' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
              Phần B — Sales (40%)
            </button>
            <button onClick={() => setKpiTab('A')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${kpiTab === 'A' ? 'bg-white shadow text-violet-700' : 'text-gray-500 hover:text-gray-700'}`}>
              Phần A — Lãnh đạo (60%)
            </button>
          </div>

          {/* Tab content */}
          {kpiTab === 'B' ? (
            /* Part B: grouped metric cards */
            <div className="space-y-4">
              {groups.filter(g => g.part === 'B').map(g => (
                <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white bg-blue-600 rounded-full px-2 py-0.5">{g.id}</span>
                      <span className="text-sm font-semibold text-gray-700">{g.label}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Tỷ trọng {g.weight}%</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {g.metrics.map(metric => {
                      const meta = METRIC_META[metric]
                      const val = actual[metric]
                      const t = getTarget(metric)
                      const pct = t && t.target_value > 0 ? Math.min(Math.round((val / t.target_value) * 100), 999) : null
                      const Icon = meta.icon
                      const isOverride = metric === 'icp_data_quality'
                      return (
                        <div key={metric} className="flex items-center gap-3 px-4 py-3">
                          <div className={`w-8 h-8 rounded-lg bg-${meta.color}-50 flex items-center justify-center flex-shrink-0`}>
                            <Icon size={15} className={`text-${meta.color}-500`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                              <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1">{meta.weight}%</span>
                              {isOverride && <span className="text-[10px] text-sky-500">admin</span>}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">{meta.desc}</p>
                            {t !== null && (
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full transition-all ${barColor(pct)}`} style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
                                </div>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">/ {fmtVal(metric, t.target_value)}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-gray-900">{fmtVal(metric, val)}</p>
                            {pct !== null
                              ? <p className={`text-xs font-semibold ${pctColor(pct)}`}>{pct}%</p>
                              : <p className="text-[10px] text-gray-300 italic">no target</p>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Part A: clean table view */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">Các chỉ tiêu Phần A do Admin nhập điểm thực tế. Bạn có thể xem tiến độ tại đây.</p>
              </div>
              {groups.filter(g => g.part === 'A').map(g => (
                <div key={g.id}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border-b border-violet-100">
                    <span className="text-xs font-bold text-violet-700">{g.id}</span>
                    <span className="text-xs font-semibold text-violet-800">{g.label}</span>
                    <span className="text-[10px] text-violet-400 ml-auto">{g.weight}%</span>
                  </div>
                  {g.metrics.map(metric => {
                    const meta = METRIC_META[metric]
                    const val = actual[metric]
                    const t = getTarget(metric)
                    const pct = t && t.target_value > 0 ? Math.min(Math.round((val / t.target_value) * 100), 999) : null
                    const Icon = meta.icon
                    return (
                      <div key={metric} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                        <div className={`w-7 h-7 rounded-lg bg-${meta.color}-50 flex items-center justify-center flex-shrink-0`}>
                          <Icon size={13} className={`text-${meta.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-gray-700">{meta.label}</p>
                            <span className="text-[10px] text-gray-300 bg-gray-100 rounded px-1">{meta.weight}%</span>
                          </div>
                          <p className="text-[10px] text-gray-400">{meta.desc}</p>
                          {t && (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="w-32 bg-gray-100 rounded-full h-1">
                                <div className={`h-1 rounded-full ${barColor(pct)}`} style={{ width: `${Math.min(pct ?? 0, 100)}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400">target: {t.target_value}%</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 min-w-[60px]">
                          {val > 0 ? (
                            <>
                              <p className="text-base font-bold text-gray-800">{val}%</p>
                              {pct !== null && <p className={`text-xs font-semibold ${pctColor(pct)}`}>{pct}%</p>}
                            </>
                          ) : (
                            <p className="text-xs text-gray-300 italic">Chờ admin</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
