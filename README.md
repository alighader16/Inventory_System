# 🗂 Inventory Management System (React + Vite + Tailwind CSS)

A sleek and modern **Inventory Management System** built with **React**, **Vite**, and **Tailwind CSS**.  
It includes full **CRUD operations**, **search / filter / sort**, **localStorage persistence**, and an **offline AI Chatbot** that can answer inventory questions **and perform CRUD via chat commands** — all running entirely in the browser (no keys, no third-party services).

---

## 🔗 Demo

- **GitHub:** https://github.com/alighader16/Inventory_System.git

---

## 🚀 Features

- **CRUD UI** — Add, edit, delete items (name, SKU, category, price, quantity)
- **Search / Filter / Sort**
  - Search by **name/SKU**
  - Filter by **category** and **status** (In Stock, Low Stock, Ordered, Discounted)
  - Sort by **name / price / quantity / created (newest/oldest)**
- **Status Tracking**
  - Automatic: `Low Stock` if quantity `< 5`, otherwise `In Stock`
  - Manual: change status to `Ordered` or `Discounted` from the item row
- **Duplicate Protection**
  - **Add** is blocked if **name** or **SKU** already exists (case-insensitive)
  - **Update** is blocked if trying to change **name/SKU** to an existing one
- **Warnings**
  - Chatbot shows a **⚠️ Low stock warning** when adding items with quantity `< 5`
- **Persistent Storage**
  - Data saved in **localStorage** (survives page refresh)
- **Fancy UI**
  - Clean glassmorphism, gradients, subtle animations (pure Tailwind)
  - Chatbot **minimize / maximize**
- **Stats**
  - Item count, total quantity, total inventory value
- **Deterministic Offline Chatbot**
  - Friendly, helpful replies (no external APIs, works offline)
  - **Understands your inventory** (reads current items)
  - **Chat-based CRUD** and analytics

---

## 🛠 Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **Storage**: localStorage (via a small custom hook)s

---

# 📦 Installation & Setup

```bash
git clone https://github.com/alighader16/Inventory_System.git
cd Inventory_System
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

- **Most expensive item:**  
  `most expensive`
- **Totals:**  
  `total value`, `total items`
- **Low stock:**
  - Default:  
    `low stock` (threshold `< 5`)
  - Custom:  
    `low stock less than 3`, `below 2`, `under 4`
- **By category:**  
  `items with electronics category`
- **List everything:**  
  `list all items`, `show inventory`
- **Availability / search** _(case-insensitive, matches name or SKU)_:
  - `do we have iphone 15 in stock?`
  - `is macbook available?`
  - `find samsung`  
    _(Returns category, price, quantity, status, SKU)_

## Chat-based CRUD (affects real UI immediately)

- **Add**

  - `add item iPhone 15 category electronics price 1200 qty 5 sku IP15`
  - **Duplicate check:** Prevents adding if **item name** or **SKU** already exists (case-insensitive).
  - **Low stock warning:** Alerts if added quantity is below 5 and sets status to `Low Stock`.

- **Update** _(only mentioned fields change)_

  - `update item iPhone 15 qty 8 price 1100`
  - `update item iPhone 15 category phones sku IP15-2025`
  - **Existence check:** Prevents updating non-existing items.
  - **Low stock warning:** If updated quantity falls below 5, status changes to `Low Stock`.

- **Delete**
  - `delete item iPhone 15`
  - **Existence check:** Warns if trying to delete an item that does not exist.
