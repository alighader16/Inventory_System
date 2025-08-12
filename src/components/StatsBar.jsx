const cards = [
  { label: "Items", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="M3.3 7L12 12l8.7-5M12 22V12"/>
    </svg>
  )},
  { label: "Total Quantity", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3h18v6H3zM3 15h18v6H3zM3 9h18M3 21h18M7 9v12" />
    </svg>
  )},
  { label: "Inventory Value", icon: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 1v22M5 5h8.5a3.5 3.5 0 0 1 0 7H8.5a3.5 3.5 0 0 0 0 7H19" />
    </svg>
  )},
]

export default function StatsBar({ items }) {
  const total = items.length
  const totalQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0)
  const totalValue = items.reduce((s, it) => s + (Number(it.quantity||0) * Number(it.price||0)), 0)
  const values = [total, totalQty, `$${totalValue.toFixed(2)}`]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((c, i) => (
        <div key={c.label}
          className="rounded-2xl border bg-white/70 backdrop-blur p-4 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{c.label}</div>
              <div className="mt-1 text-2xl font-semibold">{values[i]}</div>
            </div>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow">
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}