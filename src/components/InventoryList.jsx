import InventoryItem from './InventoryItem'

export default function InventoryList({ items, onEdit, onDelete }) {
  if (!items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto w-fit rounded-2xl border bg-white/70 backdrop-blur px-6 py-8 shadow-sm">
          <div className="text-lg font-semibold">No items yet</div>
          <div className="mt-1 text-sm text-gray-500">Add your first item using the form above.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-1 sm:px-0 grid gap-3 pb-10">
      {items.map((it) => (
        <InventoryItem
          key={it.id}
          item={it}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}