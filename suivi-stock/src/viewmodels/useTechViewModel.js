import { useState, useEffect, useCallback } from 'react'
import { getStock, applyDelta, setStockQty } from '../services/stockService'
import { getMovements, insertMovement, deleteMovement } from '../services/movementService'
import { toast } from '../store/toastStore'
import { getCachedStock, setCachedStock, getCachedHistory, setCachedHistory, enqueueOfflineAction, removePendingOfflineAction } from '../services/offlineService'

export function useTechViewModel(currentUser) {
  const [stock, setStock] = useState([])
  const [history, setHistory] = useState([])
  const [histTotal, setHistTotal] = useState(0)
  const [histPage, setHistPage] = useState(1)
  const [stockLoading, setStockLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOnline(false)
    const goOnline = () => setIsOnline(true)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  // Modal state
  const [moveModal, setMoveModal] = useState({ open: false, type: 'use' })
  const [editModal, setEditModal] = useState({ open: false, code: '', label: '', qty: 0, techName: '' })
  const [confirmModal, setConfirmModal] = useState({ open: false, text: '', fn: null })

  const loadStock = useCallback(async () => {
    setStockLoading(true)
    try {
      const data = await getStock(currentUser)
      setStock(data)
      setCachedStock(currentUser, data)
    } catch {
      const cached = getCachedStock(currentUser)
      if (cached.length) {
        setStock(cached)
        toast('Mode hors ligne : affichage du dernier stock connu')
      } else {
        toast('Erreur chargement stock')
      }
    }
    setStockLoading(false)
  }, [currentUser])

  const loadHistory = useCallback(async (page = 1) => {
    setHistPage(page)
    try {
      const { data, count } = await getMovements({ techName: currentUser, page })
      setHistory(data)
      setHistTotal(count)
      setCachedHistory(currentUser, page, data, count)
    } catch {
      const cached = getCachedHistory(currentUser, page)
      setHistory(cached.data)
      setHistTotal(cached.count)
      toast('Mode hors ligne : historique partiel affiché')
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      setCachedStock(currentUser, stock)
    }
  }, [currentUser, stock])

  useEffect(() => {
    if (currentUser) {
      setCachedHistory(currentUser, histPage, history, histTotal)
    }
  }, [currentUser, histPage, history, histTotal])

  useEffect(() => {
    loadStock()
    loadHistory(1)
  }, [loadStock, loadHistory])

  function updateLocalStock(code, delta) {
    setStock((current) => {
      const currentItem = current.find((item) => item.article_code === code && item.tech_name === currentUser)
      const currentQty = currentItem ? currentItem.qty : 0
      const newQty = currentQty + delta
      const updated = current.map((item) => (item.article_code === code && item.tech_name === currentUser ? { ...item, qty: newQty } : item))
      if (!currentItem && newQty > 0) {
        return [...updated, { tech_name: currentUser, article_code: code, qty: newQty }]
      }
      return newQty <= 0 ? updated.filter((item) => !(item.article_code === code && item.tech_name === currentUser)) : updated
    })
  }

  function updateLocalHistory(movement) {
    setHistory((current) => [movement, ...current].slice(0, 20))
  }

  function saveOfflineMove(code, qty, note) {
    const delta = moveModal.type === 'use' ? -qty : qty
    const action = enqueueOfflineAction({
      type: 'move',
      payload: {
        tech_name: currentUser,
        article_code: code,
        qty,
        delta,
        type: moveModal.type,
        note,
        by: currentUser,
      },
    })
    updateLocalStock(code, delta)
    updateLocalHistory({
      id: `offline-${action.id}`,
      tech_name: currentUser,
      article_code: code,
      qty,
      type: moveModal.type,
      note,
      created_at: new Date().toISOString(),
      _label: moveModal.type === 'use' ? 'Utilisé' : 'Reçu',
    })
    toast('Enregistré hors ligne — synchronisation dès que possible')
    setMoveModal({ open: false, type: 'use' })
    return true
  }

  function saveOfflineCorrection(newQty, note) {
    const { code, techName } = editModal
    const currentStockItem = stock.find((s) => s.article_code === code && s.tech_name === techName)
    const oldQty = currentStockItem ? currentStockItem.qty : 0
    const delta = newQty - oldQty
    enqueueOfflineAction({
      type: 'correction',
      payload: {
        tech_name: techName,
        article_code: code,
        newQty,
        delta,
        note: note || 'Correction manuelle',
        by: currentUser,
      },
    })
    updateLocalStock(code, delta)
    updateLocalHistory({
      id: `offline-${Date.now()}`,
      tech_name: techName,
      article_code: code,
      qty: Math.abs(delta),
      type: 'correction',
      note: note || 'Correction manuelle',
      created_at: new Date().toISOString(),
      _label: 'Correction',
    })
    toast('Correction enregistrée hors ligne')
    setEditModal((p) => ({ ...p, open: false }))
    return true
  }

  async function saveMove(code, qty, note) {
    if (!code) { toast('Sélectionne un article'); return false }
    if (qty <= 0) { toast('Quantité invalide'); return false }
    const delta = moveModal.type === 'use' ? -qty : qty
    if (!isOnline) {
      return saveOfflineMove(code, qty, note)
    }
    try {
      await applyDelta(currentUser, code, delta)
      await insertMovement({ tech_name: currentUser, article_code: code, qty, type: moveModal.type, note })
      if (navigator.vibrate) navigator.vibrate(50)
      toast(moveModal.type === 'use' ? `−${qty} enregistré ✓` : `+${qty} enregistré ✓`)
      setMoveModal({ open: false, type: 'use' })
      loadStock()
      loadHistory(histPage)
      return true
    } catch {
      toast('Enregistré hors ligne — synchronisation dès que possible')
      return saveOfflineMove(code, qty, note)
    }
  }

  async function saveCorrection(newQty, note) {
    if (isNaN(newQty) || newQty < 0) { toast('Quantité invalide'); return false }
    if (!isOnline) {
      return saveOfflineCorrection(newQty, note)
    }
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
      toast('Enregistré hors ligne — synchronisation dès que possible')
      return saveOfflineCorrection(newQty, note)
    }
  }

  function askDeleteMove(move) {
    const isIn = move.type === 'receive' || move.type === 'admin_in'
    setConfirmModal({
      open: true,
      text: `Supprimer "${move._label} ${isIn ? '+' : '−'}${move.qty}" pour ${move.tech_name} ? Le stock sera recalculé.`,
      fn: async () => {
        if (!isOnline) {
          if (move.id?.toString().startsWith('offline-')) {
            removePendingOfflineAction(move.id)
          } else {
            enqueueOfflineAction({
              type: 'delete_move',
              payload: {
                id: move.id,
                tech_name: move.tech_name,
                article_code: move.article_code,
                delta: isIn ? -move.qty : move.qty,
                isCorrection: move.type === 'correction',
              },
            })
          }
          updateLocalStock(move.article_code, isIn ? -move.qty : move.qty)
          setHistory((current) => current.filter((item) => item.id !== move.id))
          toast('Suppression enregistrée hors ligne')
        } else {
          if (move.type !== 'correction') {
            await applyDelta(move.tech_name, move.article_code, isIn ? -move.qty : move.qty)
          }
          await deleteMovement(move.id)
          toast('Mouvement supprimé')
        }
        setConfirmModal((p) => ({ ...p, open: false }))
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
