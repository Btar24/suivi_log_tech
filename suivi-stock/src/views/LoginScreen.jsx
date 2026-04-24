import { useAuthViewModel } from '../viewmodels/useAuthViewModel'
import NewTechModal from '../components/modals/NewTechModal'

export default function LoginScreen({ techs, setTechs, adminPassword, onLoginTech, onLoginAdmin }) {
  const vm = useAuthViewModel({ techs, setTechs, adminPassword, onLoginTech, onLoginAdmin })

  return (
    <div id="login-screen" className="show">
      <div className="login-box">
        <h1>Stock Techniciens</h1>
        <div className="lsub">Identifie-toi pour accéder à ton stock</div>
        <div id="tech-buttons">
          {techs.map((t) => (
            <button key={t} className="tech-btn" onClick={() => onLoginTech(t)}>{t}</button>
          ))}
        </div>
        <button className="btn-new-tech" onClick={() => vm.setNewTechModalOpen(true)}>+ Je suis nouveau</button>
        <div className="divider">ou</div>
        <div className="admin-row">
          <input
            type="password"
            placeholder="Code administrateur"
            value={vm.adminPw}
            onChange={(e) => { vm.setAdminPw(e.target.value); vm.setAdminError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && vm.loginAdmin()}
          />
          <button className="btn btn-primary" disabled={vm.adminLoading} onClick={vm.loginAdmin}>Admin</button>
        </div>
        {vm.adminError && <div className="error-msg show">Code incorrect</div>}
      </div>

      <NewTechModal
        open={vm.newTechModalOpen}
        onClose={() => vm.setNewTechModalOpen(false)}
        onRegister={vm.registerNewTech}
      />
    </div>
  )
}
