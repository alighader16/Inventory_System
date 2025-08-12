function Logo() {
  return (
    <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-md">
      {/* boxes icon */}
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        <path d="M3.3 7L12 12l8.7-5M12 22V12"/>
      </svg>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Inventory Manager
          </h1>
        </div>
        <span className="text-xs rounded-lg border bg-white/70 px-3 py-1.5 shadow-sm">
          Demo Preview
        </span>
      </div>
    </header>
  );
}
