import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSidePanelMode } from '../../layout/SidePanelContext';

export interface FilterGroup {
  id: string;
  label: string;
  render: () => ReactNode;
  /** How many values are currently active in this group (for badge counts) */
  activeCount?: number;
}

interface AdaptiveFiltersProps {
  groups: FilterGroup[];
  onClearAll?: () => void;
  onApply?: () => void;
}

/**
 * Wide/compact: Inline filter row (always visible).
 * Side panel:   A single "Filters (N)" pill button opens a bottom sheet with
 *               all filter groups stacked vertically. Apply + Clear stick to
 *               the sheet footer so the user never scrolls to submit.
 */
export function AdaptiveFilters({ groups, onClearAll, onApply }: AdaptiveFiltersProps) {
  const { isSidePanel } = useSidePanelMode();
  const [open, setOpen] = useState(false);
  const totalActive = groups.reduce((n, g) => n + (g.activeCount ?? 0), 0);

  if (!isSidePanel) {
    return (
      <div className="flex flex-wrap items-center gap-[var(--sp-gap)]">
        {groups.map((g) => (
          <div key={g.id} className="flex items-center gap-2">
            <span className="sp-meta text-slate-500 dark:text-zinc-400">{g.label}</span>
            {g.render()}
          </div>
        ))}
        {onClearAll && totalActive > 0 && (
          <button
            onClick={onClearAll}
            className="ml-auto text-sm font-semibold text-slate-600 dark:text-zinc-400 underline hover:text-slate-900 dark:hover:text-zinc-100"
          >
            Clear all
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sp-hit inline-flex items-center gap-2 rounded-full
                   bg-white dark:bg-zinc-900 px-4 sp-body font-semibold
                   text-slate-800 dark:text-zinc-100
                   ring-1 ring-slate-200 dark:ring-zinc-800
                   hover:bg-slate-50 dark:hover:bg-zinc-800"
      >
        ⚙︎ Filters
        {totalActive > 0 && (
          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
            {totalActive}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="sp-sheet absolute inset-x-0 bottom-0 flex max-h-[85dvh]
                       flex-col bg-white dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-[var(--sp-pad-x)] py-3
                            border-b border-slate-200 dark:border-zinc-800">
              <div className="sp-h3 text-slate-900 dark:text-zinc-100">Filters</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="sp-hit rounded-md px-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto sp-scroll px-[var(--sp-pad-x)] py-3">
              <div className="flex flex-col gap-4">
                {groups.map((g) => (
                  <section key={g.id}>
                    <div className="mb-2 sp-meta uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                      {g.label}
                      {g.activeCount ? ` · ${g.activeCount}` : ''}
                    </div>
                    {g.render()}
                  </section>
                ))}
              </div>
            </div>

            <div className="sp-actionbar !static !border-t !bg-white dark:!bg-zinc-950">
              {onClearAll && (
                <button
                  onClick={onClearAll}
                  className="sp-hit flex-1 rounded-[var(--sp-radius)]
                             bg-slate-100 dark:bg-zinc-800 px-4 sp-body
                             font-semibold text-slate-800 dark:text-zinc-100
                             ring-1 ring-slate-200 dark:ring-zinc-700"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => { onApply?.(); setOpen(false); }}
                className="sp-hit flex-[2] rounded-[var(--sp-radius)] bg-blue-600
                           px-4 sp-body font-semibold text-white hover:bg-blue-500"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
