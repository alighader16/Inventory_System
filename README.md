# 🗂 Inventory Management System (React + Vite + Tailwind CSS)

A sleek and modern **Inventory Management System** built with **React**, **Vite**, and **Tailwind CSS**.  
It includes full **CRUD operations**, **search / filter / sort**, **localStorage persistence**, and an **offline AI Chatbot** that can answer inventory questions **and perform CRUD via chat commands** — all running entirely in the browser (no keys, no third-party services).

---

## 🚀 Features

- **CRUD UI** — Add, edit, delete items (name, SKU, category, price, quantity)
- **Search / Filter / Sort** — Search by name/SKU, filter by category, sort by name/price/qty/created
- **Persistent Storage** — Data saved in **localStorage** (survives page refresh)
- **Fancy UI** — Clean glassmorphism, gradients, subtle animations (pure Tailwind)
- **Stats** — Item count, total quantity, total inventory value
- **Deterministic Offline Chatbot**
  - Friendly, helpful replies (no random canned stuff)
  - **Understands your inventory** (reads current items)
  - **Chat-based CRUD**: `add item …`, `update item …`, `delete item …`
  - **Queries**: most expensive, total value, low stock (<X), list by category, list all items
  - **Zero APIs / Zero keys** — safe for exams/demos

---

## 🛠 Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Storage**: localStorage (via a small custom hook)s

---

# 📦 Installation & Setup

```bash
git clone https://github.com/yourusername/inventory-app.git
cd inventory-app
npm install
npm run dev
```

---

# 🤖 Chatbot — What It Understands

> The chatbot works **fully offline** (no API).  
> Changes are **saved to localStorage** and **instantly reflected in the UI**.

## Greetings / Help

- `hi`, `hello`, `help`, `what can you do`

## Inventory Q&A

- **Most expensive item:** `most expensive`
- **Totals:** `total value`, `total items`
- **Low stock:**
  - Default: `low stock` (threshold `< 5`)
  - Custom: `low stock less than 3`, `below 2`, `under 4`
- **By category:** `items with electronics category`
- **List everything:** `list all items`, `show inventory`
- **Availability / search:**
  - `do we have iphone 15 in stock?`
  - `is macbook available?`
  - `find samsung`

## Chat-based CRUD (affects real UI immediately)

- **Add**
  - `add item iPhone 15 category electronics price 1200 qty 5 sku IP15`
- **Update** _(only mentioned fields change)_
  - `update item iPhone 15 qty 8 price 1100`
  - `update item iPhone 15 category phones sku IP15-2025`
- **Delete**
  - `delete item iPhone 15`
