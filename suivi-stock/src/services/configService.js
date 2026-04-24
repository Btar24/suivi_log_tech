import { sb } from '../lib/supabase'

export async function getAdminPassword() {
  const { data } = await sb.from('config').select('value').eq('key', 'admin_password').single()
  return data?.value || null
}

export async function updateAdminPassword(newPw) {
  const { error } = await sb.from('config').update({ value: newPw }).eq('key', 'admin_password')
  if (error) throw error
}
