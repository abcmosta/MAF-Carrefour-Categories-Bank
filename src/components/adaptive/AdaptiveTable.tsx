import type { ReactNode } from 'react';
import { useSidePanelMode } from '../../layout/SidePanelContext';

export interface TableColumn<T> {
  id: string;
  header: string;
  /** Cell renderer */
  cell: (row: T) => ReactNode;
  /**
   * Priority in side-panel mode:
   *   'primary'   → shown prominently at the top of the card
   *   'secondary' → folded into a compact label/value grid below
   * Default: 'primary'
   */
  priority?: 'primary' | 'secondary';
  /** Column width (Tailwind class, wide mode only, e.g. 'w-32') */
  widthClass?: string;
  /** Right-align numeric values */
  numeric?: boolean;
}

interface AdaptiveTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Optional actions rendered inside each card in side-panel mode */
  cardFooter?: (row: T) => ReactNode;
  emptyState?: ReactNode;
}

/**
 * Wide/compact: Real <table> with all columns (matches your current design).
 * Side panel:   Each row becomes a Card. Primary cols at the top, secondary
 *               cols become label/value pairs below, actions in the footer.
 *               No horizontal scroll, ever.
 *
 * Same <AdaptiveTable /> JSX works in both modes — the component decides.
 */
export function AdaptiveTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  cardFooter,
  emptyState,
}: AdaptiveTableProps<T>) {
  const { isSidePanel } = useSidePanelMode();

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--sp-radius)] bg-slate-50 dark:bg-zinc-900 p-6 text-center sp-meta text-slate-500 dark:text-zinc-400 ring-1 ring-slate-200 dark:ring-zinc-800">
        {emptyState ?? 'No results.'}
      </div>
    );
  }

  const primary = columns.filter((c) => c.priority !== 'secondary');
  const secondary = columns.filter((c) => c.priority === 'secondary');

  // ---------- WIDE / COMPACT: real table ----------
  if (!isSidePanel) {
    return (
      <div className="overflow-x-auto rounded-[var(--sp-radius)] ring-1 ring-slate-200 dark:ring-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50/80 dark:bg-zinc-950/40 sp-meta uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.id}
                  className={`px-4 py-3 font-bold ${c.widthClass ?? ''} ${c.numeric ? 'text-right' : ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={rowKey(r)}
                onClick={() => onRowClick?.(r)}
                className={`border-t border-slate-100 dark:border-zinc-800/60 sp-body text-slate-800 dark:text-zinc-200
                            ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40' : ''}`}
              >
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={`px-4 py-3 ${c.numeric ? 'text-right tabular-nums' : ''}`}
                  >
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ---------- SIDE PANEL: card list ----------
  return (
    <div className="flex flex-col gap-[var(--sp-gap)]">
      {rows.map((r) => (
        <article
          key={rowKey(r)}
          onClick={() => onRowClick?.(r)}
          className={`rounded-[var(--sp-radius)] bg-white dark:bg-zinc-900 p-3
                      ring-1 ring-slate-200 dark:ring-zinc-800
                      ${onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40' : ''}`}
        >
          <div className="flex flex-col gap-1.5">
            {primary.map((c, idx) => (
              <div
                key={c.id}
                className={idx === 0
                  ? 'sp-h3 text-slate-900 dark:text-zinc-100'
                  : 'sp-body text-slate-700 dark:text-zinc-300'}
              >
                {c.cell(r)}
              </div>
            ))}
          </div>

          {secondary.length > 0 && (
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {secondary.map((c) => (
                <div key={c.id} className="contents">
                  <dt className="sp-meta uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                    {c.header}
                  </dt>
                  <dd className={`sp-meta text-slate-800 dark:text-zinc-200 ${c.numeric ? 'text-right tabular-nums' : ''}`}>
                    {c.cell(r)}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {cardFooter && (
            <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 dark:border-zinc-800/60 pt-2">
              {cardFooter(r)}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
