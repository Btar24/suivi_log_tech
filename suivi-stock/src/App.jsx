import { useState, useEffect } from 'react'
import { getTechnicians } from './services/technicianService'
import { getAdminPassword } from './services/configService'
import LoginScreen from './views/LoginScreen'
import AppShell from './views/AppShell'
import Toast from './components/ui/Toast'

function Splash() {
  return (
    <div id="splash">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Chargement...</div>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'suivi-stock-auth'

function loadSavedAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.error('Erreur de lecture de storage', e)
    return null
  }
}

function saveAuth(currentUser, isAdmin) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUser, isAdmin }))
  } catch (e) {
    console.error('Erreur d’écriture de storage', e)
  }
}

function clearAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Erreur de suppression de storage', e)
  }
}

export default function App() {
  const [appState, setAppState] = useState('splash')
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [techs, setTechs] = useState([])
  const [adminPassword, setAdminPassword] = useState(null)
  const [networkOnline, setNetworkOnline] = useState(true)

  useEffect(() => {
    const goOffline = () => setNetworkOnline(false)
    const goOnline = () => setNetworkOnline(true)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline) }
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const [techData, pw] = await Promise.all([getTechnicians(), getAdminPassword()])
        setTechs(techData)
        setAdminPassword(pw)
      } catch (e) {
        console.error(e)
      }

      const savedAuth = loadSavedAuth()
      if (savedAuth?.currentUser) {
        setCurrentUser(savedAuth.currentUser)
        setIsAdmin(Boolean(savedAuth.isAdmin))
        setAppState('app')
      } else {
        setAppState('login')
      }
    }
    init()
  }, [])

  function handleLoginTech(name) {
    setCurrentUser(name)
    setIsAdmin(false)
    saveAuth(name, false)
    setAppState('app')
  }

  function handleLoginAdmin() {
    setCurrentUser('Admin')
    setIsAdmin(true)
    saveAuth('Admin', true)
    setAppState('app')
  }

  function handleLogout() {
    setCurrentUser(null)
    setIsAdmin(false)
    clearAuth()
    setAppState('login')
  }

  return (
    <>
      {!networkOnline && (
        <div id="network-banner" className="show">
          Connexion perdue — vérifie ton réseau
        </div>
      )}

      {appState === 'splash' && <Splash />}

      {appState === 'login' && (
        <LoginScreen
          techs={techs}
          setTechs={setTechs}
          adminPassword={adminPassword}
          onLoginTech={handleLoginTech}
          onLoginAdmin={handleLoginAdmin}
        />
      )}

      {appState === 'app' && (
        <AppShell
          currentUser={currentUser}
          isAdmin={isAdmin}
          techs={techs}
          setTechs={setTechs}
          adminPassword={adminPassword}
          onLogout={handleLogout}
        />
      )}

      <Toast />
    </>
  )
}
