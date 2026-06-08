import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Main" },
  { to: "/schedule", label: "Schedule" },
] as const;

export function Navbar({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/80 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold tracking-tight">
          <span className="text-accent">WC</span> 2026
        </span>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-accent" : "text-text-muted hover:text-text"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="rounded-md bg-accent/10 p-1.5 text-accent transition-colors hover:bg-accent/20"
          aria-label="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      )}
    </nav>
  );
}
