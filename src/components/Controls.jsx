import { CATEGORIES } from '../data/categories'

function SearchIcon() {
  return (
    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 5h18l-7 8v6l-4-2v-4z" />
    </svg>
  )
}
function SortIcon() {
  return (
    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7h14M3 12h10M3 17h6" />
      <path d="M17 7l4 4-4 4" />
    </svg>
  )
}

export default function Controls({
  search, setSearch,
  category, setCategory,
  status, setStatus,
  sortBy, setSortBy,
  onClearAll,
}) {
  return (
    <div className="px-4 py-4 grid gap-3 md:grid-cols-5">
      <div className="relative">
        <SearchIcon />
        <input
          className="w-full border rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 bg-white/70"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
        />
      </div>

      <div className="relative">
        <FilterIcon />
        <select
          className="w-full border rounded-xl pl-9 pr-8 py-2 bg-white/70"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="relative">
        <FilterIcon />
        <select
          className="w-full border rounded-xl pl-9 pr-8 py-2 bg-white/70"
          value={status}
          onChange={(e)=>setStatus(e.target.value)}
        >
          {["All","In Stock","Low Stock","Ordered","Discounted"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <SortIcon />
        <select
          className="w-full border rounded-xl pl-9 pr-8 py-2 bg-white/70"
          value={sortBy}
          onChange={(e)=>setSortBy(e.target.value)}
        >
          <option value="createdAt_desc">Newest</option>
          <option value="createdAt_asc">Oldest</option>
          <option value="name_asc">Name A→Z</option>
          <option value="name_desc">Name Z→A</option>
          <option value="price_asc">Price Low→High</option>
          <option value="price_desc">Price High→Low</option>
          <option value="qty_asc">Qty Low→High</option>
          <option value="qty_desc">Qty High→Low</option>
        </select>
      </div>

      <button
        className="border rounded-xl px-3 py-2 bg-white/70 hover:bg-red-50 hover:border-red-300 transition"
        onClick={onClearAll}
        title="Remove all items"
      >
        Clear All
      </button>
    </div>
  )
}