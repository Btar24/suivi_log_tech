import HistoryRow from '../ui/HistoryRow'
import Pagination from '../ui/Pagination'
import Spinner from '../ui/Spinner'
import ConfirmModal from '../modals/ConfirmModal'

export default function HistoryTab({ vm, techs }) {
  const {
    histTech, setHistTech, histType, setHistType,
    history, histTotal, histPage, loadHistory,
    confirmModal, setConfirmModal, askDeleteMove,
    exportExcel,
  } = vm

  return (
    <div className="card">
      <div className="filter-bar">
        <select value={histTech} onChange={(e) => setHistTech(e.target.value)}>
          <option value="">Tous les techniciens</option>
          {techs.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={histType} onChange={(e) => setHistType(e.target.value)}>
          <option value="">Tous types</option>
          <option value="use">Utilisation</option>
          <option value="receive">Réception</option>
          <option value="admin_in">Expédition/Ajout</option>
          <option value="correction">Correction</option>
        </select>
        <button className="btn btn-sm" onClick={exportExcel}>Exporter Excel</button>
      </div>

      {history.length === 0
        ? <Spinner text="Chargement..." />
        : history.map((m) => <HistoryRow key={m.id} move={m} showTech onDelete={askDeleteMove} />)
      }
      <Pagination page={histPage} total={histTotal} onPage={loadHistory} />

      <ConfirmModal
        open={confirmModal.open}
        text={confirmModal.text}
        onClose={() => setConfirmModal((p) => ({ ...p, open: false }))}
        onConfirm={confirmModal.fn}
      />
    </div>
  )
}
