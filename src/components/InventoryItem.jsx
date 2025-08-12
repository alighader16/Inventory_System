export default function InventoryItem({ item, onEdit, onDelete }) {
  function badgeColor(s) {
    switch (s) {
      case "Low Stock": return "bg-yellow-100 text-yellow-800"
      case "Ordered": return "bg-blue-100 text-blue-800"
      case "Discounted": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }
  return (
    <div className="group flex items-center justify-between border rounded-2xl p-4 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div className="mt-1 h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center shadow">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 11l-8-8H7L3 7v6l8 8 10-10z" />
            <path d="M7.5 7.5h.01" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{item.name}</div>
          <div className="text-xs text-gray-500">SKU: {item.sku}</div>
          <div className="mt-1 flex flex-wrap gap-2">
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {item.category}
            </span>
            <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${badgeColor(item.status)}`}>
              {item.status || "In Stock"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-sm">Qty: <b>{item.quantity}</b></div>
          <div className="text-sm">Price: <b>${Number(item.price).toFixed(2)}</b></div>
        </div>

        <div className="flex gap-2 opacity-90">
          <button
            className="rounded-lg border px-3 py-1.5 bg-white hover:bg-gray-50 transition"
            onClick={() => onEdit(item)}
          >
            Edit
          </button>
          <StatusMenu item={item} onEdit={onEdit} />
          <button
            className="rounded-lg border px-3 py-1.5 bg-white hover:bg-red-50 hover:border-red-300 transition"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusMenu({ item, onEdit }) {
  const options = ["In Stock", "Low Stock", "Ordered", "Discounted"]
  return (
    <select
      className="rounded-lg border px-3 py-1.5 bg-white hover:bg-gray-50 transition text-sm"
      value={item.status || "In Stock"}
      onChange={(e) => onEdit({ ...item, status: e.target.value })}
      title="Change status"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}