import { useEffect } from 'react'
import { ARTICLES } from '../../constants/articles'
import { useTechViewModel } from '../../viewmodels/useTechViewModel'
import { sb } from '../../lib/supabase'
import Spinner from '../ui/Spinner'
import Pagination from '../ui/Pagination'
import HistoryRow from '../ui/HistoryRow'
import MoveModal from '../modals/MoveModal'
import EditStockModal from '../modals/EditStockModal'
import ConfirmModal from '../modals/ConfirmModal'

export default function TechView({ currentUser }) {
  const vm = useTechViewModel(currentUser)

  useEffect(() => {
    const ch = sb.channel('rt-' + currentUser)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock', filter: `tech_name=eq.${currentUser}` }, vm.reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements', filter: `tech_name=eq.${currentUser}` }, () => vm.loadHistory(vm.histPage))
      .subscribe()
    return () => sb.removeChannel(ch)
  }, [currentUser])

  const refs = vm.stock.length
  const total = vm.stock.reduce((a, s) => a + s.qty, 0)
  const low = vm.stock.filter((s) => s.qty <= 3).length

  return (
    <>
      <div className="stat-grid">
        <div className="stat"><div className="stat-label">Références</div><div className="stat-val">{vm.stockLoading ? '—' : refs}</div></div>
        <div className="stat"><div className="stat-label">Total</div><div className="stat-val">{vm.stockLoading ? '—' : total}</div></div>
        <div className="stat"><div className="stat-label">Stock bas</div><div className="stat-val">{vm.stockLoading ? '—' : low}</div></div>
      </div>

      <div className="quick-actions">
        <button className="qa-btn qa-use" onClick={() => vm.setMoveModal({ open: true, type: 'use' })}>
          <span style={{ fontSize: 24 }}>−</span>
          J&apos;ai utilisé
          <span className="qa-sub">Déduire du stock</span>
        </button>
        <button className="qa-btn qa-recv" onClick={() => vm.setMoveModal({ open: true, type: 'receive' })}>
          <span style={{ fontSize: 24 }}>+</span>
          J&apos;ai reçu
          <span className="qa-sub">Ajouter au stock</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header"><span>Mon stock</span></div>
        {vm.stockLoading ? <Spinner /> : (
          vm.stock.length === 0
            ? <div className="empty">Aucun article — ton responsable va t&apos;en attribuer prochainement.</div>
            : (
              <div className="stock-list">
                {vm.stock.map((s) => {
                  const art = ARTICLES.find((a) => a.code === s.article_code)
                  const label = art ? art.label : s.article_code
                  const barW = Math.min(100, Math.round(s.qty / 20 * 100))
                  const barC = s.qty <= 3 ? '#BA7517' : '#1D9E75'
                  return (
                    <div className="stock-item" key={s.article_code}>
                      <div className="stock-item-label">
                        {label}
                        <div className="stock-code">{s.article_code}</div>
                      </div>
                      <div className="stock-item-right">
                        <div className="bar" style={{ width: 50 }}>
                          <div className="bar-fill" style={{ width: `${barW}%`, background: barC }} />
                        </div>
                        <span className={`badge ${s.qty <= 3 ? 'b-low' : 'b-ok'}`}>{s.qty}</span>
                        <button
                          className="btn-edit"
                          onClick={() => vm.setEditModal({ open: true, code: s.article_code, label, qty: s.qty, techName: currentUser })}
                        >
                          Corriger
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        )}
      </div>

      <div className="card">
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>Historique récent</div>
        {vm.history.length === 0
          ? <div className="empty">Aucun mouvement</div>
          : vm.history.map((m) => <HistoryRow key={m.id} move={m} onDelete={vm.askDeleteMove} />)
        }
        <Pagination page={vm.histPage} total={vm.histTotal} onPage={vm.loadHistory} />
      </div>

      <MoveModal
        open={vm.moveModal.open}
        type={vm.moveModal.type}
        onClose={() => vm.setMoveModal((p) => ({ ...p, open: false }))}
        onSave={vm.saveMove}
      />
      <EditStockModal
        open={vm.editModal.open}
        label={vm.editModal.label}
        currentQty={vm.editModal.qty}
        onClose={() => vm.setEditModal((p) => ({ ...p, open: false }))}
        onSave={vm.saveCorrection}
      />
      <ConfirmModal
        open={vm.confirmModal.open}
        text={vm.confirmModal.text}
        onClose={() => vm.setConfirmModal((p) => ({ ...p, open: false }))}
        onConfirm={vm.confirmModal.fn}
      />
    </>
  )
}
