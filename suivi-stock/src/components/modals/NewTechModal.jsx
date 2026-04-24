import { useState, useEffect, useRef } from 'react'

export default function NewTechModal({ open, onClose, onRegister }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName('')
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function handleSubmit() {
    setLoading(true)
    await onRegister(name.trim())
    setLoading(false)
  }

  if (!open) return null
  return (
    <div className="modal-bg modal-center">
      <div className="modal">
        <div className="modal-handle" />
        <h3>Ajouter mon prénom</h3>
        <p>Entre ton prénom pour créer ton accès.</p>
        <div className="fg">
          <label>Prénom</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ex: Thomas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button
          className="bottom-btn bottom-btn-primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          Créer mon accès
        </button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn" onClick={onClose} style={{ border: 'none', color: 'var(--muted)' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
