import { useState } from 'react'

export default function SecurityTab({ vm }) {
  const { changePassword } = vm
  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    setError('')
    const err = await changePassword(current, newPw, confirm)
    if (err) { setError(err); return }
    setCurrent(''); setNewPw(''); setConfirm('')
  }

  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Changer le mot de passe admin</div>
      <div className="info-box">Le mot de passe est stocké dans Supabase, jamais dans le code source.</div>
      <div className="fg">
        <label>Mot de passe actuel</label>
        <input type="password" value={current} placeholder="Mot de passe actuel" onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div className="fg">
        <label>Nouveau mot de passe</label>
        <input type="password" value={newPw} placeholder="6 caractères minimum" onChange={(e) => setNewPw(e.target.value)} />
      </div>
      <div className="fg">
        <label>Confirmer</label>
        <input type="password" value={confirm} placeholder="Confirmer" onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {error && <div className="error-msg show">{error}</div>}
      <div style={{ textAlign: 'right', marginTop: 4 }}>
        <button className="btn btn-primary" onClick={handleSubmit}>Mettre à jour</button>
      </div>
    </div>
  )
}
