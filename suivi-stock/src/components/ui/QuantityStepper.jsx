export default function QuantityStepper({ value, onChange, min = 0 }) {
  function step(delta) {
    onChange(Math.max(min, (parseInt(value) || 0) + delta))
  }
  return (
    <div className="qty-stepper">
      <button type="button" onClick={() => step(-1)}>−</button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      />
      <button type="button" onClick={() => step(1)}>+</button>
    </div>
  )
}
