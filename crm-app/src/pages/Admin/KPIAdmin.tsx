import { useEffect, useState, useMemo, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'
import type { SARecord, KPITarget, KPIMetric, RecordSnapshot } from '../../types'
import { ChevronLeft, ChevronRight, ChevronDown, Save, Trophy, Medal, BarChart2, Phone, RefreshCw, DollarSign, TrendingUp } from 'lucide-react'

type MetricDef = { key: KPIMetric; label: string; unit: string; weight: number; group: string; adminOnly?: boolean; hint: string }

const SA_A_METRICS: MetricDef[] = [
  { key: 'a1_mo_tk',    label: 'Mở Tài Khoản',      unit: '%', weight: 7, group: 'A1', adminOnly: true, hint: 'Chấm điểm mở TK cơ sở & phái sinh: EKYC, HĐ, Flex, hướng dẫn KH (0–100)' },
  { key: 'a1_lenh_gd',  label: 'Lệnh Giao Dịch',    unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm nhập lệnh chính xác, đúng quy trình, lưu trữ đầy đủ (0–100)' },
  { key: 'a1_luu_ky',   label: 'Lưu Ký CK',           unit: '%', weight: 7, group: 'A1', adminOnly: true, hint: 'Chấm điểm nghiệp vụ lưu ký, chuyển nhượng, thay đổi thông tin VSDC (0–100)' },
  { key: 'a1_gd_tien',  label: 'GD Tiền',             unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm nộp/chuyển tiền, ĐKCT, ứng tiền đúng quy trình (0–100)' },
  { key: 'a1_ky_quy',   label: 'Ký Quỹ',              unit: '%', weight: 7, group: 'A1', adminOnly: true, hint: 'Chấm điểm quản lý TKKQ, thông báo nợ, hỗ trợ KH VIP (0–100)' },
  { key: 'a1_other',    label: 'Công Việc Khác',    unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm hỗ trợ NV nghỉ phép, KSNB, sự kiện PHS (0–100)' },
  { key: 'a2_project',  label: 'Phối Hợp Dự Án',    unit: '%', weight: 6, group: 'A2', adminOnly: true, hint: 'Chấm điểm phối hợp dự án nâng cao DV & đề xuất cải tiến quy trình (0–100)' },
  { key: 'a2_test',     label: 'Test Công Cụ',       unit: '%', weight: 4, group: 'A2', adminOnly: true, hint: 'Chấm điểm test link HĐ mới, công cụ mới, hoàn thành khảo sát đúng hạn (0–100)' },
  { key: 'a3_compliance',label:'Tuân Thủ Nội Quy',  unit: '%', weight: 3, group: 'A3', adminOnly: true, hint: 'Chấm điểm chấp hành nội quy & hỗ trợ đồng nghiệp (0–100)' },
  { key: 'a3_event',    label: 'Tham Gia SK',           unit: '%', weight: 2, group: 'A3', adminOnly: true, hint: 'Chấm điểm tham gia đầy đủ sự kiện nội bộ PHS (0–100)' },
  { key: 'a4_knowledge',label: 'Kiểm Tra KT',         unit: '%', weight: 3, group: 'A4', adminOnly: true, hint: 'Kết quả bài thi E-learning nghiệp vụ trong kỳ (0–100)' },
  { key: 'a4_cert',     label: 'Chứng Chỉ & ĐT',     unit: '%', weight: 3, group: 'A4', adminOnly: true, hint: 'Chấm điểm hoàn thành chứng chỉ hành nghề & tham gia đào tạo HR/SS (0–100)' },
  { key: 'a4_share',    label: 'Cập Nhật & Chia Sẻ', unit: '%', weight: 3, group: 'A4', adminOnly: true, hint: 'Chấm điểm nắm quy định mới & chia sẻ kiến thức nội bộ (0–100)' },
]

const SUP_A_METRICS: MetricDef[] = [
  { key: 'a1_sop',       label: 'SOP & CSTT',           unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm tuân thủ quy trình SOP & chất lượng CSTT (0–100)' },
  { key: 'a1_nvqltk',   label: 'Vận hành NVQLTK',      unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm giám sát nghiệp vụ quản lý tài khoản (0–100)' },
  { key: 'a1_nvkd',     label: 'Vận hành NVKD',        unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm giám sát nghiệp vụ kinh doanh (0–100)' },
  { key: 'a1_admin',    label: 'Vận hành Admin',       unit: '%', weight: 4, group: 'A1', adminOnly: true, hint: 'Chấm điểm xử lý công việc hành chính nội bộ (0–100)' },
  { key: 'a1_other',    label: 'Công Việc Khác',    unit: '%', weight: 5, group: 'A1', adminOnly: true, hint: 'Chấm điểm hoàn thành công việc phát sinh (0–100)' },
  { key: 'a2_project',  label: 'Dẫn Dắt Dự Án',    unit: '%', weight: 9, group: 'A2', adminOnly: true, hint: 'Chấm điểm dẫn dắt & triển khai dự án/sáng kiến (0–100)' },
  { key: 'a2_improve',  label: 'Cải Tiến SP/QT',     unit: '%', weight: 6, group: 'A2', adminOnly: true, hint: 'Chấm điểm đóng góp cải tiến sản phẩm/quy trình (0–100)' },
  { key: 'a3_compliance',label:'Tuân Thủ & Nêu Gương', unit: '%', weight: 4, group: 'A3', adminOnly: true, hint: 'Chấm điểm chấp hành nội quy & thái độ làm gương (0–100)' },
  { key: 'a3_teamwork', label: 'Xây Dựng Đội Nhóm',  unit: '%', weight: 7, group: 'A3', adminOnly: true, hint: 'Chấm điểm hợp tác, gắn kết & hỗ trợ đồng nghiệp (0–100)' },
  { key: 'a4_knowledge',label: 'Kiểm Tra KT',         unit: '%', weight: 5, group: 'A4', adminOnly: true, hint: 'Kết quả kiểm tra kiến thức nghiệp vụ trong tháng (0–100)' },
  { key: 'a4_share',    label: 'Lan Truyền KT',        unit: '%', weight: 5, group: 'A4', adminOnly: true, hint: 'Chấm điểm chia sẻ/đào tạo kiến thức cho đội nhóm (0–100)' },
]

const PART_B_METRICS: MetricDef[] = [
  { key: 'call_count',            label: 'Số KH gọi',          unit: 'KH',  weight: 8, group: 'B1', hint: 'Mục tiêu số KH cần gọi trong tháng (VD: 100)' },
  { key: 'contact_success_rate',  label: 'Tỷ lệ liên lạc',     unit: '%',   weight: 4, group: 'B1', hint: 'Mục tiêu % gọi có bắt máy/trực tiếp (VD: 70)' },
  { key: 'icp_grouping_rate',     label: 'ICP Phân nhóm',       unit: '%',   weight: 4, group: 'B2', hint: 'Mục tiêu % KH được phân loại nhóm (VD: 90)' },
  { key: 'icp_data_quality',      label: 'ICP Data',             unit: '%',   weight: 4, group: 'B2', adminOnly: true, hint: 'Chấm điểm chất lượng dữ liệu KH được cập nhật (0–100)' },
  { key: 'reactivation_count',    label: 'AAR Tái KH',          unit: 'KH',  weight: 6, group: 'B3', hint: 'Mục tiêu số TK tái kích hoạt trong tháng (VD: 20)' },
  { key: 'ltv_fee',               label: 'LTV',                  unit: 'VNĐ', weight: 4, group: 'B3', hint: 'Mục tiêu tổng phí GD từ TK tái kích hoạt (VNĐ, VD: 5000000)' },
  { key: 'referral_rate',         label: 'Referral A/B',        unit: '%',   weight: 2, group: 'B3', hint: 'Mục tiêu % KH nhóm A/B được giới thiệu sản phẩm (VD: 30)' },
  { key: 'support_count',         label: 'Hỗ trợ CSKH',        unit: 'KH',  weight: 3, group: 'B4', hint: 'Mục tiêu số KH được hỗ trợ/chăm sóc trong tháng (VD: 15)' },
  { key: 'new_product_count',     label: 'SP mới',              unit: 'KH',  weight: 2, group: 'B4', hint: 'Mục tiêu số KH được giới thiệu sản phẩm mới (VD: 10)' },
  { key: 'group_conversion_rate', label: 'Chuyển đổi nhóm',    unit: '%',   weight: 3, group: 'B4', hint: 'Mục tiêu % KH thăng từ nhóm thấp (C/D/E) lên A/B (VD: 40)' },
]

const SA_METRICS: MetricDef[] = [...SA_A_METRICS, ...PART_B_METRICS]
const SUP_METRICS: MetricDef[] = [...SUP_A_METRICS, ...PART_B_METRICS]

function getMetrics(kpiType?: 'sa' | 'sup' | null): MetricDef[] {
  return kpiType === 'sup' ? SUP_METRICS : SA_METRICS
}

const LOW_GROUPS = ['C', 'D', 'E', 'F', 'G', 'H']
const HIGH_GROUPS = ['A', 'B']

function adminVal(userTargets: KPITarget[], metric: KPIMetric): number {
  return userTargets.find(t => t.metric === metric)?.actual_override ?? 0
}

function computeActual(recs: SARecord[], userTargets: KPITarget[]): Record<KPIMetric, number> {
  const total = recs.length
  const contactSuccess = recs.filter(r =>
    r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp'
  ).length
  const withGroup = recs.filter(r => !!r.customer_group).length

  const reactivatedRecs = recs.filter(r => r.reactivation)
  const ltv = reactivatedRecs.reduce((s, r) => s + (r.transaction_fee || 0), 0)

  const abCalls = recs.filter(r =>
    (r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp') &&
    (r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B'))
  )
  const referralRate = abCalls.length > 0
    ? Math.round((abCalls.filter(r => r.referral_introduced).length / abCalls.length) * 100) : 0

  const upgraded = recs.filter(r => {
    const curGroup = r.customer_group?.charAt(0)
    if (!curGroup || !HIGH_GROUPS.includes(curGroup)) return false
    return ((r.record_history || []) as RecordSnapshot[]).some(snap => {
      const prev = snap.data.customer_group?.charAt(0)
      return prev && LOW_GROUPS.includes(prev)
    })
  })
  const lowRecs = recs.filter(r => { const g = r.customer_group?.charAt(0); return g && LOW_GROUPS.includes(g) })
  const convBase = lowRecs.length + upgraded.length

  return {
    // Part A SUP
    a1_sop:           adminVal(userTargets, 'a1_sop'),
    a1_nvqltk:        adminVal(userTargets, 'a1_nvqltk'),
    a1_nvkd:          adminVal(userTargets, 'a1_nvkd'),
    a1_admin:         adminVal(userTargets, 'a1_admin'),
    a1_other:         adminVal(userTargets, 'a1_other'),
    a2_project:       adminVal(userTargets, 'a2_project'),
    a2_improve:       adminVal(userTargets, 'a2_improve'),
    a3_compliance:    adminVal(userTargets, 'a3_compliance'),
    a3_teamwork:      adminVal(userTargets, 'a3_teamwork'),
    a4_knowledge:     adminVal(userTargets, 'a4_knowledge'),
    a4_share:         adminVal(userTargets, 'a4_share'),
    // Part A SA
    a1_mo_tk:         adminVal(userTargets, 'a1_mo_tk'),
    a1_lenh_gd:       adminVal(userTargets, 'a1_lenh_gd'),
    a1_luu_ky:        adminVal(userTargets, 'a1_luu_ky'),
    a1_gd_tien:       adminVal(userTargets, 'a1_gd_tien'),
    a1_ky_quy:        adminVal(userTargets, 'a1_ky_quy'),
    a2_test:          adminVal(userTargets, 'a2_test'),
    a3_event:         adminVal(userTargets, 'a3_event'),
    a4_cert:          adminVal(userTargets, 'a4_cert'),
    // Part B — CRM-computed
    call_count: total,
    contact_success_rate: total > 0 ? Math.round((contactSuccess / total) * 100) : 0,
    icp_grouping_rate: total > 0 ? Math.round((withGroup / total) * 100) : 0,
    icp_data_quality:      adminVal(userTargets, 'icp_data_quality'),
    reactivation_count: reactivatedRecs.length,
    ltv_fee: ltv,
    referral_rate: referralRate,
    support_count: recs.filter(r => r.info_support).length,
    new_product_count: recs.filter(r => r.product_introduced).length,
    group_conversion_rate: convBase > 0 ? Math.round((upgraded.length / convBase) * 100) : 0,
  }
}

function computeWeightedScore(actual: Record<KPIMetric, number>, userTargets: KPITarget[], metrics: MetricDef[]): number {
  let ws = 0, tw = 0
  for (const m of metrics) {
    const t = userTargets.find(t => t.metric === m.key)
    if (t && t.target_value > 0) {
      ws += Math.min(actual[m.key] / t.target_value, 1) * m.weight
      tw += m.weight
    }
  }
  return tw > 0 ? Math.round((ws / tw) * 100) : 0
}

function getMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(m: string) {
  const [y, mo] = m.split('-')
  return `Tháng ${parseInt(mo)}/${y}`
}

function fmtMoney(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return String(n)
}

export default function KPIAdmin() {
  const [saUsers, setSaUsers] = useState<UserProfile[]>([])
  const [allRecords, setAllRecords] = useState<SARecord[]>([])
  const [targets, setTargets] = useState<KPITarget[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getMonthStr(new Date()))
  const [tab, setTab] = useState<'ranking' | 'targets' | 'report'>('ranking')
  const [reportView, setReportView] = useState<'employee' | 'branch'>('employee')
  const [targetPart, setTargetPart] = useState<'B' | 'A'>('B')
  const [kpiTypeFilter, setKpiTypeFilter] = useState<'sa' | 'sup'>('sa')
  const [rankingRoleFilter, setRankingRoleFilter] = useState<'all' | 'sa' | 'sup'>('all')
  const [rankingSortDir, setRankingSortDir] = useState<'desc' | 'asc'>('desc')
  const [targetEdits, setTargetEdits] = useState<Record<string, Record<KPIMetric, string>>>({})
  const [actualOverrideEdits, setActualOverrideEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [filterBranch, setFilterBranch] = useState<string>('all')

  // Report-specific filters
  const [reportEmployee, setReportEmployee] = useState<string>('all')
  const [reportTopN, setReportTopN] = useState<number>(5)
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false)
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null)
  const empDropdownRef = useRef<HTMLDivElement>(null)
  const [reportRecords, setReportRecords] = useState<SARecord[]>([])
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => { fetchData() }, [month])
  useEffect(() => { if (tab === 'report') fetchReportData() }, [tab, month, filterBranch])
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (empDropdownRef.current && !empDropdownRef.current.contains(e.target as Node)) {
        setEmpDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  async function fetchReportData() {
    setReportLoading(true)
    const monthStart = `${month}-01`
    const [y, m] = month.split('-').map(Number)
    const monthEnd = new Date(y, m, 1).toISOString().split('T')[0]
    let q = supabase.from('sa_records').select('*').gte('call_date', monthStart).lt('call_date', monthEnd)
    const { data } = await q
    setReportRecords((data || []) as SARecord[])
    setReportLoading(false)
  }

  async function fetchData() {
    setLoading(true)
    const monthStart = `${month}-01`
    const nextMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 1)
    const monthEnd = nextMonth.toISOString().split('T')[0]

    const [usersRes, saRes, kpiRes] = await Promise.all([
      supabase.from('user_profiles').select('*').in('role', ['sa', 'sup']).eq('is_active', true).order('full_name'),
      supabase.from('sa_records').select('*').gte('call_date', monthStart).lt('call_date', monthEnd),
      supabase.from('kpi_targets').select('*').eq('month', month),
    ])

    const users = (usersRes.data || []) as UserProfile[]
    setSaUsers(users)
    setAllRecords((saRes.data || []) as SARecord[])
    setTargets((kpiRes.data || []) as KPITarget[])

    // Init target edits
    const edits: Record<string, Record<KPIMetric, string>> = {}
    const overrides: Record<string, string> = {}
    for (const u of users) {
      edits[u.id] = {} as Record<KPIMetric, string>
      const userMetrics = getMetrics(u.kpi_type)
      for (const m of userMetrics) {
        const existing = (kpiRes.data || []).find(
          (t: any) => t.user_id === u.id && t.metric === m.key
        )
        edits[u.id][m.key] = existing ? String(existing.target_value) : ''
        if (m.adminOnly && existing?.actual_override != null) {
          overrides[`${u.id}__${m.key}`] = String(existing.actual_override)
        }
      }
    }
    setTargetEdits(edits)
    setActualOverrideEdits(overrides)
    setLoading(false)
  }

  const branches = useMemo(() =>
    Array.from(new Set(saUsers.filter(u => u.branch).map(u => u.branch!))).sort()
  , [saUsers])

  const reportData = useMemo(() => {
    // Filter users by top-level branch filter then by specific employee
    const branchFiltered = filterBranch === 'all' ? saUsers : saUsers.filter(u => u.branch === filterBranch)
    const targetUsers = reportEmployee === 'all' ? branchFiltered : branchFiltered.filter(u => u.id === reportEmployee)

    const userStats = targetUsers.map(u => {
      const recs = reportRecords.filter(r =>
        r.pic_user_id === u.id ||
        (u.pic_name && r.pic?.toLowerCase() === u.pic_name.toLowerCase())
      )
      return {
        user: u,
        callCount: recs.length,
        reactivationCount: recs.filter(r => r.reactivation).length,
        feeTotal: recs.reduce((s, r) => s + (r.transaction_fee || 0), 0),
        valueTotal: recs.reduce((s, r) => s + (r.total_transaction_value || 0), 0),
      }
    })
    const branchMap = new Map<string, { callCount: number; reactivationCount: number; feeTotal: number; valueTotal: number }>()
    for (const us of userStats) {
      const br = us.user.branch || 'Chưa phân CN'
      if (!branchMap.has(br)) branchMap.set(br, { callCount: 0, reactivationCount: 0, feeTotal: 0, valueTotal: 0 })
      const b = branchMap.get(br)!
      b.callCount += us.callCount
      b.reactivationCount += us.reactivationCount
      b.feeTotal += us.feeTotal
      b.valueTotal += us.valueTotal
    }
    const totals = userStats.reduce((acc, us) => ({
      callCount: acc.callCount + us.callCount,
      reactivationCount: acc.reactivationCount + us.reactivationCount,
      feeTotal: acc.feeTotal + us.feeTotal,
      valueTotal: acc.valueTotal + us.valueTotal,
    }), { callCount: 0, reactivationCount: 0, feeTotal: 0, valueTotal: 0 })
    return {
      totals,
      topByCalls:        [...userStats].sort((a, b) => b.callCount - a.callCount).slice(0, reportTopN),
      topByReactivation: [...userStats].sort((a, b) => b.reactivationCount - a.reactivationCount).slice(0, reportTopN),
      topByFee:          [...userStats].sort((a, b) => b.feeTotal - a.feeTotal).slice(0, reportTopN),
      branchStats: [...branchMap.entries()]
        .map(([branch, s]) => ({ branch, ...s }))
        .sort((a, b) => b.callCount - a.callCount),
    }
  }, [saUsers, reportRecords, filterBranch, reportEmployee, reportTopN])

  const ranking = useMemo(() => {
    let users = filterBranch === 'all' ? saUsers : saUsers.filter(u => u.branch === filterBranch)
    if (rankingRoleFilter !== 'all') users = users.filter(u => (u.kpi_type || 'sa') === rankingRoleFilter)
    const mapped = users.map(u => {
      const recs = allRecords.filter(r =>
        r.pic_user_id === u.id ||
        (u.pic_name && r.pic?.toLowerCase() === u.pic_name.toLowerCase())
      )
      const userTargets = targets.filter(t => t.user_id === u.id)
      const actual = computeActual(recs, userTargets)
      const metrics = getMetrics(u.kpi_type)
      const score = computeWeightedScore(actual, userTargets, metrics)
      return { user: u, actual, score, userTargets, metrics }
    })
    return mapped.sort((a, b) => rankingSortDir === 'desc' ? b.score - a.score : a.score - b.score)
  }, [saUsers, allRecords, targets, filterBranch, rankingRoleFilter, rankingSortDir])

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

  function handleActualOverrideChange(userId: string, metric: KPIMetric, value: string) {
    setActualOverrideEdits(prev => ({ ...prev, [`${userId}__${metric}`]: value }))
    setSaveMsg('')
  }

  function fillAllDefault() {
    setActualOverrideEdits(prev => {
      const next = { ...prev }
      for (const u of saUsers) {
        for (const m of getMetrics(u.kpi_type)) {
          if (m.adminOnly) next[`${u.id}__${m.key}`] = '100'
        }
      }
      return next
    })
    setSaveMsg('Đã điền 100 toàn bộ Phần A — nhấn Lưu để áp dụng.')
  }

  function copyFromFirst() {
    if (saUsers.length < 2) { setSaveMsg('Chỉ có 1 nhân viên!'); return }
    const first = saUsers[0]
    const firstType = first.kpi_type || 'sa'
    const sameType = saUsers.filter(u => (u.kpi_type || 'sa') === firstType)
    const metrics = getMetrics(firstType)
    if (targetPart === 'B') {
      setTargetEdits(prev => {
        const next = { ...prev }
        const firstVals = prev[first.id] || {}
        for (const u of sameType.slice(1)) {
          next[u.id] = { ...next[u.id] }
          for (const m of metrics) {
            if (!m.adminOnly) next[u.id][m.key as KPIMetric] = firstVals[m.key as KPIMetric] || ''
          }
        }
        return next
      })
    } else {
      setActualOverrideEdits(prev => {
        const next = { ...prev }
        for (const u of sameType.slice(1)) {
          for (const m of metrics) {
            if (m.adminOnly) next[`${u.id}__${m.key}`] = prev[`${first.id}__${m.key}`] || ''
          }
        }
        return next
      })
    }
    setSaveMsg(`Đã copy từ ${first.pic_name || first.full_name} (${firstType.toUpperCase()}) cho nhóm cùng loại — nhấn Lưu để áp dụng.`)
  }

  async function copyFromLastMonth() {
    const [y, m] = month.split('-').map(Number)
    const prevMonth = getMonthStr(new Date(y, m - 2, 1))
    const { data } = await supabase.from('kpi_targets').select('*').eq('month', prevMonth)
    if (!data || data.length === 0) {
      setSaveMsg(`Không tìm thấy chỉ tiêu của ${getMonthLabel(prevMonth)}!`)
      return
    }
    setTargetEdits(prev => {
      const next = { ...prev }
      for (const userId of Object.keys(next)) {
        next[userId] = { ...next[userId] }
        const u = saUsers.find(s => s.id === userId)
        for (const m of getMetrics(u?.kpi_type)) {
          if (!m.adminOnly) {
            const found = data.find((t: any) => t.user_id === userId && t.metric === m.key)
            if (found) next[userId][m.key as KPIMetric] = String(found.target_value)
          }
        }
      }
      return next
    })
    setSaveMsg(`Đã copy từ ${getMonthLabel(prevMonth)} — nhấn Lưu để áp dụng.`)
  }

  async function saveTargets() {
    setSaving(true)
    setSaveMsg('')
    const upserts: any[] = []

    for (const userId of Object.keys(targetEdits)) {
      const u = saUsers.find(s => s.id === userId)
      for (const m of getMetrics(u?.kpi_type)) {
        const overrideKey = `${userId}__${m.key}`
        if (m.adminOnly) {
          // Part A: target always 100, only save if actual_override is entered
          const override = actualOverrideEdits[overrideKey]
          if (override !== undefined && override !== '') {
            upserts.push({
              user_id: userId, metric: m.key, month,
              target_value: 100,
              actual_override: Number(override),
              updated_at: new Date().toISOString(),
            })
          }
        } else {
          // Part B: save target_value as entered
          const val = targetEdits[userId]?.[m.key]
          if (val !== '' && val !== undefined) {
            upserts.push({
              user_id: userId, metric: m.key, month,
              target_value: Number(val) || 0,
              actual_override: null,
              updated_at: new Date().toISOString(),
            })
          }
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

  async function updateKpiType(userId: string, newType: 'sa' | 'sup') {
    await supabase.from('user_profiles').update({ kpi_type: newType }).eq('id', userId)
    setSaUsers(prev => prev.map(u => u.id === userId ? { ...u, kpi_type: newType } : u))
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
          <h2 className="text-2xl font-bold text-gray-900">KPI Nhân viên</h2>
          <p className="text-sm text-gray-500 mt-1">
            {saUsers.filter(u => (u.kpi_type||'sa')==='sa').length} SA · {saUsers.filter(u => u.kpi_type==='sup').length} SUP
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTab('ranking')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'ranking' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Bảng xếp hạng
            </button>
            <button onClick={() => setTab('report')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${tab === 'report' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              <BarChart2 size={14} />Báo cáo
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
        <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
      ) : tab === 'report' ? (
        /* ===== REPORT TAB ===== */
        <div className="space-y-6">
          {/* Sub-view toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
            <button onClick={() => setReportView('employee')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                reportView === 'employee' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              KPI theo Nhân viên
            </button>
            <button onClick={() => setReportView('branch')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                reportView === 'branch' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              KPI theo Chi nhánh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng cuộc gọi', value: reportData.totals.callCount, unit: 'KH', icon: <Phone size={18} className="text-blue-500" />, color: 'bg-blue-50 border-blue-100' },
              { label: 'TK kích hoạt', value: reportData.totals.reactivationCount, unit: 'TK', icon: <RefreshCw size={18} className="text-green-500" />, color: 'bg-green-50 border-green-100' },
              { label: 'Phí GD', value: fmtMoney(reportData.totals.feeTotal), unit: 'VNĐ', icon: <DollarSign size={18} className="text-amber-500" />, color: 'bg-amber-50 border-amber-100' },
              { label: 'Giá trị GD', value: fmtMoney(reportData.totals.valueTotal), unit: 'VNĐ', icon: <TrendingUp size={18} className="text-purple-500" />, color: 'bg-purple-50 border-purple-100' },
            ].map(card => (
              <div key={card.label} className={`rounded-2xl border p-4 ${card.color}`}>
                <div className="flex items-center gap-2 mb-1">{card.icon}<span className="text-xs text-gray-500">{card.label}</span></div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400">{card.unit}</p>
              </div>
            ))}
          </div>

          {/* Top tables row — only in employee view */}
          {reportView === 'employee' && <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Cascading branch → employee dropdown */}
              <div ref={empDropdownRef} className="relative">
                <button
                  onClick={() => { setEmpDropdownOpen(o => !o); setHoveredBranch(null) }}
                  className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white min-w-[180px] justify-between hover:border-gray-300"
                >
                  <span className="truncate">
                    {reportEmployee === 'all' ? 'Tất cả NV' : (saUsers.find(u => u.id === reportEmployee)?.pic_name || saUsers.find(u => u.id === reportEmployee)?.full_name || 'NV')}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </button>
                {empDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 z-50 flex shadow-xl rounded-xl border border-gray-100 bg-white overflow-hidden">
                    {/* Left: branch list */}
                    <div className="w-44 py-1 border-r border-gray-100">
                      <button
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                          reportEmployee === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                        }`}
                        onClick={() => { setReportEmployee('all'); setEmpDropdownOpen(false) }}
                        onMouseEnter={() => setHoveredBranch(null)}
                      >
                        Tất cả NV
                      </button>
                      {branches.map(b => (
                        <button
                          key={b}
                          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-blue-50 ${
                            hoveredBranch === b ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                          onMouseEnter={() => setHoveredBranch(b)}
                        >
                          <span className="truncate">{b}</span>
                          <ChevronRight size={12} className="flex-shrink-0 text-gray-400" />
                        </button>
                      ))}
                    </div>
                    {/* Right: employees of hovered branch */}
                    {hoveredBranch && (
                      <div className="w-44 py-1 max-h-64 overflow-y-auto">
                        {saUsers.filter(u => u.branch === hoveredBranch).map(u => (
                          <button
                            key={u.id}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                              reportEmployee === u.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                            onClick={() => { setReportEmployee(u.id); setEmpDropdownOpen(false) }}
                          >
                            {u.pic_name || u.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <select value={reportTopN} onChange={e => setReportTopN(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white">
                {[3, 5, 10, 15, 20].map(n => <option key={n} value={n}>Top {n}</option>)}
              </select>
              {reportLoading
                ? <span className="text-xs text-gray-400">Đang tải...</span>
                : <span className="text-xs text-gray-400">{reportRecords.length} records</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top by calls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <Phone size={15} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-800">Top NV gọi nhiều KH nhất</span>
              </div>
              <div className="divide-y divide-gray-50">
                {reportData.topByCalls.map((us, i) => (
                  <div key={us.user.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{us.user.pic_name || us.user.full_name}</p>
                      {us.user.branch && <p className="text-[10px] text-gray-400">{us.user.branch}</p>}
                    </div>
                    <span className="text-sm font-bold text-blue-600">{us.callCount}</span>
                  </div>
                ))}
                {reportData.topByCalls.length === 0 && <p className="px-4 py-6 text-center text-xs text-gray-400">Chưa có dữ liệu</p>}
              </div>
            </div>
            {/* Top by reactivation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <RefreshCw size={15} className="text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Top NV có số lượng TK kích hoạt nhiều nhất</span>
              </div>
              <div className="divide-y divide-gray-50">
                {reportData.topByReactivation.map((us, i) => (
                  <div key={us.user.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{us.user.pic_name || us.user.full_name}</p>
                      {us.user.branch && <p className="text-[10px] text-gray-400">{us.user.branch}</p>}
                    </div>
                    <span className="text-sm font-bold text-green-600">{us.reactivationCount}</span>
                  </div>
                ))}
                {reportData.topByReactivation.length === 0 && <p className="px-4 py-6 text-center text-xs text-gray-400">Chưa có dữ liệu</p>}
              </div>
            </div>
            {/* Top by fee */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <DollarSign size={15} className="text-amber-500" />
                <span className="text-sm font-semibold text-gray-800">Top NV có SL Phí GD/Giá trị GD nhiều nhất</span>
              </div>
              <div className="divide-y divide-gray-50">
                {reportData.topByFee.map((us, i) => (
                  <div key={us.user.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{us.user.pic_name || us.user.full_name}</p>
                      {us.user.branch && <p className="text-[10px] text-gray-400">{us.user.branch}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-600">{fmtMoney(us.feeTotal)}</p>
                      <p className="text-[10px] text-gray-400">{fmtMoney(us.valueTotal)}</p>
                    </div>
                  </div>
                ))}
                {reportData.topByFee.length === 0 && <p className="px-4 py-6 text-center text-xs text-gray-400">Chưa có dữ liệu</p>}
              </div>
            </div>
            </div>
          </div>}

          {/* Branch breakdown — only in branch view */}
          {reportView === 'branch' && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <BarChart2 size={15} className="text-indigo-500" />
              <span className="text-sm font-semibold text-gray-800">Theo chi nhánh</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Chi nhánh</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Số lượng cuộc gọi</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Số lượng TK kích hoạt</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Tổng Phí GD</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500">Tổng Giá trị GD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData.branchStats.map(b => (
                    <tr key={b.branch} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{b.branch}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="font-semibold text-blue-600">{b.callCount}</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1 mt-1 ml-auto">
                          <div className="h-1 rounded-full bg-blue-400" style={{ width: `${reportData.totals.callCount > 0 ? Math.round(b.callCount / reportData.totals.callCount * 100) : 0}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-green-600">{b.reactivationCount}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-amber-600">{fmtMoney(b.feeTotal)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-purple-600">{fmtMoney(b.valueTotal)}</td>
                    </tr>
                  ))}
                  {reportData.branchStats.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">Chưa có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>}
        </div>
      ) : tab === 'ranking' ? (
        /* ===== RANKING TAB ===== */
        <div className="space-y-3">
          {/* Ranking filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              {(['all', 'sa', 'sup'] as const).map(r => (
                <button key={r} onClick={() => setRankingRoleFilter(r)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    rankingRoleFilter === r
                      ? r === 'all' ? 'bg-gray-700 text-white' : r === 'sa' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {r === 'all' ? 'Tất cả' : r.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setRankingSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              {rankingSortDir === 'desc' ? '↓ Cao → Thấp' : '↑ Thấp → Cao'}
            </button>
            <span className="text-xs text-gray-400">{ranking.length} nhân viên</span>
          </div>
          {ranking.map((item, idx) => {
            // Compute part A and B scores
            let aWs = 0, aTw = 0, bWs = 0, bTw = 0
            for (const m of item.metrics) {
              const t = item.userTargets.find(t => t.metric === m.key)
              if (t && t.target_value > 0) {
                const ratio = Math.min(item.actual[m.key] / t.target_value, 1)
                if (m.group.startsWith('A')) { aWs += ratio * m.weight; aTw += m.weight }
                else { bWs += ratio * m.weight; bTw += m.weight }
              }
            }
            const sA = aTw > 0 ? Math.round((aWs/aTw)*100) : null
            const sB = bTw > 0 ? Math.round((bWs/bTw)*100) : null
            const bMetrics = PART_B_METRICS.filter(m => !m.adminOnly)
            return (
              <div key={item.user.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* User header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">{rankingSortDir === 'desc' ? getRankIcon(idx) : <span className="text-xs text-gray-400 w-[18px] text-center">{idx + 1}</span>}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{item.user.full_name || item.user.email}</span>
                      {item.user.branch && <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{item.user.branch}</span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.user.kpi_type === 'sup' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>{item.user.kpi_type || 'sa'}</span>
                      <span className="text-xs text-gray-400">PIC: {item.user.pic_name || '—'}</span>
                    </div>
                  </div>
                  {/* Score pills */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {sA !== null && (
                      <div className="text-center">
                        <p className="text-[9px] text-gray-400">Phần A</p>
                        <p className={`text-sm font-bold ${sA >= 100 ? 'text-green-600' : sA >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>{sA}%</p>
                      </div>
                    )}
                    {sB !== null && (
                      <div className="text-center">
                        <p className="text-[9px] text-gray-400">Phần B</p>
                        <p className={`text-sm font-bold ${sB >= 100 ? 'text-green-600' : sB >= 70 ? 'text-yellow-600' : 'text-red-500'}`}>{sB}%</p>
                      </div>
                    )}
                    <div className={`ml-1 px-3 py-1.5 rounded-xl text-center ${item.score >= 100 ? 'bg-green-100 text-green-700' : item.score >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                      <p className="text-[9px] font-medium opacity-70">Tổng KPI</p>
                      <p className="text-sm font-bold">{item.score}%</p>
                    </div>
                  </div>
                </div>
                {/* B metrics only in ranking (B is CRM-computed, meaningful for comparison) */}
                <div className="grid grid-cols-5 md:grid-cols-10 divide-x divide-y divide-gray-50">
                  {bMetrics.map(m => {
                    const val = item.actual[m.key]
                    const t = item.userTargets.find(t => t.metric === m.key)
                    const rawPct = t && t.target_value > 0 ? Math.round((val / t.target_value) * 100) : null
                    const pct = rawPct !== null ? Math.min(rawPct, 100) : null
                    const overAchieved = rawPct !== null && rawPct > 100
                    const dispVal = m.unit === 'VNĐ' ? (val >= 1e6 ? (val/1e6).toFixed(1)+'M' : String(val)) : m.unit === '%' ? val+'%' : String(val)
                    return (
                      <div key={m.key} className="px-2 py-2 text-center">
                        <p className="text-[9px] text-gray-400 truncate leading-tight">
                          <span className="text-[8px] text-gray-300">{m.group} </span>{m.label}
                        </p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{dispVal}</p>
                        {pct !== null ? (
                          <>
                            <div className="w-full bg-gray-100 rounded-full h-0.5 mt-1">
                              <div className={`h-0.5 rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <p className="text-[9px] mt-0.5 font-medium" style={{ color: overAchieved ? '#16a34a' : pct !== null && pct >= 70 ? '#ca8a04' : '#f87171' }}>
                              {overAchieved ? '✓ Đạt' : `${pct}%`}
                            </p>
                          </>
                        ) : <p className="text-[9px] text-gray-200 mt-1">—</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {ranking.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
              Chưa có nhân viên SA nào
            </div>
          )}
        </div>
      ) : (
        /* ===== TARGETS TAB ===== */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Part A / B sub-tab */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
              <button onClick={() => setTargetPart('B')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${targetPart === 'B' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                Phần B — Sales (10 metrics)
              </button>
              <button onClick={() => setTargetPart('A')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${targetPart === 'A' ? 'bg-violet-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                Phần A — Nghiệp vụ
              </button>
            </div>
            {saveMsg && (
              <span className={`text-xs ${saveMsg.startsWith('Lỗi') ? 'text-red-600' : saveMsg.startsWith('Không') ? 'text-orange-500' : 'text-green-600'}`}>{saveMsg}</span>
            )}
            <button onClick={copyFromLastMonth} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Copy tháng trước
            </button>
            <button onClick={copyFromFirst} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-teal-300 text-teal-700 rounded-lg text-xs font-medium hover:bg-teal-50 disabled:opacity-50 transition-colors">
              Copy từ người đầu tiên
            </button>
            {targetPart === 'A' && (
              <button onClick={fillAllDefault} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-50 disabled:opacity-50 transition-colors">
                Điền 100 Phần A
              </button>
            )}
            <button onClick={saveTargets} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Save size={13} /> {saving ? 'Đang lưu...' : 'Lưu chỉ tiêu'}
            </button>
          </div>
          {targetPart === 'A' && (
            <div className="px-4 py-2 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
              <p className="text-xs text-violet-600">Phần A: nhập ô <strong>Thực tế (0–100)</strong> cho từng nhân viên — click badge để đổi SA⇔SUP.</p>
              <div className="flex gap-1 bg-white border border-violet-200 rounded-lg p-0.5">
                <button onClick={() => setKpiTypeFilter('sa')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${kpiTypeFilter === 'sa' ? 'bg-violet-600 text-white' : 'text-violet-400 hover:text-violet-600'}`}>
                  SA ({saUsers.filter(u => (u.kpi_type || 'sa') === 'sa').length} NV)
                </button>
                <button onClick={() => setKpiTypeFilter('sup')}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all ${kpiTypeFilter === 'sup' ? 'bg-violet-600 text-white' : 'text-violet-400 hover:text-violet-600'}`}>
                  SUP ({saUsers.filter(u => u.kpi_type === 'sup').length} NV)
                </button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[170px]">Nhân viên</th>
                  {(targetPart === 'A' ? getMetrics(kpiTypeFilter).filter(m => m.group.startsWith('A')) : PART_B_METRICS).map(m => (
                    <th key={m.key} className="px-3 py-3 text-center font-medium text-gray-600 min-w-[120px]">
                      <span className="text-xs leading-tight block">{m.label}</span>
                      <span className="text-[9px] text-gray-400 block mb-1">{m.group} · {m.weight}%</span>
                      <span className="text-[9px] text-gray-400 font-normal leading-tight block whitespace-normal">{m.hint}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(targetPart === 'A' ? saUsers.filter(u => (u.kpi_type || 'sa') === kpiTypeFilter) : saUsers).map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-2.5 sticky left-0 bg-white group-hover:bg-gray-50">
                      <p className="font-medium text-gray-900 text-xs">{u.full_name || u.email}</p>
                      <p className="text-[10px] text-gray-400">
                        {u.branch && <span className="mr-1 text-blue-500">{u.branch}</span>}
                        {u.pic_name || '—'}
                      </p>
                      {targetPart === 'A' && (
                        <button onClick={() => updateKpiType(u.id, u.kpi_type === 'sup' ? 'sa' : 'sup')}
                          className="mt-1 text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                          {(u.kpi_type || 'sa').toUpperCase()}
                        </button>
                      )}
                    </td>
                    {(targetPart === 'A' ? getMetrics(u.kpi_type).filter(m => m.group.startsWith('A')) : PART_B_METRICS).map(m => (
                      <td key={m.key} className="px-2 py-2">
                        {m.adminOnly ? (
                          // Part A: only actual input, target hardcoded 100
                          <input
                            type="number"
                            min={0} max={100}
                            value={actualOverrideEdits[`${u.id}__${m.key}`] || ''}
                            onChange={e => handleActualOverrideChange(u.id, m.key, e.target.value)}
                            className="w-full px-2 py-1.5 border border-sky-300 rounded text-xs text-center focus:ring-1 focus:ring-sky-400 outline-none bg-sky-50"
                            placeholder="0–100"
                          />
                        ) : (
                          // Part B: target input
                          <input
                            type="number"
                            value={targetEdits[u.id]?.[m.key] || ''}
                            onChange={e => handleTargetChange(u.id, m.key, e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-center focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                            placeholder="—"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
