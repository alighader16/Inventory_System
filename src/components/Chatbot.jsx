import { useRef, useState } from 'react'
import { computeStatus } from '../data/statuses'

export default function Chatbot({ items, setItems }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🤖 Hey! I’m your smart inventory assistant. I can analyze, list, and even **add / update / delete** items from chat. Type `help` to see everything.',
    },
  ])
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const inputRef = useRef(null)

  function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)

    const { reply, suggestions } = getBotResponse(input.trim(), items, setItems)
    setMessages([
      ...updated,
      { role: 'assistant', content: reply },
      ...(suggestions?.length ? [{ role: 'assistant', content: renderSuggestionsText(suggestions) }] : []),
    ])

    setInput('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const quickSuggestions = buildQuickSuggestions(items)

  return (
    <div className="w-80 rounded-2xl border bg-white shadow-lg flex flex-col">
      <div
        className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white p-3 rounded-t-2xl font-semibold flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>AI Chatbot (Offline)</span>
        <button
          className="bg-white text-indigo-500 rounded-full px-2 py-0.5 text-sm font-bold"
          onClick={(e) => { e.stopPropagation(); setIsOpen((prev) => !prev) }}
        >
          {isOpen ? '–' : '+'}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 max-h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user' ? 'bg-indigo-100 text-gray-800 self-end' : 'bg-gray-100 text-gray-800 self-start'
                }`}
              >
                {msg.content}
              </div>
            ))}

            <div className="mt-2 flex flex-wrap gap-2">
              {quickSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-xs rounded-full border px-2 py-1 bg-white hover:bg-gray-50"
                  title="Click to prefill the input"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={sendMessage} className="flex p-2 border-t gap-2">
            <input
              ref={inputRef}
              className="flex-1 border rounded-xl px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask or manage inventory... (type 'help')"
            />
            <button className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600" type="submit">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  )
}

/* --------------------- Logic --------------------- */
/*
function getBotResponse(prompt, inventory, setItems) {
  const q = prompt.toLowerCase().trim()
  const inv = Array.isArray(inventory) ? inventory : []
  const isEmpty = inv.length === 0

  if (q === 'help' || q === 'commands' || q === '?') {
    return { reply: helpMessage(inv), suggestions: suggestNext(inv) }
  }

  // ADD ITEM
  if (q.startsWith('add item')) {
    const newItem = parseAddCommand(prompt)
    if (!newItem.name || !newItem.category || isNaN(newItem.price) || isNaN(newItem.quantity)) {
      return {
        reply: '❌ Invalid syntax.\nUse:\n`add item <name> category <category> price <number> qty <number> sku <text>`\nExample:\n`add item iPhone 15 category Electronics price 1200 qty 5 sku IP15`',
        suggestions: ['add item iPhone 15 category Electronics price 1200 qty 5 sku IP15', 'help'],
      }
    }
    const itemWithId = {
      ...newItem,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    itemWithId.status = computeStatus(itemWithId.quantity, itemWithId.status)
    setItems((prev) => [itemWithId, ...prev])
    return {
      reply: `✅ Added **${itemWithId.name}** to your inventory.\n• Category: ${itemWithId.category}\n• Price: 💲${num(itemWithId.price)}\n• Qty: ${num(itemWithId.quantity)}${itemWithId.sku ? `\n• SKU: ${itemWithId.sku}` : ''}\n• Status: ${itemWithId.status}\n\n💡 Tip: Type \`list all items\` to confirm.`,
      suggestions: ['list all items', 'most expensive', 'low stock', 'update item ...', 'delete item ...'],
    }
  }

  // UPDATE ITEM
  if (q.startsWith('update item')) {
    const updates = parseUpdateCommand(prompt)
    if (!updates.name) {
      return {
        reply: '❌ Invalid syntax.\nUse:\n`update item <name> [qty <number>] [price <number>] [category <text>] [sku <text>]`\nExample:\n`update item iPhone 15 qty 8 price 1100`',
        suggestions: ['update item iPhone 15 qty 8 price 1100', 'help'],
      }
    }
    let found = false
    let updatedFieldsText = ''
    setItems((prev) =>
      prev.map((it) => {
        if (it.name.toLowerCase() === updates.name.toLowerCase()) {
          found = true
          const next = { ...it, ...updates.fields, updatedAt: Date.now() }
          next.status = computeStatus(next.quantity, next.status || it.status)
          updatedFieldsText = summarizeUpdates(it, next)
          return next
        }
        return it
      }),
    )
    return {
      reply: found
        ? `🔄 Updated **${updates.name}**.\n${updatedFieldsText || 'No visible field changes.'}\n\n💡 Tip: Try \`list all items\` to verify.`
        : `❌ Could not find an item named **${updates.name}**.\n💡 You can add it first with \`add item ...\`.`,
      suggestions: found ? ['list all items', 'total value', 'low stock'] : ['add item ...', 'list all items'],
    }
  }

  // DELETE ITEM
  if (q.startsWith('delete item')) {
    const name = prompt.split(' ').slice(2).join(' ').trim()
    if (!name) {
      return { reply: '❌ Invalid syntax.\nUse:\n`delete item <name>`\nExample:\n`delete item iPhone 15`', suggestions: ['delete item iPhone 15', 'help'] }
    }
    const exists = inv.some((it) => it.name.toLowerCase() === name.toLowerCase())
    if (!exists) {
      return { reply: `❌ I didn’t find any item named **${name}** to delete.`, suggestions: ['list all items', 'help'] }
    }
    setItems((prev) => prev.filter((it) => it.name.toLowerCase() !== name.toLowerCase()))
    return { reply: `🗑 Removed **${name}** from your inventory.\n\n💡 Tip: \`list all items\` to see what’s left.`, suggestions: ['list all items', 'total value'] }
  }

  // DELETE ALL
  if (q.includes('delete all items') || q.includes('clear all items')) {
    setItems([])
    return { reply: '🧹 Cleared the entire inventory.', suggestions: ['add item ...', 'help'] }
  }

  // LIST ALL ITEMS
  if (q.includes('list all items') || q.includes('show inventory') || q.includes('all items')) {
    if (isEmpty)
      return { reply: emptyMsg(), suggestions: ['add item Sample Phone category Electronics price 499 qty 3 sku SPH1', 'help'] }
    return {
      reply:
        '📋 Here’s everything you have in stock:\n' +
        inv
          .map((it) => `• ${it.name} — ${it.category}, 💲${num(it.price)}, Qty: ${num(it.quantity)}${it.sku ? `, SKU: ${it.sku}` : ''}, Status: ${it.status || 'In Stock'}`)
          .join('\n') +
        '\n\n💡 Tip: Try `most expensive` or `low stock` for more insights.',
      suggestions: ['most expensive', 'total value', 'low stock', 'items with Electronics category'],
    }
  }

  // CATEGORY FILTER
  if (q.includes('items with') && q.includes('category')) {
    if (isEmpty) return { reply: emptyMsg(), suggestions: ['add item ...', 'help'] }
    const categoryRaw = q.split('items with')[1].replace('category', '').trim()
    if (!categoryRaw) {
      const cats = knownCategories(inv)
      return { reply: `ℹ️ Please tell me which category.\nAvailable: ${cats.length ? cats.join(', ') : '—'}`, suggestions: cats.slice(0, 3).map((c) => `items with ${c} category`) }
    }
    const category = categoryRaw.toLowerCase()
    const catItems = inv.filter((it) => String(it.category || '').toLowerCase() === category)
    return catItems.length
      ? {
          reply:
            `📂 I found these items in the **${toTitleCase(category)}** category:\n` +
            catItems.map((i) => `• ${i.name} — 💲${num(i.price)}, Qty: ${num(i.quantity)}, Status: ${i.status || 'In Stock'}`).join('\n') +
            `\n\n💡 You can also check 'low stock' or 'total value'.`,
          suggestions: ['total value', 'low stock', 'list all items'],
        }
      : { reply: `❌ No items found in the **${toTitleCase(category)}** category.`, suggestions: ['add item ...', 'list all items'] }
  }

  // MOST EXPENSIVE
  if (q.includes('most expensive')) {
    if (isEmpty) return { reply: emptyMsg(), suggestions: ['add item ...', 'help'] }
    const maxItem = [...inv].sort((a, b) => Number(b.price || 0) - Number(a.price || 0))[0]
    return { reply: `💎 Your most expensive treasure is **${maxItem.name}** at 💲${num(maxItem.price)} with Qty: ${num(maxItem.quantity)}${maxItem.sku ? ` (SKU: ${maxItem.sku})` : ''}.`, suggestions: ['list all items', 'total value'] }
  }

  // TOTAL VALUE / COUNT
  if (q.includes('total value') || q.includes('inventory value')) {
    if (isEmpty) return { reply: emptyMsg(), suggestions: ['add item ...', 'help'] }
    const total = inv.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0)
    return { reply: `💰 The total value of your inventory is **$${total.toFixed(2)}**.\n📦 That’s across **${inv.length}** distinct items.`, suggestions: ['most expensive', 'list all items'] }
  }
  if (q.includes('total items') || q.includes('how many items') || q.includes('count items')) {
    return { reply: `📦 You currently have **${inv.length}** different items in your inventory.\n💡 Want me to list them? Try \`list all items\`.`, suggestions: ['list all items', 'total value'] }
  }

  // LOW STOCK
  if (q.includes('low stock') || q.includes('less than') || q.includes('below') || q.includes('under')) {
    const threshold = parseThreshold(q) ?? 5
    if (isEmpty) return { reply: emptyMsg(), suggestions: ['add item ...', 'help'] }
    const lows = inv.filter((it) => Number(it.quantity || 0) < threshold)
    return lows.length
      ? { reply: `⚠️ Low stock (Qty < ${threshold}):\n` + lows.map((i) => `• ${i.name} (Qty: ${num(i.quantity)})`).join('\n'), suggestions: ['update item ...', 'list all items'] }
      : { reply: `✅ All items have at least ${threshold} in stock.`, suggestions: ['list all items'] }
  }

  // GREETINGS
  if (["hi", "hello", "hey", "good morning", "good evening"].some((g) => q.includes(g))) {
    return { reply: '👋 Hey! I can help you manage and analyze your inventory. Type `help` to see commands, or click a quick command below.', suggestions: suggestNext(inv) }
  }

  // SIMPLE SEARCH HINT
   // AVAILABILITY & SEARCH
  // do we have <name|sku>?
  let m = q.match(/^do we have\s+(.+?)[\?]*$/i)
  if (m) return findAvailability(inv, m[1])

  // is <name> available?
  m = q.match(/^is\s+(.+?)\s+available[\?]*$/i)
  if (m) return findAvailability(inv, m[1])

  // find <name|sku>
  m = q.match(/^find\s+(.+)$/i)
  if (m) return findAvailability(inv, m[1])


  return { reply: '🤔 I didn’t catch that. Type `help` to see commands, or click a quick command below to auto-fill the input.', suggestions: suggestNext(inv) }
}*/
function getBotResponse(prompt, inventory, setItems) {
  const q = String(prompt || "").toLowerCase().trim();
  const inv = Array.isArray(inventory) ? inventory : [];
  const isEmpty = inv.length === 0;

  // ---------- HELP ----------
  if (q === "help" || q === "commands" || q === "?") {
    return { reply: helpMessage(inv), suggestions: suggestNext(inv) };
  }

// ADD ITEM (with duplicate name/SKU checks + low stock warning)
if (q.startsWith("add item")) {
  const newItem = parseAddCommand(prompt);
  if (!newItem.name || !newItem.category || isNaN(newItem.price) || isNaN(newItem.quantity)) {
    return {
      reply:
        "❌ Invalid syntax.\nUse:\n`add item <name> category <category> price <number> qty <number> sku <text>`\nExample:\n`add item iPhone 15 category Electronics price 1200 qty 5 sku IP15`",
      suggestions: ["add item iPhone 15 category Electronics price 1200 qty 5 sku IP15", "help"],
    };
  }

  // DUPLICATE CHECKS
  const nameDup = findByName(inventory, newItem.name);
  const skuDup = newItem.sku ? findBySku(inventory, newItem.sku) : null;
  if (nameDup || skuDup) {
    return {
      reply:
        "❌ Duplicate item.\n" +
        (nameDup ? `• Name "${newItem.name}" already exists.\n` : "") +
        (skuDup ? `• SKU "${newItem.sku}" already exists (belongs to "${skuDup.name}").\n` : "") +
        `\nUse \`update item ${nameDup ? newItem.name : (skuDup ? skuDup.name : "<name>")} ...\` instead.`,
      suggestions: ["list all items", `update item ${nameDup ? newItem.name : (skuDup ? skuDup.name : "<name>")} qty ... price ...`],
    };
  }

  // Status + persist
  const status = Number(newItem.quantity) < 5 ? "Low Stock" : "In Stock";
  const itemWithId = {
    ...newItem,
    status,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  setItems(prev => [itemWithId, ...prev]);

  let replyMsg =
    `✅ Added **${itemWithId.name}**.\n` +
    `• Category: ${itemWithId.category}\n` +
    `• Price: 💲${num(itemWithId.price)}\n` +
    `• Qty: ${num(itemWithId.quantity)}\n` +
    `• Status: ${status}` +
    (itemWithId.sku ? `\n• SKU: ${itemWithId.sku}` : "");
  if (status === "Low Stock") replyMsg += `\n⚠️ **Warning**: This item is low on stock!`;
  replyMsg += `\n\n💡 Tip: \`list all items\``;

  return { reply: replyMsg, suggestions: ["list all items", "low stock", "most expensive"] };
}

// UPDATE ITEM (must exist; no duplicate name/SKU after update)
if (q.startsWith("update item")) {
  const updates = parseUpdateCommand(prompt);
  if (!updates.name) {
    return {
      reply:
        "❌ Invalid syntax.\nUse:\n`update item <name> [qty <number>] [price <number>] [category <text>] [sku <text>]`\nExample:\n`update item iPhone 15 qty 8 price 1100`",
      suggestions: ["update item iPhone 15 qty 8 price 1100", "help"],
    };
  }

  // Find target by name (case-insensitive)
  const target = findByName(inventory, updates.name);
  if (!target) {
    return {
      reply: `❌ Item "**${updates.name}**" doesn’t exist. Use \`add item ...\` first or check the spelling.`,
      suggestions: ["list all items", "add item ..."],
    };
  }

  // Prevent renaming to an existing name (that isn't this item)
  if (updates.fields.name && norm(updates.fields.name) !== norm(target.name)) {
    const nameConflict = findByName(inventory, updates.fields.name);
    if (nameConflict) {
      return {
        reply: `❌ Name conflict: "${updates.fields.name}" already exists (belongs to "${nameConflict.name}"). Choose a different name.`,
        suggestions: ["list all items", `update item ${target.name} name <new unique name>`],
      };
    }
  }

  // Prevent changing SKU to an existing one (that isn't this item)
  if (updates.fields.sku && norm(updates.fields.sku) !== norm(target.sku)) {
    const skuConflict = findBySku(inventory, updates.fields.sku);
    if (skuConflict) {
      return {
        reply: `❌ SKU conflict: "${updates.fields.sku}" already exists (belongs to "${skuConflict.name}"). Use a unique SKU.`,
        suggestions: ["list all items", `update item ${target.name} sku <unique sku>`],
      };
    }
  }

  // Apply update
  let updatedFieldsText = "";
  setItems(prev =>
    prev.map(it => {
      if (it.id !== target.id) return it;
      const next = { ...it, ...updates.fields, updatedAt: Date.now() };
      // Auto status on qty change (keep Ordered/Discounted if you use those)
      if (typeof next.quantity === "number") {
        next.status = next.quantity < 5 ? "Low Stock" : (next.status || "In Stock");
      }
      updatedFieldsText = summarizeUpdates(it, next);
      return next;
    })
  );

  return {
    reply: `🔄 Updated **${target.name}**.\n${updatedFieldsText || "No visible field changes."}\n\n💡 Tip: \`list all items\``,
    suggestions: ["list all items", "total value", "low stock"],
  };
}

  // ---------- DELETE ITEM ----------
  if (q.startsWith("delete item")) {
    const name = prompt.split(" ").slice(2).join(" ").trim();
    if (!name) {
      return {
        reply: "❌ Invalid syntax.\nUse:\n`delete item <name>`\nExample:\n`delete item iPhone 15`",
        suggestions: ["delete item iPhone 15", "help"],
      };
    }
    const exists = inv.some((it) => (it.name || "").toLowerCase() === name.toLowerCase());
    if (!exists) {
      return { reply: `❌ I didn’t find any item named **${name}** to delete.`, suggestions: ["list all items", "help"] };
    }
    setItems((prev) => prev.filter((it) => (it.name || "").toLowerCase() !== name.toLowerCase()));
    return {
      reply: `🗑 Removed **${name}** from your inventory.\n\n💡 Tip: \`list all items\` to see what’s left.`,
      suggestions: ["list all items", "total value"],
    };
  }

  // ---------- DELETE ALL ----------
  if (q.includes("delete all items") || q.includes("clear all items")) {
    setItems([]);
    return { reply: "🧹 Cleared the entire inventory.", suggestions: ["add item ...", "help"] };
  }

  // ---------- LIST ALL ----------
  if (q.includes("list all items") || q.includes("show inventory") || q.includes("all items")) {
    if (isEmpty) {
      return {
        reply:
          "📦 Your inventory is currently empty.\nYou can start by adding items like:\n• `add item iPhone 15 category Electronics price 1200 qty 5 sku IP15`",
        suggestions: ["add item Sample Phone category Electronics price 499 qty 3 sku SPH1", "help"],
      };
    }
    return {
      reply:
        "📋 Here’s everything you have in stock:\n" +
        inv
          .map(
            (it) =>
              `• ${it.name} — ${it.category}, 💲${num(it.price)}, Qty: ${num(it.quantity)}${
                it.sku ? `, SKU: ${it.sku}` : ""
              }${it.status ? `, Status: ${it.status}` : ""}`
          )
          .join("\n") +
        "\n\n💡 Tip: Try `most expensive` or `low stock` for more insights.",
      suggestions: ["most expensive", "total value", "low stock"],
    };
  }

  // ---------- CATEGORY FILTER ----------
  if (q.includes("items with") && q.includes("category")) {
    if (isEmpty) return { reply: emptyMsg(), suggestions: ["add item ...", "help"] };
    const categoryRaw = q.split("items with")[1].replace("category", "").trim();
    if (!categoryRaw) {
      const cats = knownCategories(inv);
      return {
        reply: `ℹ️ Please tell me which category.\nAvailable: ${cats.length ? cats.join(", ") : "—"}`,
        suggestions: cats.slice(0, 3).map((c) => `items with ${c} category`),
      };
    }
    const category = categoryRaw.toLowerCase();
    const catItems = inv.filter((it) => String(it.category || "").toLowerCase() === category);
    return catItems.length
      ? {
          reply:
            `📂 I found these items in the **${toTitleCase(category)}** category:\n` +
            catItems
              .map(
                (i) =>
                  `• ${i.name} — 💲${num(i.price)}, Qty: ${num(i.quantity)}${
                    i.status ? `, Status: ${i.status}` : ""
                  }`
              )
              .join("\n"),
          suggestions: ["total value", "low stock", "list all items"],
        }
      : { reply: `❌ No items found in the **${toTitleCase(category)}** category.`, suggestions: ["add item ...", "list all items"] };
  }

  // ---------- MOST EXPENSIVE ----------
  if (q.includes("most expensive")) {
    if (isEmpty) return { reply: emptyMsg(), suggestions: ["add item ...", "help"] };
    const maxItem = [...inv].sort((a, b) => Number(b.price || 0) - Number(a.price || 0))[0];
    return {
      reply: `💎 Your most expensive treasure is **${maxItem.name}** at 💲${num(maxItem.price)} with Qty: ${num(
        maxItem.quantity
      )}${maxItem.sku ? ` (SKU: ${maxItem.sku})` : ""}.`,
      suggestions: ["list all items", "total value"],
    };
  }

  // ---------- TOTALS ----------
  if (q.includes("total value") || q.includes("inventory value")) {
    if (isEmpty) return { reply: emptyMsg(), suggestions: ["add item ...", "help"] };
    const total = inv.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
    return {
      reply: `💰 The total value of your inventory is **$${total.toFixed(2)}**.\n📦 That’s across **${inv.length}** distinct items.`,
      suggestions: ["most expensive", "list all items"],
    };
  }
  if (q.includes("total items") || q.includes("how many items") || q.includes("count items")) {
    return {
      reply: `📦 You currently have **${inv.length}** different items in your inventory.\n💡 Want me to list them? Try \`list all items\`.`,
      suggestions: ["list all items", "total value"],
    };
  }

  // ---------- LOW STOCK ----------
  if (q.includes("low stock") || q.includes("less than") || q.includes("below") || q.includes("under")) {
    const threshold = parseThreshold(q) ?? 5;
    if (isEmpty) return { reply: emptyMsg(), suggestions: ["add item ...", "help"] };
    const lows = inv.filter((it) => Number(it.quantity || 0) < threshold);
    return lows.length
      ? {
          reply: `⚠️ Low stock (Qty < ${threshold}):\n` + lows.map((i) => `• ${i.name} (Qty: ${num(i.quantity)})`).join("\n"),
          suggestions: ["update item ...", "list all items"],
        }
      : { reply: `✅ All items have at least ${threshold} in stock.`, suggestions: ["list all items"] };
  }

  // ---------- AVAILABILITY (exact name, case-insensitive) ----------
  if (/^do we have\s+/.test(q) || /^is\s+/.test(q) || /^find\s+/.test(q)) {
    // strip leading verbs and trailing qualifiers
    let term = q
      .replace(/^do we have\s+/i, "")
      .replace(/^is\s+/i, "")
      .replace(/^find\s+/i, "")
      .replace(/\s+in stock\??$/i, "")
      .replace(/\s+available\??$/i, "")
      .trim();

    if (!term) {
      return { reply: "❌ Please specify the item name to search.", suggestions: ["list all items", "help"] };
    }

    const match = inv.find((it) => String(it.name || "").toLowerCase() === term.toLowerCase());
    if (!match) {
      return { reply: `❌ I couldn't find **${term}** in your inventory.`, suggestions: ["list all items", "add item ..."] };
    }

    const qty = Number(match.quantity || 0);
    const available = qty > 0;
    const status = match.status || (available ? "In Stock" : "Low Stock");

    return {
      reply:
        `${available ? "✅ **Available**" : "⚠️ **Not available**"} — **${match.name}**` +
        (match.sku ? `\n• SKU: ${match.sku}` : "") +
        `\n• Category: ${match.category || "—"}` +
        `\n• Qty: ${qty}` +
        `\n• Price: $${Number(match.price || 0).toFixed(2)}` +
        `\n• Status: ${status}`,
      suggestions: available ? ["list all items", "low stock", "total value"] : ["update item ...", "list all items"],
    };
  }

  // ---------- GREETINGS ----------
  if (["hi", "hello", "hey", "good morning", "good evening"].some((g) => q.includes(g))) {
    return {
      reply: "👋 Hey! I can help you manage and analyze your inventory. Type `help` to see commands, or click a quick command below.",
      suggestions: suggestNext(inv),
    };
  }

  // ---------- FALLBACK ----------
  return {
    reply: "🤔 I didn’t catch that. Type `help` to see commands, or click a quick command below to auto-fill the input.",
    suggestions: suggestNext(inv),
  };
}


/* --------------------- Helpers --------------------- */
function norm(s) { return String(s || "").trim().toLowerCase(); }
function findByName(inv, name) { const n = norm(name); return inv.find(it => norm(it.name) === n); }
function findBySku(inv, sku) { const s = norm(sku); if (!s) return null; return inv.find(it => norm(it.sku) === s); }

function findAvailability(inv, rawTerm) {
  const term = String(rawTerm || '').trim()
  if (!term) return { reply: "❌ Please specify an item name or SKU.", suggestions: ["list all items", "help"] }

  const t = term.toLowerCase()
  const matches = inv.filter(it => {
    const name = String(it.name || '').toLowerCase()
    const sku  = String(it.sku  || '').toLowerCase()
    // match if name contains term OR SKU equals or contains term
    return name.includes(t) || sku.includes(t)
  })

  if (matches.length === 0) {
    return {
      reply: `❌ I couldn’t find anything matching **${term}**.`,
      suggestions: ["list all items", "items with Electronics category", "add item ..."]
    }
  }

  // Single item: say clearly if available or not
  if (matches.length === 1) {
    const it = matches[0]
    const qty = Number(it.quantity || 0)
    const available = qty > 0
    const status = it.status || (qty > 0 ? "In Stock" : "Low Stock")
    return {
      reply:
        `${available ? "✅ **Available**" : "⚠️ **Not available**"} — **${it.name}**` +
        `\n• SKU: ${it.sku || "—"}` +
        `\n• Category: ${it.category || "—"}` +
        `\n• Qty: ${qty}` +
        `\n• Price: $${Number(it.price || 0).toFixed(2)}` +
        `\n• Status: ${status}`,
      suggestions: available
        ? ["list all items", "low stock", "total value"]
        : ["update item ...", "list all items"]
    }
  }

  // Multiple items: list brief lines
  const lines = matches.map(it =>
    `• ${it.name} — SKU: ${it.sku || "—"}, Qty: ${Number(it.quantity||0)}, Status: ${it.status || "In Stock"}`
  ).join("\n")

  return {
    reply: `🔎 I found **${matches.length}** matches for **${term}**:\n${lines}`,
    suggestions: ["list all items", "most expensive", "low stock"]
  }
}

function helpMessage(inv) {
  const cats = knownCategories(inv)
  return (
    '📘 **Commands I understand**\n' +
    '\n**Read / Analyze**\n' +
    '• `list all items` / `show inventory`\n' +
    '• `items with <category> category`\n' +
    '• `most expensive`\n' +
    '• `total value` • `total items`\n' +
    '• `low stock` (default < 5) • `low stock less than 3`\n' +
    (cats.length ? `• Known categories: ${cats.join(', ')}\n` : '') +
    '\n**Write / CRUD**\n' +
    '• `add item <name> category <category> price <number> qty <number> sku <text>`\n' +
    '   e.g. `add item iPhone 15 category Electronics price 1200 qty 5 sku IP15`\n' +
    '• `update item <name> [qty <number>] [price <number>] [category <text>] [sku <text>]`\n' +
    '   e.g. `update item iPhone 15 qty 8 price 1100`\n' +
    '• `delete item <name>`\n' +
    '• `delete all items` / `clear all items`\n' +
    '\n💡 Pro Tip: Click the small chips below to auto-fill commands.'
  )
}
function knownCategories(inv) {
  return Array.from(new Set(inv.map((it) => String(it.category || '').toLowerCase()))).filter(Boolean).map(toTitleCase)
}
function suggestNext(inv) {
  if (!inv || inv.length === 0) {
    return ['add item Sample Phone category Electronics price 499 qty 3 sku SPH1', 'add item Notebook category Office price 7.5 qty 20 sku NBK20', 'list all items', 'help']
  }
  const cats = knownCategories(inv)
  const catExample = cats[0] ? `items with ${cats[0]} category` : 'items with Electronics category'
  return ['list all items', 'most expensive', 'total value', 'low stock less than 3', catExample, 'update item ...', 'delete item ...']
}
function buildQuickSuggestions(inv) {
  if (!inv || inv.length === 0) return ['help', 'add item ...', 'list all items']
  const cats = knownCategories(inv)
  return ['help', 'list all items', 'most expensive', 'total value', 'low stock', cats[0] ? `items with ${cats[0]} category` : 'items with Electronics category']
}
function renderSuggestionsText(suggestions) {
  return '💡 Try next:\n• ' + suggestions.join('\n• ')
}
function parseThreshold(q) {
  const m = q.match(/(?:less than|below|under)\s+(\d+)/)
  if (m) return Number(m[1])
  const m2 = q.match(/<\s*(\d+)/)
  if (m2) return Number(m2[1])
  return null
}
function num(n) {
  const x = Number(n)
  return Number.isFinite(x) ? (x % 1 === 0 ? x.toString() : x.toFixed(2)) : '0'
}
function toTitleCase(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/* --------------------- Parsers --------------------- */
function parseAddCommand(text) {
  const obj = {}
  const nameMatch = text.match(/add item ([^]+?) category/i)
  if (nameMatch) obj.name = nameMatch[1].trim()
  const categoryMatch = text.match(/category ([^]+?) price/i)
  if (categoryMatch) obj.category = toTitleCase(categoryMatch[1].trim())
  const priceMatch = text.match(/price (\d+(\.\d+)?)/i)
  if (priceMatch) obj.price = parseFloat(priceMatch[1])
  const qtyMatch = text.match(/qty (\d+)/i)
  if (qtyMatch) obj.quantity = parseInt(qtyMatch[1])
  const skuMatch = text.match(/sku (\S+)/i)
  if (skuMatch) obj.sku = skuMatch[1]
  return obj
}
function parseUpdateCommand(text) {
  const obj = { fields: {} }
  const nameMatch = text.match(/update item ([^]+?)( qty| price| category| sku|$)/i)
  if (nameMatch) obj.name = nameMatch[1].trim()
  const qtyMatch = text.match(/qty (\d+)/i)
  if (qtyMatch) obj.fields.quantity = parseInt(qtyMatch[1])
  const priceMatch = text.match(/price (\d+(\.\d+)?)/i)
  if (priceMatch) obj.fields.price = parseFloat(priceMatch[1])
  const catMatch = text.match(/category ([^]+?)( sku| qty| price|$)/i)
  if (catMatch) obj.fields.category = toTitleCase(catMatch[1].trim())
  const skuMatch = text.match(/sku (\S+)/i)
  if (skuMatch) obj.fields.sku = skuMatch[1]
  return obj
}