import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AppContent() {
  const [appState, setAppState] = useState('splash')
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [techs, setTechs] = useState([])
  const [adminPassword, setAdminPassword] = useState(null)
  const [networkOnline, setNetworkOnline] = useState(true)
  const navigate = useNavigate()

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
        // Navigate to appropriate route based on user type
        navigate(savedAuth.isAdmin ? '/admin' : '/tech', { replace: true })
      }
      setAppState('ready')
    }
    init()
  }, [navigate])

  function handleLoginTech(name) {
    setCurrentUser(name)
    setIsAdmin(false)
    saveAuth(name, false)
    navigate('/tech')
  }

  function handleLoginAdmin() {
    setCurrentUser('Admin')
    setIsAdmin(true)
    saveAuth('Admin', true)
    navigate('/admin')
  }

  function handleLogout() {
    setCurrentUser(null)
    setIsAdmin(false)
    clearAuth()
    navigate('/', { replace: true })
  }

  const isAuthenticated = Boolean(currentUser)

  return (
    <>
      {!networkOnline && (
        <div id="network-banner" className="show">
          Connexion perdue — vérifie ton réseau
        </div>
      )}

      {appState === 'splash' && <Splash />}

      {appState === 'ready' && (
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={isAdmin ? '/admin' : '/tech'} replace />
              ) : (
                <LoginScreen
                  techs={techs}
                  setTechs={setTechs}
                  adminPassword={adminPassword}
                  onLoginTech={handleLoginTech}
                  onLoginAdmin={handleLoginAdmin}
                />
              )
            }
          />
          <Route
            path="/tech"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated && !isAdmin}>
                <AppShell
                  currentUser={currentUser}
                  isAdmin={false}
                  techs={techs}
                  setTechs={setTechs}
                  adminPassword={adminPassword}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated && isAdmin}>
                <AppShell
                  currentUser={currentUser}
                  isAdmin={true}
                  techs={techs}
                  setTechs={setTechs}
                  adminPassword={adminPassword}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}

      <Toast />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
