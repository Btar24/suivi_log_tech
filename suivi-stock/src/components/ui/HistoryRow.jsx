import { ARTICLES } from '../../constants/articles'

const LABELS = { use: 'Utilisé', receive: 'Reçu', admin_in: 'Expédition', correction: 'Correction' }

export default function HistoryRow({ move, showTech = false, onDelete }) {
  const art = ARTICLES.find((a) => a.code === move.article_code)
  const artLabel = art ? art.label : move.article_code
  const isIn = move.type === 'receive' || move.type === 'admin_in' || move.type === 'correction'
  const sign = isIn ? '+' : '-'
  const tagCls = move.type === 'admin_in' || move.type === 'correction' ? 'tag-admin' : isIn ? 'tag-in' : 'tag-out'
  const date = new Date(move.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  function handleDelete() {
    onDelete({ ...move, _label: artLabel })
  }

  return (
    <div className="hist-row">
      <div className={`hdot ${isIn ? 'hdot-in' : 'hdot-out'}`} />
      <div className="hcontent">
        <div className="htitle">
          {showTech && <><strong>{move.tech_name}</strong> — </>}
          {artLabel}{' '}
          <span style={{ color: isIn ? 'var(--green)' : 'var(--red)' }}>{sign}{move.qty}</span>
        </div>
        <div className="hmeta">
          <span className={`tag ${tagCls}`}>{LABELS[move.type] || move.type}</span>
          {' · '}{date}
          {move.note && ` · ${move.note}`}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <button className="btn btn-sm btn-danger" onClick={handleDelete}>Supprimer</button>
      </div>
    </div>
  )
}
