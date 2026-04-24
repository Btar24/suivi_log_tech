export default function Spinner({ text = 'Chargement...' }) {
  return (
    <div className="loader">
      <div className="spinner" />
      {text}
    </div>
  )
}
