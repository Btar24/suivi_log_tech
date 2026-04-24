import { useState, useEffect } from 'react'
import ArticleSearch from '../ui/ArticleSearch'
import QuantityStepper from '../ui/QuantityStepper'

export default function MoveModal({ open, type, onClose, onSave }) {
  const [code, setCode] = useState('')
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) { setCode(''); setQty(1); setNote(''); setLoading(false) }
  }, [open])

  async function handleSave() {
    setLoading(true)
    const ok = await onSave(code, qty, note)
    if (!ok) setLoading(false)
  }

  if (!open) return null
  const title = type === 'use' ? "J'ai utilisé du matériel" : "J'ai reçu du matériel"
  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-handle" />
        <h3>{title}</h3>
        <div className="fg">
          <label>Quel article ?</label>
          <ArticleSearch onSelect={(c) => setCode(c)} />
        </div>
        <div className="fg">
          <label>Combien ?</label>
          <QuantityStepper value={qty} min={1} onChange={setQty} />
        </div>
        <div className="fg">
          <label>Note (optionnel)</label>
          <input type="text" value={note} placeholder="Chantier, référence..." onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="bottom-btn bottom-btn-primary" disabled={loading} onClick={handleSave}>
          Confirmer
        </button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn" onClick={onClose} style={{ border: 'none', color: 'var(--muted)' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
