import type { VipTier, CustomerGroup } from '../types'

const groupColors: Record<string, string> = {
  'A': 'bg-red-100 text-red-800 border-red-200',
  'B': 'bg-orange-100 text-orange-800 border-orange-200',
  'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'D': 'bg-gray-100 text-gray-800 border-gray-200',
  'E': 'bg-blue-100 text-blue-800 border-blue-200',
  'F': 'bg-purple-100 text-purple-800 border-purple-200',
  'G': 'bg-pink-100 text-pink-800 border-pink-200',
  'H': 'bg-slate-100 text-slate-800 border-slate-200',
}

const vipColors: Record<VipTier, string> = {
  'Bình thường': 'bg-gray-100 text-gray-700 border-gray-200',
  'VIP Gold': 'bg-amber-100 text-amber-800 border-amber-300',
  'VIP Platinum': 'bg-sky-100 text-sky-800 border-sky-300',
  'VIP Diamond': 'bg-violet-100 text-violet-800 border-violet-300',
}

export function GroupBadge({ group }: { group: CustomerGroup | string }) {
  const letter = group?.charAt(0) || '?'
  const color = groupColors[letter] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {group}
    </span>
  )
}

export function VipBadge({ tier }: { tier: VipTier | string }) {
  const color = vipColors[tier as VipTier] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {tier}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Đã đóng': 'bg-green-100 text-green-800',
    'Đang xử lý': 'bg-yellow-100 text-yellow-800',
    'Chờ phản hồi': 'bg-blue-100 text-blue-800',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
