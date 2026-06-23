import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Schedule" },
  { to: "/overall", label: "Overall" },
  { to: "/release-notes", label: "Release Notes" },
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
      <div className="flex items-center gap-2">
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
        <a
          href="https://github.com/RobiNino/worldcup-poly-aggregator"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-border hover:text-text"
          aria-label="View source on GitHub"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
      </div>
    </nav>
  );
}
