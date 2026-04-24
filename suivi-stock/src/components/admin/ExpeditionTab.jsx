import { ARTICLES } from '../../constants/articles'
import Spinner from '../ui/Spinner'

const CARRIERS = ['Chronopost', 'Colissimo', 'DHL', 'UPS', 'GLS', 'DPD']

export default function ExpeditionTab({ vm, techs }) {
  const {
    expTech, setExpTech, expDate, setExpDate,
    expCarrier, setExpCarrier, expTracking, setExpTracking,
    expNote, setExpNote, expItems, addExpItem, removeExpItem, updateExpItem,
    expHistory, saveExpedition,
  } = vm

  async function handleSave() {
    await saveExpedition()
  }

  return (
    <>
      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Nouvelle expédition</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="fg" style={{ margin: 0 }}>
            <label>Technicien</label>
            <select value={expTech} onChange={(e) => setExpTech(e.target.value)}>
              <option value="">Sélectionner...</option>
              {techs.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label>Date</label>
            <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="fg" style={{ margin: 0 }}>
            <label>Transporteur</label>
            <select value={expCarrier} onChange={(e) => setExpCarrier(e.target.value)}>
              <option value="">—</option>
              {CARRIERS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg" style={{ margin: 0 }}>
            <label>N° de suivi</label>
            <input type="text" value={expTracking} placeholder="Optionnel" onChange={(e) => setExpTracking(e.target.value)} />
          </div>
        </div>

        <div className="exped-items">
          <div className="exped-item-header"><span>Article</span><span>Qté</span><span /></div>
          {expItems.map((item, i) => (
            <div className="exped-item-row" key={i}>
              <select value={item.code} onChange={(e) => updateExpItem(i, 'code', e.target.value)}>
                <option value="">Sélectionner...</option>
                {ARTICLES.map((a) => <option key={a.code} value={a.code}>{a.label}</option>)}
              </select>
              <input type="number" value={item.qty} min={1} onChange={(e) => updateExpItem(i, 'qty', parseInt(e.target.value) || 1)} />
              <button className="btn-rm" onClick={() => removeExpItem(i)}>×</button>
            </div>
          ))}
        </div>
        <button className="btn-add-item" onClick={addExpItem}>+ Ajouter un article</button>

        <div className="fg">
          <label>Note</label>
          <input type="text" value={expNote} placeholder="Chantier, motif... (optionnel)" onChange={(e) => setExpNote(e.target.value)} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={handleSave}>Enregistrer l&apos;expédition</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header"><span>Expéditions récentes</span></div>
        {expHistory.length === 0
          ? <div className="loader"><div className="spinner" /></div>
          : (
            <table className="tbl">
              <thead><tr><th>Date</th><th>Technicien</th><th>Article</th><th>Qté</th><th>Note</th></tr></thead>
              <tbody>
                {expHistory.map((m) => {
                  const art = ARTICLES.find((a) => a.code === m.article_code)
                  const date = new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                  return (
                    <tr key={m.id}>
                      <td>{date}</td>
                      <td>{m.tech_name}</td>
                      <td>{art ? art.label : m.article_code}</td>
                      <td><span className="badge b-ok">+{m.qty}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>{m.note || ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      </div>
    </>
  )
}
