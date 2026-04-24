import { sb } from '../lib/supabase'

export async function getStock(techName) {
  const { data, error } = await sb.from('stock').select('*').eq('tech_name', techName)
  if (error) throw error
  return data || []
}

export async function getAllStock() {
  const { data, error } = await sb.from('stock').select('*')
  if (error) throw error
  return data || []
}

export async function getStockByArticle(articleCode) {
  const { data } = await sb.from('stock').select('*').eq('article_code', articleCode)
  return data || []
}

export async function applyDelta(techName, code, delta) {
  const { data: ex } = await sb.from('stock').select('qty')
    .eq('tech_name', techName).eq('article_code', code).single()
  const newQty = (ex ? ex.qty : 0) + delta
  if (newQty <= 0) {
    await sb.from('stock').delete().eq('tech_name', techName).eq('article_code', code)
  } else {
    await sb.from('stock').upsert(
      { tech_name: techName, article_code: code, qty: newQty },
      { onConflict: 'tech_name,article_code' }
    )
  }
}

export async function setStockQty(techName, code, newQty) {
  if (newQty <= 0) {
    await sb.from('stock').delete().eq('tech_name', techName).eq('article_code', code)
  } else {
    await sb.from('stock').upsert(
      { tech_name: techName, article_code: code, qty: newQty },
      { onConflict: 'tech_name,article_code' }
    )
  }
}
