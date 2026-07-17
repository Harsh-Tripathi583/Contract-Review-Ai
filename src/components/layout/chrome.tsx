import { Link, useLocation } from "@tanstack/react-router";
import { Icon } from "@/components/ui/icon";

export function TopNavBar({ current }: { current?: string }) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-headline-md font-headline-md font-bold text-on-surface">
          Contract Review AI
        </Link>
        <nav className="hidden md:flex gap-6 ml-6 h-16 items-center">
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
            My Contracts
          </a>
          <Link
            to="/review"
            search={true}
            className="text-primary font-bold border-b-2 border-primary pb-1 h-16 flex items-center"
            data-current={current === "review"}
          >
            Current Contract
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4 text-on-surface-variant">
        <button
          aria-label="settings"
          className="p-2 rounded-full hover:bg-surface-variant transition-colors"
        >
          <Icon name="settings" />
        </button>
        <button
          aria-label="notifications"
          className="p-2 rounded-full hover:bg-surface-variant transition-colors relative"
        >
          <Icon name="notifications" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-surface" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2 bg-surface-variant grid place-items-center">
          <Icon name="person" size={18} />
        </div>
      </div>
    </header>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  iconColor?: string;
}

const items: NavItem[] = [
  { to: "/review", label: "Overview", icon: "dashboard" },
  { to: "/review/extracted", label: "Extracted Information", icon: "description" },
  { to: "/review/clauses", label: "Clauses", icon: "gavel" },
  { to: "/review/obligations", label: "Obligations", icon: "assignment" },
  { to: "/review/risks", label: "Risk Analysis", icon: "warning" },
  { to: "/review/summary", label: "Executive Summary", icon: "summarize" },
  { to: "/review/human-review", label: "Human Review", icon: "rate_review" },
  { to: "/review/audit-trail", label: "Audit Trail", icon: "history" },
];

export function SideNavBar() {
  const location = useLocation();
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 flex flex-col p-4 overflow-y-auto bg-surface-container-low border-r border-outline-variant z-40">
      <div className="mb-6 px-2 flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed grid place-items-center">
          <Icon name="description" size={22} className="text-primary" />
        </div>
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Review Workspace</h2>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
            AI Analysis Mode
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((it) => {
          const active =
            it.to === "/review"
              ? location.pathname === "/review" || location.pathname === "/review/"
              : location.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              search={true}
              className={
                active
                  ? "flex items-center gap-2 px-3 py-2 bg-secondary-container text-on-secondary-container font-semibold rounded-lg text-label-md"
                  : "flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:bg-surface-variant rounded-lg text-label-md group transition-colors"
              }
            >
              <Icon
                name={it.icon}
                size={20}
                className={active ? "text-primary" : "group-hover:text-primary transition-colors"}
                filled={active}
              />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-4 pt-4 border-t border-outline-variant/30">
        <Link
          to="/"
          className="w-full bg-primary-container text-on-primary py-2 rounded-lg text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
        >
          <Icon name="add" size={18} />
          New Analysis
        </Link>
      </div>
    </aside>
  );
}
