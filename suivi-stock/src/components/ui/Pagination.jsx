import { PAGE_SIZE } from '../../constants/articles'

export default function Pagination({ page, total, onPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <span>{total} entrées · page {page}/{totalPages}</span>
      <div className="pagination-btns">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>←</button>
        <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>→</button>
      </div>
    </div>
  )
}
