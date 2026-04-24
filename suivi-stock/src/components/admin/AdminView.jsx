import { useEffect, useRef } from 'react'
import { sb } from '../../lib/supabase'
import { useAdminViewModel } from '../../viewmodels/useAdminViewModel'
import OverviewTab from './OverviewTab'
import ExpeditionTab from './ExpeditionTab'
import QuickAddTab from './QuickAddTab'
import HistoryTab from './HistoryTab'
import TechniciansTab from './TechniciansTab'
import SecurityTab from './SecurityTab'

const TABS = [
  { key: 'overview', label: 'Vue globale' },
  { key: 'expedition', label: 'Expédition' },
  { key: 'quickadd', label: 'Ajout rapide' },
  { key: 'history', label: 'Historique' },
  { key: 'settings', label: 'Techniciens' },
  { key: 'security', label: 'Sécurité' },
]

export default function AdminView({ currentUser, techs, setTechs, adminPassword }) {
  const vm = useAdminViewModel({ techs, setTechs, adminPassword, currentUser })
  const vmRef = useRef(vm)
  useEffect(() => { vmRef.current = vm })

  useEffect(() => {
    const ch = sb.channel('rt-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, () => vmRef.current.loadOverview())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, () => {
        if (vmRef.current.activeTab === 'history') vmRef.current.loadHistory(vmRef.current.histPage)
      })
      .subscribe()
    return () => sb.removeChannel(ch)
  }, [])

  return (
    <>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab${vm.activeTab === t.key ? ' active' : ''}`}
            onClick={() => vm.setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vm.activeTab === 'overview' && <OverviewTab vm={vm} techs={techs} />}
      {vm.activeTab === 'expedition' && <ExpeditionTab vm={vm} techs={techs} />}
      {vm.activeTab === 'quickadd' && <QuickAddTab vm={vm} techs={techs} />}
      {vm.activeTab === 'history' && <HistoryTab vm={vm} techs={techs} />}
      {vm.activeTab === 'settings' && <TechniciansTab vm={vm} techs={techs} />}
      {vm.activeTab === 'security' && <SecurityTab vm={vm} />}
    </>
  )
}
