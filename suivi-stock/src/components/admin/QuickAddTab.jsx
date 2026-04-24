import ArticleSearch from '../ui/ArticleSearch'
import QuantityStepper from '../ui/QuantityStepper'

export default function QuickAddTab({ vm, techs }) {
  const { qaTech, setQaTech, qaCode, setQaCode, qaLabel, setQaLabel, qaQty, setQaQty, qaNote, setQaNote, saveQuickAdd } = vm

  function handleSelect(code, label) {
    setQaCode(code)
    setQaLabel(label)
  }

  async function handleSave() {
    await saveQuickAdd()
  }

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Ajout rapide de stock</div>
      <div className="info-box">Pour ajouter quelques pièces à un technicien sans créer une expédition complète.</div>
      <div className="fg">
        <label>Technicien</label>
        <select value={qaTech} onChange={(e) => setQaTech(e.target.value)}>
          <option value="">Sélectionner...</option>
          {techs.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="fg">
        <label>Article</label>
        <ArticleSearch value={qaLabel} onSelect={handleSelect} />
      </div>
      <div className="fg">
        <label>Quantité</label>
        <QuantityStepper value={qaQty} min={1} onChange={setQaQty} />
      </div>
      <div className="fg">
        <label>Note (optionnel)</label>
        <input type="text" value={qaNote} placeholder="Motif, référence..." onChange={(e) => setQaNote(e.target.value)} />
      </div>
      <div style={{ textAlign: 'right' }}>
        <button className="btn btn-primary" onClick={handleSave}>Ajouter au stock</button>
      </div>
    </div>
  )
}
