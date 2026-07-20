import { useSidePanelMode } from '../../layout/SidePanelContext';
import type { ReactNode } from 'react';

interface AdaptiveSearchProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  /** Column-scope dropdown / "All Columns" style selector */
  scopeControl?: ReactNode;
  /** Submit button label — becomes icon-only in side-panel mode */
  submitLabel?: string;
  /** Optional quick-search chips (e.g. "lipstick", "eau de parfum") */
  chips?: string[];
  onChipClick?: (chip: string) => void;
}

/**
 * Main search bar. Matches your "Search the complete 2,255 category database…"
 * pattern.
 *
 * Wide/compact: [ Scope ▾ ] [   Input   ] [ Search ]  — one row
 * Side panel:   Scope on line 1, input on line 2, submit is a sticky
 *               full-width bottom bar button so the value is always in reach
 *               even when the user scrolls the results list.
 */
export function AdaptiveSearch({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search…',
  scopeControl,
  submitLabel = 'Search',
  chips,
  onChipClick,
}: AdaptiveSearchProps) {
  const { isSidePanel } = useSidePanelMode();

  const input = (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
      placeholder={placeholder}
      className="sp-hit w-full rounded-[var(--sp-radius)]
                 bg-white dark:bg-zinc-900 px-4 sp-body
                 text-slate-900 dark:text-zinc-100
                 placeholder-slate-400 dark:placeholder-zinc-500
                 ring-1 ring-slate-200 dark:ring-zinc-800
                 focus:outline-none focus:ring-blue-500/60"
    />
  );

  const submit = (
    <button
      onClick={onSubmit}
      aria-label={submitLabel}
      className="sp-hit rounded-[var(--sp-radius)] bg-blue-600 px-5 sp-body
                 font-semibold text-white hover:bg-blue-500 active:scale-[0.99]"
    >
      🔍 {isSidePanel ? '' : submitLabel}
    </button>
  );

  return (
    <div className="flex flex-col gap-[var(--sp-gap)]">
      {isSidePanel ? (
        <>
          {scopeControl && <div className="w-full">{scopeControl}</div>}
          {input}
        </>
      ) : (
        <div className="flex items-center gap-[var(--sp-gap)]">
          {scopeControl && <div className="shrink-0">{scopeControl}</div>}
          <div className="flex-1">{input}</div>
          {submit}
        </div>
      )}

      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => onChipClick?.(c)}
              className="rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1
                         text-xs font-semibold text-slate-700 dark:text-zinc-300
                         ring-1 ring-slate-200 dark:ring-zinc-700
                         hover:bg-slate-200 dark:hover:bg-zinc-700"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {isSidePanel && (
        <div className="sp-actionbar">
          <div className="flex-1">{submit}</div>
        </div>
      )}
    </div>
  );
}
