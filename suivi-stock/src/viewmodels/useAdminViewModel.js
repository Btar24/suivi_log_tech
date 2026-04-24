import { useState, useCallback, useEffect } from 'react'
import { getAllStock, getStockByArticle, applyDelta, setStockQty } from '../services/stockService'
import { getMovements, getExpeditions, getAllMovements, insertMovement, deleteMovement } from '../services/movementService'
import { insertTechnician, deleteTechnician } from '../services/technicianService'
import { updateAdminPassword } from '../services/configService'
import { toast } from '../store/toastStore'
import { ARTICLES } from '../constants/articles'
import * as XLSX from 'xlsx'

export function useAdminViewModel({ techs, setTechs, adminPassword, currentUser }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [allStock, setAllStock] = useState([])
  const [selectedTech, setSelectedTech] = useState(null)

  // Article filter (overview)
  const [filterArticle, setFilterArticle] = useState('')
  const [articleFilterStock, setArticleFilterStock] = useState([])

  // Expedition
  const [expTech, setExpTech] = useState('')
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10))
  const [expCarrier, setExpCarrier] = useState('')
  const [expTracking, setExpTracking] = useState('')
  const [expNote, setExpNote] = useState('')
  const [expItems, setExpItems] = useState([{ code: '', qty: 1 }])
  const [expHistory, setExpHistory] = useState([])

  // Quick add
  const [qaTech, setQaTech] = useState('')
  const [qaCode, setQaCode] = useState('')
  const [qaLabel, setQaLabel] = useState('')
  const [qaQty, setQaQty] = useState(1)
  const [qaNote, setQaNote] = useState('')

  // Admin history
  const [histTech, setHistTech] = useState('')
  const [histType, setHistType] = useState('')
  const [history, setHistory] = useState([])
  const [histTotal, setHistTotal] = useState(0)
  const [histPage, setHistPage] = useState(1)

  // Modals
  const [editModal, setEditModal] = useState({ open: false, code: '', label: '', qty: 0, techName: '' })
  const [confirmModal, setConfirmModal] = useState({ open: false, text: '', fn: null })
  const [deleteTechModal, setDeleteTechModal] = useState({ open: false, name: '' })

  const loadOverview = useCallback(async () => {
    const data = await getAllStock()
    setAllStock(data)
  }, [])

  const loadExpHistory = useCallback(async () => {
    const data = await getExpeditions()
    setExpHistory(data)
  }, [])

  const loadHistory = useCallback(async (page = 1) => {
    setHistPage(page)
    const { data, count } = await getMovements({ techName: histTech, type: histType, page })
    setHistory(data)
    setHistTotal(count)
  }, [histTech, histType])

  useEffect(() => {
    if (activeTab === 'overview') loadOverview()
    if (activeTab === 'expedition') loadExpHistory()
    if (activeTab === 'history') loadHistory(1)
  }, [activeTab, loadOverview, loadExpHistory, loadHistory])

  async function onArticleFilterChange(code) {
    setFilterArticle(code)
    if (code) {
      const data = await getStockByArticle(code)
      setArticleFilterStock(data)
    }
  }

  function selectTech(name) {
    setSelectedTech((prev) => (prev === name ? null : name))
  }

  // Expedition
  function addExpItem() {
    setExpItems((items) => [...items, { code: '', qty: 1 }])
  }
  function removeExpItem(i) {
    setExpItems((items) => items.filter((_, idx) => idx !== i))
  }
  function updateExpItem(i, field, val) {
    setExpItems((items) => items.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  async function saveExpedition() {
    if (!expTech || !expDate) { toast('Technicien et date requis'); return false }
    const valid = expItems.filter((it) => it.code && it.qty > 0)
    if (!valid.length) { toast('Ajoute au moins un article'); return false }
    try {
      for (const item of valid) {
        await applyDelta(expTech, item.code, item.qty)
        await insertMovement({
          tech_name: expTech, article_code: item.code, qty: item.qty, type: 'admin_in',
          note: `Expédition du ${expDate}${expNote ? ' — ' + expNote : ''}`, by: 'admin',
        })
      }
      toast(`Expédition enregistrée pour ${expTech} ✓`)
      setExpTech(''); setExpDate(new Date().toISOString().slice(0, 10))
      setExpCarrier(''); setExpTracking(''); setExpNote('')
      setExpItems([{ code: '', qty: 1 }])
      loadExpHistory()
      loadOverview()
      return true
    } catch {
      toast('Erreur — réessaie')
      return false
    }
  }

  // Quick add
  async function saveQuickAdd() {
    if (!qaTech) { toast('Sélectionne un technicien'); return false }
    if (!qaCode) { toast('Sélectionne un article'); return false }
    if (qaQty <= 0) { toast('Quantité invalide'); return false }
    try {
      await applyDelta(qaTech, qaCode, qaQty)
      await insertMovement({ tech_name: qaTech, article_code: qaCode, qty: qaQty, type: 'admin_in', note: qaNote || 'Ajout rapide', by: 'admin' })
      toast(`+${qaQty} ajouté pour ${qaTech} ✓`)
      setQaTech(''); setQaCode(''); setQaLabel(''); setQaQty(1); setQaNote('')
      loadOverview()
      return true
    } catch {
      toast('Erreur — réessaie')
      return false
    }
  }

  // Correction (admin)
  async function saveCorrection(newQty, note) {
    if (isNaN(newQty) || newQty < 0) { toast('Quantité invalide'); return false }
    const { code, techName, qty: oldQty } = editModal
    const delta = newQty - oldQty
    try {
      await setStockQty(techName, code, newQty)
      if (delta !== 0) {
        await insertMovement({
          tech_name: techName, article_code: code,
          qty: Math.abs(delta), type: 'correction',
          note: note || 'Correction manuelle', by: 'admin',
        })
      }
      if (navigator.vibrate) navigator.vibrate(50)
      toast('Quantité corrigée ✓')
      setEditModal((p) => ({ ...p, open: false }))
      loadOverview()
      return true
    } catch {
      toast('Erreur — réessaie')
      return false
    }
  }

  function askDeleteMove(move) {
    const isIn = move.type === 'receive' || move.type === 'admin_in'
    setConfirmModal({
      open: true,
      text: `Supprimer "${move._label} ${isIn ? '+' : '−'}${move.qty}" pour ${move.tech_name} ? Le stock sera recalculé.`,
      fn: async () => {
        if (move.type !== 'correction') {
          await applyDelta(move.tech_name, move.article_code, isIn ? -move.qty : move.qty)
        }
        await deleteMovement(move.id)
        setConfirmModal((p) => ({ ...p, open: false }))
        toast('Mouvement supprimé')
        loadHistory(histPage)
        loadOverview()
      },
    })
  }

  // Technicians
  async function addTech(name) {
    name = (name || '').trim()
    if (!name || !/^[a-zA-ZÀ-ÿ\s\-]+$/.test(name)) { toast('Prénom invalide'); return }
    if (techs.includes(name)) { toast('Ce technicien existe déjà'); return }
    try {
      await insertTechnician(name)
      setTechs([...techs, name].sort())
      toast(`${name} ajouté ✓`)
    } catch (e) {
      toast('Erreur : ' + e.message)
    }
  }

  function askDeleteTech(name) {
    setDeleteTechModal({ open: true, name })
  }

  async function doDeleteTech() {
    const name = deleteTechModal.name
    await deleteTechnician(name)
    setTechs(techs.filter((t) => t !== name))
    if (selectedTech === name) setSelectedTech(null)
    setDeleteTechModal({ open: false, name: '' })
    toast(`${name} supprimé`)
    loadOverview()
  }

  // Security
  async function changePassword(current, newPw, confirm) {
    if (current !== adminPassword) return 'Mot de passe actuel incorrect'
    if (!newPw || newPw.length < 6) return '6 caractères minimum'
    if (newPw !== confirm) return 'Les mots de passe ne correspondent pas'
    try {
      await updateAdminPassword(newPw)
      toast('Mot de passe mis à jour ✓')
      return null
    } catch {
      toast('Erreur mise à jour')
      return 'Erreur'
    }
  }

  // Export Excel
  async function exportExcel() {
    const data = await getAllMovements()
    if (!data.length) { toast('Aucune donnée'); return }
    const labels = { use: 'Utilisé', receive: 'Reçu', admin_in: 'Expédition', correction: 'Correction' }
    const mouvRows = data.map((m) => {
      const art = ARTICLES.find((a) => a.code === m.article_code)
      return {
        'Date': new Date(m.created_at).toLocaleDateString('fr-FR'),
        'Heure': new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        'Technicien': m.tech_name,
        'Article': art ? art.label : m.article_code,
        'Code': m.article_code,
        'Quantité': m.qty,
        'Type': labels[m.type] || m.type,
        'Note': m.note || '',
      }
    })
    const stockData = await getAllStock()
    const stockRows = stockData.map((s) => {
      const art = ARTICLES.find((a) => a.code === s.article_code)
      return {
        'Technicien': s.tech_name,
        'Article': art ? art.label : s.article_code,
        'Code': s.article_code,
        'Quantité': s.qty,
        'Alerte': s.qty <= 3 ? 'Stock bas' : '',
      }
    })
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.json_to_sheet(mouvRows)
    const ws2 = XLSX.utils.json_to_sheet(stockRows)
    ws1['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 36 }, { wch: 20 }, { wch: 10 }, { wch: 14 }, { wch: 24 }]
    ws2['!cols'] = [{ wch: 14 }, { wch: 36 }, { wch: 20 }, { wch: 10 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Mouvements')
    XLSX.utils.book_append_sheet(wb, ws2, 'Stock actuel')
    XLSX.writeFile(wb, 'stock_techniciens_' + new Date().toISOString().slice(0, 10) + '.xlsx')
    toast('Export Excel téléchargé ✓')
  }

  return {
    activeTab, setActiveTab,
    allStock,
    selectedTech, selectTech,
    filterArticle, onArticleFilterChange, articleFilterStock,
    expTech, setExpTech, expDate, setExpDate, expCarrier, setExpCarrier,
    expTracking, setExpTracking, expNote, setExpNote,
    expItems, addExpItem, removeExpItem, updateExpItem,
    expHistory, saveExpedition,
    qaTech, setQaTech, qaCode, setQaCode, qaLabel, setQaLabel,
    qaQty, setQaQty, qaNote, setQaNote, saveQuickAdd,
    histTech, setHistTech, histType, setHistType,
    history, histTotal, histPage,
    loadHistory, loadOverview,
    editModal, setEditModal, saveCorrection,
    confirmModal, setConfirmModal, askDeleteMove,
    deleteTechModal, setDeleteTechModal, askDeleteTech, doDeleteTech,
    addTech, changePassword,
    exportExcel,
  }
}
