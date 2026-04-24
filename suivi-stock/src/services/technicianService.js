import { sb } from '../lib/supabase'

export async function getTechnicians() {
  const { data } = await sb.from('technicians').select('name').order('name')
  return (data || []).map((r) => r.name)
}

export async function insertTechnician(name) {
  const { error } = await sb.from('technicians').insert({ name })
  if (error) throw error
}

export async function deleteTechnician(name) {
  const { error } = await sb.from('technicians').delete().eq('name', name)
  if (error) throw error
}
