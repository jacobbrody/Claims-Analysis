import { Search, Settings, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-14 bg-brand-800 text-white flex items-center px-4 gap-4 shrink-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg">💊</span>
        <h1 className="text-sm font-bold tracking-wide whitespace-nowrap">
          Pharmacy Claims Analytics
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search claims, NDC, member, prescriber…"
            aria-label="Global search"
            className="w-full bg-white/10 text-sm text-white placeholder-white/50 rounded-lg pl-9 pr-4 py-2
                       border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/15 transition"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-white/70 hidden sm:block">HealthBridge Rx</span>
        <button className="p-1.5 rounded-md hover:bg-white/10 transition" aria-label="Settings">
          <Settings size={16} className="text-white/70" />
        </button>
        <button className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-semibold" aria-label="User profile">
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
