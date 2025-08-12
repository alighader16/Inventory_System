import { useMemo, useState } from 'react'
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import Controls from './components/Controls'
import AddItemForm from './components/AddItemForm'
import InventoryList from './components/InventoryList'
import useLocalStorage from './hooks/useLocalStorage'
import Chatbot from './components/Chatbot'
import { computeStatus } from './data/statuses'

export default function App() {
  const [items, setItems] = useLocalStorage('inventory.items', [])
  const [search, setSearch] = useLocalStorage('inventory.search', '')
  const [category, setCategory] = useLocalStorage('inventory.category', 'All')
  const [status, setStatus] = useLocalStorage('inventory.status', 'All')
  const [sortBy, setSortBy] = useLocalStorage('inventory.sortBy', 'createdAt_desc')
  const [editing, setEditing] = useState(null)

  // CRUD
  function handleSubmit(item) {
    if (editing) {
      const next = { ...item }
      next.status = computeStatus(next.quantity, next.status)
      setItems(prev => prev.map(p => p.id === editing.id
        ? { ...next, id: editing.id, createdAt: editing.createdAt, updatedAt: Date.now() }
        : p
      ))
      setEditing(null)
    } else {
      const id = crypto.randomUUID()
      const next = { ...item }
      next.status = computeStatus(next.quantity, next.status)
      setItems(prev => [{ ...next, id, createdAt: Date.now(), updatedAt: Date.now() }, ...prev])
    }
  }
  function handleDelete(id) {
    setItems(prev => prev.filter(p => p.id !== id))
    if (editing?.id === id) setEditing(null)
  }
  function handleClearAll() {
    if (confirm('This will remove all items. Continue?')) setItems([])
  }

  // Derived: search + filter + sort
  const visibleItems = useMemo(() => {
    let out = [...items]
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      out = out.filter(it => it.name.toLowerCase().includes(q) || String(it.sku||'').toLowerCase().includes(q))
    }
    if (category !== 'All') out = out.filter(it => it.category === category)
    if (status !== 'All') out = out.filter(it => (it.status || 'In Stock') === status)
    const [field, dir] = sortBy.split('_')
    out.sort((a, b) => {
      const mul = dir === 'asc' ? 1 : -1
      switch (field) {
        case 'name': return a.name.localeCompare(b.name) * mul
        case 'price': return (Number(a.price) - Number(b.price)) * mul
        case 'qty': return (Number(a.quantity) - Number(b.quantity)) * mul
        case 'createdAt':
        default: return ((a.createdAt || 0) - (b.createdAt || 0)) * mul
      }
    })
    return out
  }, [items, search, category, sortBy, status])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      {/* subtle gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-indigo-400 to-cyan-300" />
        <div className="absolute top-64 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-fuchsia-400 to-orange-300" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,.8),rgba(255,255,255,0))]" />
      </div>

      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-[200px] pt-6">
        <StatsBar items={items} />

        <div className="mt-4 rounded-2xl border bg-white/70 backdrop-blur shadow-sm">
          <Controls
            search={search} setSearch={setSearch}
            category={category} setCategory={setCategory}
            status={status} setStatus={setStatus}
            sortBy={sortBy} setSortBy={setSortBy}
            onClearAll={handleClearAll}
          />
          <div className="border-t" />
          <AddItemForm
            onSubmit={handleSubmit}
            editingItem={editing}
            onCancelEdit={() => setEditing(null)}
          />
        </div>

        <div className="mt-6">
          <InventoryList items={visibleItems} onEdit={setEditing} onDelete={handleDelete} />
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <Chatbot items={items} setItems={setItems} />
        </div>

        <footer className="mt-8 text-center text-xs text-gray-500">
          Data is saved locally in your browser (localStorage).
        </footer>
      </main>
    </div>
  )
}