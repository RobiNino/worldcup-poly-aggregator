import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Schedule" },
  { to: "/overall", label: "Overall Winner" },
  { to: "/golden-boot", label: "Golden Boot" },
  { to: "/release-notes", label: "Release Notes" },
] as const;

export function Navbar() {
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
    </nav>
  );
}
