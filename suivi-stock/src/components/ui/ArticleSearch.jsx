import { useState, useRef } from 'react'
import { ARTICLES } from '../../constants/articles'

export default function ArticleSearch({ value, onSelect, placeholder = 'Rechercher un article...' }) {
  const [search, setSearch] = useState(value || '')
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)

  function getFiltered() {
    const q = search.toLowerCase()
    return ARTICLES.filter((a) => a.label.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
  }

  function handleFocus() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setSearch('')
    setOpen(true)
  }

  function handleBlur() {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  function handleInput(e) {
    setSearch(e.target.value)
    setOpen(true)
  }

  function select(code, label) {
    setSearch(label)
    setOpen(false)
    onSelect(code, label)
  }

  function highlight(text) {
    if (!search) return text
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
  }

  const filtered = getFiltered()

  return (
    <div className="article-search-wrap">
      <input
        type="text"
        value={search}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        onChange={(e) => setSearch(e.target.value)}
      />
      {open && filtered.length > 0 && (
        <div className="article-dropdown">
          {filtered.map((a) => (
            <div
              key={a.code}
              className="article-option"
              onMouseDown={() => select(a.code, a.label)}
            >
              <span dangerouslySetInnerHTML={{ __html: highlight(a.label) }} />
              <br />
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{a.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
