import { ARTICLES } from '../../constants/articles'
import EditStockModal from '../modals/EditStockModal'

export default function OverviewTab({ vm, techs }) {
  const { allStock, selectedTech, selectTech, filterArticle, onArticleFilterChange, articleFilterStock, editModal, setEditModal, saveCorrection } = vm

  function techStats(tech) {
    const ts = allStock.filter((s) => s.tech_name === tech)
    return { total: ts.reduce((a, s) => a + s.qty, 0), refs: ts.length, low: ts.filter((s) => s.qty <= 3).length, stock: ts }
  }

  return (
    <>
      <div className="filter-bar">
        <select value={filterArticle} onChange={(e) => onArticleFilterChange(e.target.value)}>
          <option value="">Tous les articles</option>
          {ARTICLES.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
        </select>
      </div>

      {!filterArticle ? (
        <>
          <div className="tech-grid-ov">
            {techs.map((tech) => {
              const { total, refs, low } = techStats(tech)
              return (
                <div key={tech} className={`tech-ov${selectedTech === tech ? ' sel' : ''}`} onClick={() => selectTech(tech)}>
                  <div className="tech-ov-name">{tech}</div>
                  <div className="tech-ov-stats">
                    <span className="mini b-ok">{total} articles</span>
                    <span className="mini b-gray">{refs} réf.</span>
                    {low > 0 && <span className="mini b-low">{low} stock bas</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedTech && (() => {
            const { stock } = techStats(selectedTech)
            return (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-header"><span>Stock de {selectedTech}</span></div>
                {stock.length === 0
                  ? <div className="empty">Aucun stock pour {selectedTech}</div>
                  : (
                    <div className="stock-list">
                      {stock.map((s) => {
                        const art = ARTICLES.find((a) => a.code === s.article_code)
                        const label = art ? art.label : s.article_code
                        return (
                          <div className="stock-item" key={s.article_code}>
                            <div className="stock-item-label">
                              {label}
                              <div className="stock-code">{s.article_code}</div>
                            </div>
                            <div className="stock-item-right">
                              <span className={`badge ${s.qty <= 3 ? 'b-low' : 'b-ok'}`}>{s.qty}</span>
                              <button
                                className="btn-edit"
                                onClick={() => setEditModal({ open: true, code: s.article_code, label, qty: s.qty, techName: selectedTech })}
                              >
                                Corriger
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                }
              </div>
            )
          })()}
        </>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header">
            <span>Stock &quot;{ARTICLES.find((a) => a.code === filterArticle)?.label || filterArticle}&quot; par technicien</span>
          </div>
          <div className="article-filter-result">
            <table>
              <thead><tr><th>Technicien</th><th>Quantité</th><th>Statut</th></tr></thead>
              <tbody>
                {techs.map((tech) => {
                  const s = articleFilterStock.find((x) => x.tech_name === tech)
                  const qty = s ? s.qty : 0
                  const cls = qty <= 0 ? 'b-gray' : qty <= 3 ? 'b-low' : 'b-ok'
                  const status = qty <= 0 ? 'Aucun stock' : qty <= 3 ? 'Stock bas' : 'OK'
                  return (
                    <tr key={tech}>
                      <td style={{ fontWeight: 500 }}>{tech}</td>
                      <td><span className={`badge ${cls}`}>{qty}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>{status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditStockModal
        open={editModal.open}
        label={editModal.label}
        currentQty={editModal.qty}
        onClose={() => setEditModal((p) => ({ ...p, open: false }))}
        onSave={saveCorrection}
      />
    </>
  )
}
