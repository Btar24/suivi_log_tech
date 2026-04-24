import { applyDelta, setStockQty } from './stockService'
import { insertMovement, deleteMovement } from './movementService'

const STORAGE_PREFIX = 'suivi-stock-pwa'
const QUEUE_KEY = `${STORAGE_PREFIX}-queue`

function parseJSON(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function cacheKey(type, techName, page) {
  if (type === 'stock') return `${STORAGE_PREFIX}-stock-${techName}`
  return `${STORAGE_PREFIX}-history-${techName}-${page}`
}

export function getCachedStock(techName) {
  return parseJSON(localStorage.getItem(cacheKey('stock', techName))) || []
}

export function setCachedStock(techName, stock) {
  saveJSON(cacheKey('stock', techName), stock)
}

export function getCachedHistory(techName, page = 1) {
  return parseJSON(localStorage.getItem(cacheKey('history', techName, page))) || { data: [], count: 0 }
}

export function setCachedHistory(techName, page, data, count) {
  saveJSON(cacheKey('history', techName, page), { data, count })
}

export function getPendingOfflineActions() {
  return parseJSON(localStorage.getItem(QUEUE_KEY)) || []
}

export function setPendingOfflineActions(actions) {
  saveJSON(QUEUE_KEY, actions)
}

export function removePendingOfflineAction(id) {
  const queue = getPendingOfflineActions().filter((action) => action.id !== id)
  setPendingOfflineActions(queue)
}

export function enqueueOfflineAction(action) {
  const queue = getPendingOfflineActions()
  const payload = {
    ...action,
    id: action.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  }
  queue.push(payload)
  setPendingOfflineActions(queue)
  return payload
}

async function processOfflineAction(action) {
  switch (action.type) {
    case 'move': {
      const { tech_name, article_code, delta, qty, type, note, by } = action.payload
      await applyDelta(tech_name, article_code, delta)
      await insertMovement({ tech_name, article_code, qty, type, note, by })
      break
    }
    case 'correction': {
      const { tech_name, article_code, newQty, delta, note, by } = action.payload
      await setStockQty(tech_name, article_code, newQty)
      if (delta !== 0) {
        await insertMovement({ tech_name, article_code, qty: Math.abs(delta), type: 'correction', note, by })
      }
      break
    }
    case 'delete_move': {
      const { id, tech_name, article_code, delta, isCorrection } = action.payload
      if (!isCorrection) {
        await applyDelta(tech_name, article_code, delta)
      }
      await deleteMovement(id)
      break
    }
    default:
      throw new Error(`Action offline inconnue : ${action.type}`)
  }
}

export async function syncPendingOfflineActions() {
  const queue = getPendingOfflineActions()
  if (!queue.length) return 0

  const remaining = []
  let count = 0

  for (const action of queue) {
    try {
      await processOfflineAction(action)
      count += 1
    } catch (error) {
      console.error('Erreur de synchronisation offline', error)
      remaining.push(action)
    }
  }

  setPendingOfflineActions(remaining)
  return count
}

export function getOfflineActionCount() {
  return getPendingOfflineActions().length
}
