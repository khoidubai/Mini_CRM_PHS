import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { SARecord, KPITarget, KPIMetric } from '../../types'
import { Target, Phone, Star, Users, ArrowRightLeft, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react'

const METRIC_META: Record<KPIMetric, { label: string; icon: any; unit: string; color: string }> = {
  reactivation:        { label: 'Tái kích hoạt TK', icon: Target,          unit: 'KH',  color: 'blue' },
  contact_success_rate:{ label: 'Tỷ lệ liên hệ thành công', icon: Phone,  unit: '%',   color: 'green' },
  call_count:          { label: 'Số cuộc gọi',       icon: Phone,          unit: '',    color: 'indigo' },
  interest_rate:       { label: 'Tỷ lệ KH quan tâm', icon: Star,          unit: '%',   color: 'yellow' },
  group_ab_count:      { label: 'KH nhóm A/B',       icon: Users,          unit: 'KH',  color: 'red' },
  handover_rm_count:   { label: 'Bàn giao RM',       icon: ArrowRightLeft, unit: '',    color: 'orange' },
  transaction_value:   { label: 'Tổng GTGD',         icon: DollarSign,     unit: 'VNĐ', color: 'emerald' },
  transaction_fee:     { label: 'Phí GD',            icon: DollarSign,     unit: 'VNĐ', color: 'teal' },
}

function getMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(m: string) {
  const [y, mo] = m.split('-')
  return `Tháng ${parseInt(mo)}/${y}`
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
      supabase.from('sa_records').select('*')
        .gte('call_date', monthStart)
        .lt('call_date', monthEnd),
      supabase.from('kpi_targets').select('*')
        .eq('user_id', user.id)
        .eq('month', month),
    ])

    // Filter client-side: match by pic_user_id or pic_name
    const allSa = (saRes.data || []) as SARecord[]
    const myRecords = allSa.filter(r =>
      r.pic_user_id === user.id ||
      (user.pic_name && r.pic?.toLowerCase() === user.pic_name.toLowerCase())
    )

    setRecords(user.role === 'admin' ? allSa : myRecords)
    setTargets((kpiRes.data || []) as KPITarget[])
    setLoading(false)
  }

  const actual = useMemo(() => {
    const total = records.length
    const contactSuccess = records.filter(r =>
      r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp'
    ).length
    const interested = records.filter(r =>
      r.interest_level === 'Rất quan tâm – muốn giao dịch ngay' ||
      r.interest_level === 'Quan tâm – cần follow thêm'
    ).length
    const reactivation = records.filter(r => r.reactivation).length
    const groupAB = records.filter(r =>
      r.customer_group?.startsWith('A') || r.customer_group?.startsWith('B')
    ).length
    const handoverRM = records.filter(r => !!r.handover_rm).length
    const txnValue = records.reduce((s, r) => s + (r.total_transaction_value || 0), 0)
    const txnFee = records.reduce((s, r) => s + (r.transaction_fee || 0), 0)

    return {
      reactivation,
      contact_success_rate: total > 0 ? Math.round((contactSuccess / total) * 100) : 0,
      call_count: total,
      interest_rate: contactSuccess > 0 ? Math.round((interested / contactSuccess) * 100) : 0,
      group_ab_count: groupAB,
      handover_rm_count: handoverRM,
      transaction_value: txnValue,
      transaction_fee: txnFee,
    } as Record<KPIMetric, number>
  }, [records])

  function getTarget(metric: KPIMetric): number | null {
    const t = targets.find(t => t.metric === metric)
    return t ? t.target_value : null
  }

  function changeMonth(delta: number) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMonth(getMonthStr(d))
  }

  const allMetrics = Object.keys(METRIC_META) as KPIMetric[]

  if (!user) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">KPI Cá nhân</h2>
          <p className="text-sm text-gray-500 mt-1">
            {user.full_name || user.email} — PIC: {user.pic_name || '(chưa set)'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18} /></button>
          <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">{getMonthLabel(month)}</span>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18} /></button>
        </div>
      </div>

      {!user.pic_name && user.role === 'sa' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800">
          ⚠️ Bạn chưa set <strong>Tên PIC</strong> trong <a href="/profile" className="underline font-semibold">Hồ sơ cá nhân</a>.
          Hệ thống cần tên PIC để mapping SA records cho bạn.
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-400">Đang tải...</div>
      ) : (
        <>
          {records.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-sm text-gray-600">
              Không có SA records trong <strong>{getMonthLabel(month)}</strong>.
              Thử chuyển sang tháng khác bằng nút ← →
              {user.pic_name && <span> (PIC: <strong>{user.pic_name}</strong>)</span>}
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {allMetrics.map(metric => {
              const meta = METRIC_META[metric]
              const val = actual[metric]
              const target = getTarget(metric)
              const pct = target && target > 0 ? Math.min(Math.round((val / target) * 100), 999) : null
              const Icon = meta.icon

              return (
                <div key={metric} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-${meta.color}-100 flex items-center justify-center`}>
                      <Icon size={16} className={`text-${meta.color}-600`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 leading-tight">{meta.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {meta.unit === 'VNĐ' ? val.toLocaleString('vi-VN') : val}
                    {meta.unit === '%' && '%'}
                  </div>
                  {target !== null ? (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">
                          Mục tiêu: {meta.unit === 'VNĐ' ? target.toLocaleString('vi-VN') : target}{meta.unit === '%' ? '%' : ''}
                        </span>
                        <span className={`font-bold ${pct! >= 100 ? 'text-green-600' : pct! >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${pct! >= 100 ? 'bg-green-500' : pct! >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(pct!, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2 italic">Chưa có mục tiêu</p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Stats summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tổng kết tháng</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tổng records</span>
                <p className="text-lg font-bold text-gray-900">{records.length}</p>
              </div>
              <div>
                <span className="text-gray-500">Liên hệ thành công</span>
                <p className="text-lg font-bold text-green-600">
                  {records.filter(r => r.call_result === 'Nghe máy – trao đổi' || r.call_result === 'Trực tiếp').length}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Tái kích hoạt</span>
                <p className="text-lg font-bold text-blue-600">{actual.reactivation}</p>
              </div>
              <div>
                <span className="text-gray-500">Bàn giao RM</span>
                <p className="text-lg font-bold text-orange-600">{actual.handover_rm_count}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
