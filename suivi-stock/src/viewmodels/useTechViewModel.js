import { useState, useEffect, useCallback } from 'react'
import { getStock, applyDelta, setStockQty } from '../services/stockService'
import { getMovements, insertMovement, deleteMovement } from '../services/movementService'
import { toast } from '../store/toastStore'

export function useTechViewModel(currentUser) {
  const [stock, setStock] = useState([])
  const [history, setHistory] = useState([])
  const [histTotal, setHistTotal] = useState(0)
  const [histPage, setHistPage] = useState(1)
  const [stockLoading, setStockLoading] = useState(true)

  // Modal state
  const [moveModal, setMoveModal] = useState({ open: false, type: 'use' })
  const [editModal, setEditModal] = useState({ open: false, code: '', label: '', qty: 0, techName: '' })
  const [confirmModal, setConfirmModal] = useState({ open: false, text: '', fn: null })

  const loadStock = useCallback(async () => {
    setStockLoading(true)
    try {
      const data = await getStock(currentUser)
      setStock(data)
    } catch {
      toast('Erreur chargement stock')
    }
    setStockLoading(false)
  }, [currentUser])

  const loadHistory = useCallback(async (page = 1) => {
    setHistPage(page)
    const { data, count } = await getMovements({ techName: currentUser, page })
    setHistory(data)
    setHistTotal(count)
  }, [currentUser])

  useEffect(() => {
    loadStock()
    loadHistory(1)
  }, [loadStock, loadHistory])

  async function saveMove(code, qty, note) {
    if (!code) { toast('Sélectionne un article'); return false }
    if (qty <= 0) { toast('Quantité invalide'); return false }
    try {
      await applyDelta(currentUser, code, moveModal.type === 'use' ? -qty : qty)
      await insertMovement({ tech_name: currentUser, article_code: code, qty, type: moveModal.type, note })
      if (navigator.vibrate) navigator.vibrate(50)
      toast(moveModal.type === 'use' ? `−${qty} enregistré ✓` : `+${qty} enregistré ✓`)
      setMoveModal({ open: false, type: 'use' })
      loadStock()
      loadHistory(histPage)
      return true
    } catch {
      toast('Erreur — réessaie')
      return false
    }
  }

  async function saveCorrection(newQty, note) {
    if (isNaN(newQty) || newQty < 0) { toast('Quantité invalide'); return false }
    const { code, techName } = editModal
    const currentStockItem = stock.find((s) => s.article_code === code && s.tech_name === techName)
    const oldQty = currentStockItem ? currentStockItem.qty : 0
    const delta = newQty - oldQty
    try {
      await setStockQty(techName, code, newQty)
      if (delta !== 0) {
        await insertMovement({
          tech_name: techName, article_code: code,
          qty: Math.abs(delta), type: 'correction',
          note: note || 'Correction manuelle',
          by: currentUser,
        })
      }
      if (navigator.vibrate) navigator.vibrate(50)
      toast('Quantité corrigée ✓')
      setEditModal((p) => ({ ...p, open: false }))
      loadStock()
      loadHistory(histPage)
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
        loadStock()
        loadHistory(histPage)
      },
    })
  }

  return {
    stock, stockLoading,
    history, histTotal, histPage,
    moveModal, setMoveModal,
    editModal, setEditModal,
    confirmModal, setConfirmModal,
    loadHistory,
    saveMove,
    saveCorrection,
    askDeleteMove,
    reload: () => { loadStock(); loadHistory(histPage) },
  }
}
