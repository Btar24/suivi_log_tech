import { sb } from '../lib/supabase'
import { PAGE_SIZE } from '../constants/articles'

export async function getMovements({ techName, type, page = 1 } = {}) {
  let q = sb.from('movements').select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  if (techName) q = q.eq('tech_name', techName)
  if (type) q = q.eq('type', type)
  const { data, count, error } = await q
  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function getExpeditions(limit = 30) {
  const { data } = await sb.from('movements').select('*')
    .eq('type', 'admin_in').order('created_at', { ascending: false }).limit(limit)
  return data || []
}

export async function getAllMovements() {
  const { data } = await sb.from('movements').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function insertMovement(movement) {
  const { error } = await sb.from('movements').insert(movement)
  if (error) throw error
}

export async function deleteMovement(id) {
  const { error } = await sb.from('movements').delete().eq('id', id)
  if (error) throw error
}
