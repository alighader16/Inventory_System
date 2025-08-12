export const STATUSES = ["In Stock", "Low Stock", "Ordered", "Discounted"]
export const LOW_STOCK_DEFAULT = 5

export function computeStatus(quantity, current = "") {
 
  if (current === "Ordered" || current === "Discounted") return current
  return Number(quantity) < LOW_STOCK_DEFAULT ? "Low Stock" : "In Stock"
}