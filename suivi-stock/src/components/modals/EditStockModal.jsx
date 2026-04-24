import { useState, useEffect } from 'react'
import QuantityStepper from '../ui/QuantityStepper'

export default function EditStockModal({ open, label, currentQty, onClose, onSave }) {
  const [qty, setQty] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) { setQty(currentQty); setNote(''); setLoading(false) }
  }, [open, currentQty])

  async function handleSave() {
    setLoading(true)
    const ok = await onSave(qty, note)
    if (!ok) setLoading(false)
  }

  if (!open) return null
  return (
    <div className="modal-bg">
      <div className="modal">
        <div className="modal-handle" />
        <h3>Corriger la quantité</h3>
        <div className="info-box">{label} — quantité actuelle : {currentQty}</div>
        <div className="fg">
          <label>Nouvelle quantité</label>
          <QuantityStepper value={qty} min={0} onChange={setQty} />
        </div>
        <div className="fg">
          <label>Motif</label>
          <input type="text" value={note} placeholder="Erreur de saisie, inventaire..." onChange={(e) => setNote(e.target.value)} />
        </div>
        <button className="bottom-btn bottom-btn-primary" disabled={loading} onClick={handleSave}>
          Corriger
        </button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn" onClick={onClose} style={{ border: 'none', color: 'var(--muted)' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
