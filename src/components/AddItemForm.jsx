import { useEffect, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { STATUSES, computeStatus } from '../data/statuses'

const EMPTY = { name: '', sku: '', category: 'Electronics', quantity: 1, price: 0, status: 'In Stock' }

export default function AddItemForm({ onSubmit, editingItem, onCancelEdit }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (editingItem) setForm(editingItem)
    else setForm({ ...EMPTY })
  }, [editingItem])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'quantity' || name === 'price' ? Number(value) : value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.sku.trim()) return
    const next = { ...form }
    next.status = computeStatus(next.quantity, next.status)
    onSubmit(next)
    if (!editingItem) setForm({ ...EMPTY })
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4">
      <div className="grid md:grid-cols-7 gap-3">
        <input
          name="name"
          placeholder="Item name"
          className="border rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="sku"
          placeholder="SKU"
          className="border rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={form.sku}
          onChange={handleChange}
        />
        <select
          name="category"
          className="border rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={form.category}
          onChange={handleChange}
        >
          {CATEGORIES.filter(c=>c!=="All").map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          name="quantity"
          placeholder="Qty"
          min="0"
          className="border rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={form.quantity}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          min="0"
          step="0.01"
          className="border rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={form.price}
          onChange={handleChange}
        />
        <select
          name="status"
          className="border rounded-xl px-3 py-2 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={form.status}
          onChange={handleChange}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2 md:col-span-1">
          <button className="flex-1 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90 transition">
            {editingItem ? 'Update' : 'Add'}
          </button>

          {editingItem && (
            <button
              type="button"
              className="rounded-xl border px-4 py-2 bg-white/70 hover:bg-gray-50 transition"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  )
}