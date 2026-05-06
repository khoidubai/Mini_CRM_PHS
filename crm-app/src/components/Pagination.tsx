import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export default function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white rounded-b-xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Hiển thị {from}–{to} / {total}</span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm ml-2"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>{s} / trang</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
