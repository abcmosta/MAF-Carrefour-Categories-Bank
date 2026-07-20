import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSidePanelMode } from '../../layout/SidePanelContext';

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface AdaptiveToolbarProps {
  title?: ReactNode;
  actions: ToolbarAction[];
  /** How many actions stay inline before the rest fold into "⋯". Default: 3 */
  maxInline?: number;
}

const variantClass: Record<NonNullable<ToolbarAction['variant']>, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-500',
  secondary:
    'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ring-1 ring-slate-200 dark:ring-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700',
  ghost:
    'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800',
};

/**
 * Toolbar with overflow logic.
 *
 * Wide:       all actions inline.
 * Compact:    up to `maxInline` (default 3) inline, rest → "⋯" menu.
 * Side panel: only PRIMARY variant stays inline; rest go into a "⋯" popover.
 *             Title truncates elegantly. Secondary actions become icon-only.
 */
export function AdaptiveToolbar({ title, actions, maxInline = 3 }: AdaptiveToolbarProps) {
  const { isSidePanel } = useSidePanelMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const inline = isSidePanel
    ? actions.filter((a) => a.variant === 'primary')
    : actions.slice(0, maxInline);
  const overflow = actions.filter((a) => !inline.includes(a));

  return (
    <div className="sp-flex-stack !flex-row items-center justify-between gap-2">
      {title && (
        <div className="min-w-0 flex-1 sp-h2 truncate text-slate-900 dark:text-zinc-100">
          {title}
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {inline.map((a) => (
          <button
            key={a.id}
            onClick={a.onClick}
            disabled={a.disabled}
            className={`sp-hit inline-flex items-center gap-2 rounded-[var(--sp-radius)]
                        px-3 sp-body font-semibold transition
                        disabled:cursor-not-allowed disabled:opacity-50
                        ${variantClass[a.variant ?? 'secondary']}`}
          >
            {a.icon}
            {/* Icon-only in side-panel to save space, unless it's primary */}
            <span className={isSidePanel && a.variant !== 'primary' ? 'sr-only' : ''}>
              {a.label}
            </span>
          </button>
        ))}

        {overflow.length > 0 && (
          <div className="relative">
            <button
              aria-label="More actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="sp-hit rounded-[var(--sp-radius)]
                         bg-white dark:bg-zinc-800 px-3 sp-body font-semibold
                         text-slate-800 dark:text-zinc-100
                         ring-1 ring-slate-200 dark:ring-zinc-700
                         hover:bg-slate-50 dark:hover:bg-zinc-700"
            >
              ⋯
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full z-40 mt-1 min-w-[12rem]
                             overflow-hidden rounded-[var(--sp-radius)]
                             bg-white dark:bg-zinc-900
                             shadow-xl ring-1 ring-slate-200 dark:ring-zinc-800"
                >
                  {overflow.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { a.onClick(); setMenuOpen(false); }}
                      disabled={a.disabled}
                      className="sp-hit flex w-full items-center gap-2 px-3 sp-body
                                 text-left text-slate-800 dark:text-zinc-100
                                 hover:bg-slate-100 dark:hover:bg-zinc-800
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {a.icon}{a.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
