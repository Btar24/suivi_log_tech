import { useState } from 'react'
import DeleteTechModal from '../modals/DeleteTechModal'

export default function TechniciansTab({ vm, techs }) {
  const { addTech, askDeleteTech, doDeleteTech, deleteTechModal, setDeleteTechModal } = vm
  const [newName, setNewName] = useState('')

  async function handleAdd() {
    await addTech(newName)
    setNewName('')
  }

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Gérer les techniciens</div>
      <div className="info-box">Les techniciens ajoutés ici (ou via &quot;Je suis nouveau&quot;) apparaissent sur l&apos;écran de connexion.</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <input
          type="text"
          value={newName}
          placeholder="Prénom du technicien"
          style={{ flex: 1, padding: '8px 10px', border: '0.5px solid var(--border2)', borderRadius: 'var(--rsm)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 14 }}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" onClick={handleAdd}>Ajouter</button>
      </div>
      <div className="tech-list-manage">
        {techs.length === 0
          ? <div className="empty">Aucun technicien</div>
          : techs.map((t) => (
            <div className="tech-item" key={t}>
              <span>{t}</span>
              <button className="btn btn-sm btn-danger" onClick={() => askDeleteTech(t)}>Supprimer</button>
            </div>
          ))
        }
      </div>

      <DeleteTechModal
        open={deleteTechModal.open}
        name={deleteTechModal.name}
        onClose={() => setDeleteTechModal((p) => ({ ...p, open: false }))}
        onConfirm={doDeleteTech}
      />
    </div>
  )
}
