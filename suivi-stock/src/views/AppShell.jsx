import TechView from '../components/tech/TechView'
import AdminView from '../components/admin/AdminView'

export default function AppShell({ currentUser, isAdmin, techs, setTechs, adminPassword, onLogout }) {
  return (
    <div id="app">
      <div className="topbar">
        <div>
          <h2>{isAdmin ? 'Tableau de bord admin' : `Bonjour, ${currentUser}`}</h2>
          <div className="tsub">{isAdmin ? 'Vue complète — tous les stocks' : 'Ton stock en temps réel'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span id="rt-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#639922', display: 'inline-block' }} />
          <button className="btn btn-sm" onClick={onLogout}>Changer</button>
        </div>
      </div>

      {isAdmin
        ? <AdminView currentUser={currentUser} techs={techs} setTechs={setTechs} adminPassword={adminPassword} />
        : <TechView currentUser={currentUser} />
      }
    </div>
  )
}
