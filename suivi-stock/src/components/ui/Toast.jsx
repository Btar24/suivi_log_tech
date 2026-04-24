import { useToastStore } from '../../store/toastStore'

export default function Toast() {
  const { msg, visible } = useToastStore()
  return (
    <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
  )
}
