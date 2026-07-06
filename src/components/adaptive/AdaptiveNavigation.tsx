import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSidePanelMode } from '../../layout/SidePanelContext';

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  badge?: string | number;
}

interface AdaptiveNavigationProps {
  brand: ReactNode;
  items: NavItem[];
  activeId: string;
  /** Extra action nodes rendered on the right of the header (avatar, help, etc.) */
  actions?: ReactNode;
}

/**
 * Wide/compact:   Horizontal top bar with brand + inline nav + actions.
 * Side panel:     Slim header + hamburger overflow drawer + BOTTOM TAB BAR
 *                 (first 3 items visible, rest go into "More").
 *
 * The bottom tab bar keeps the most important actions always accessible
 * with a single tap — the core UX principle for side-panel workflows.
 */
export function AdaptiveNavigation({
  brand,
  items,
  activeId,
  actions,
}: AdaptiveNavigationProps) {
  const { isSidePanel } = useSidePanelMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isSidePanel) {
    return (
      <header
        className="sticky top-0 z-30 flex h-[var(--sp-header-height)] w-full
                   items-center gap-4 border-b border-slate-200 dark:border-zinc-800
                   bg-white/90 dark:bg-zinc-950/80 px-[var(--sp-pad-x)]
                   backdrop-blur-md"
      >
        <div className="shrink-0">{brand}</div>
        <nav className="flex flex-1 items-center gap-1">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={it.onSelect}
              aria-current={it.id === activeId ? 'page' : undefined}
              className={`sp-hit rounded-lg px-3 sp-body transition
                ${it.id === activeId
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'}`}
            >
              <span className="flex items-center gap-2">
                {it.icon}{it.label}
                {it.badge != null && (
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    {it.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">{actions}</div>
      </header>
    );
  }

  // ---------- Side Panel Mode ----------
  const primary = items.slice(0, 3);
  const overflow = items.slice(3);

  return (
    <>
      {/* Slim top header */}
      <header
        className="sticky top-0 z-30 flex h-[var(--sp-header-height)] w-full
                   items-center justify-between gap-2 border-b border-slate-200
                   dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90
                   px-[var(--sp-pad-x)] backdrop-blur-md"
      >
        <div className="min-w-0 truncate">{brand}</div>
        <div className="flex items-center gap-1">
          {actions}
          {overflow.length > 0 && (
            <button
              aria-label="More navigation"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
              className="sp-hit rounded-md px-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              ☰
            </button>
          )}
        </div>
      </header>

      {/* Overflow drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="sp-sheet absolute inset-x-0 bottom-0 max-h-[70dvh]
                       overflow-y-auto bg-white dark:bg-zinc-900 p-[var(--sp-pad-x)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sp-h3 mb-3 text-slate-900 dark:text-zinc-100">More</div>
            <ul className="flex flex-col gap-1">
              {overflow.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => { it.onSelect(); setDrawerOpen(false); }}
                    className="sp-hit flex w-full items-center gap-3 rounded-md
                               px-3 text-left sp-body text-slate-800 dark:text-zinc-200
                               hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    {it.icon}{it.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around gap-1
                   border-t border-slate-200 dark:border-zinc-800
                   bg-white/95 dark:bg-zinc-950/90 px-1 py-1 backdrop-blur-md"
      >
        {primary.map((it) => {
          const active = it.id === activeId;
          return (
            <button
              key={it.id}
              onClick={it.onSelect}
              aria-current={active ? 'page' : undefined}
              className={`sp-hit flex flex-1 flex-col items-center justify-center rounded-md
                px-1 text-[11px] transition
                ${active
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'}`}
            >
              <span className="text-lg leading-none">{it.icon ?? '•'}</span>
              <span className="mt-0.5 truncate font-semibold">{it.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
