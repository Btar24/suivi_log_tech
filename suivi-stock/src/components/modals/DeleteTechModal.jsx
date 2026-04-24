export default function DeleteTechModal({ open, name, onClose, onConfirm }) {
  if (!open) return null
  return (
    <div className="modal-bg modal-center">
      <div className="modal">
        <div className="modal-handle" />
        <h3>Supprimer le technicien</h3>
        <p>Supprimer &quot;{name}&quot; de la liste ? Son historique et stock sont conservés.</p>
        <button className="bottom-btn bottom-btn-danger" onClick={onConfirm}>Supprimer</button>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn" onClick={onClose} style={{ border: 'none', color: 'var(--muted)' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
