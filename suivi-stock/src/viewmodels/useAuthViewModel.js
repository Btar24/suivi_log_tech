import { useState } from 'react'
import { insertTechnician } from '../services/technicianService'
import { toast } from '../store/toastStore'

export function useAuthViewModel({ techs, setTechs, adminPassword, onLoginTech, onLoginAdmin }) {
  const [adminPw, setAdminPw] = useState('')
  const [adminError, setAdminError] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [newTechModalOpen, setNewTechModalOpen] = useState(false)

  async function loginAdmin() {
    if (!adminPassword) { toast('Erreur config'); return }
    setAdminLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    setAdminLoading(false)
    if (adminPw === adminPassword) {
      setAdminError(false)
      setAdminPw('')
      onLoginAdmin()
    } else {
      setAdminError(true)
      setAdminPw('')
    }
  }

  async function registerNewTech(name) {
    if (!name || !/^[a-zA-ZÀ-ÿ\s\-]+$/.test(name)) {
      toast('Prénom invalide')
      return
    }
    if (techs.includes(name)) {
      setNewTechModalOpen(false)
      onLoginTech(name)
      return
    }
    await insertTechnician(name)
    const updated = [...techs, name].sort()
    setTechs(updated)
    setNewTechModalOpen(false)
    onLoginTech(name)
    toast(`Bienvenue ${name} !`)
  }

  return {
    adminPw, setAdminPw,
    adminError, setAdminError,
    adminLoading,
    newTechModalOpen, setNewTechModalOpen,
    loginAdmin,
    registerNewTech,
  }
}
