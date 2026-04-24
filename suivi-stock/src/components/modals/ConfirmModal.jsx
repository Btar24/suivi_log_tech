export default function ConfirmModal({ open, text, onClose, onConfirm }) {
  if (!open) return null
  return (
    <div className="modal-bg modal-center">
      <div className="modal">
        <div className="modal-handle" />
        <h3>Confirmer la suppression</h3>
        <p>{text}</p>
        <button className="bottom-btn bottom-btn-danger" onClick={onConfirm}>Supprimer</button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn" onClick={onClose} style={{ border: 'none', color: 'var(--muted)' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
