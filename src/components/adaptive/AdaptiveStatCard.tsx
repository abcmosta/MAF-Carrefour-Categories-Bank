import type { ReactNode } from 'react';
import { useSidePanelMode } from '../../layout/SidePanelContext';

interface AdaptiveStatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  onClick?: () => void;
}

const toneRing: Record<NonNullable<AdaptiveStatCardProps['tone']>, string> = {
  default: 'ring-slate-200 dark:ring-zinc-800',
  success: 'ring-emerald-400/30',
  warning: 'ring-amber-400/30',
  danger:  'ring-rose-400/30',
  accent:  'ring-blue-400/30',
};

/**
 * Dashboard stat cards ("161 · NEW D.P.H. CATEGORIES", etc.).
 *
 * Wide/compact: full card with icon top-right, big number, hint line.
 * Side panel:   row-style compact card (icon | label | value) — half height,
 *               no hint (collapsed into aria-label), tap target still 44px.
 */
export function AdaptiveStatCard({
  label,
  value,
  icon,
  hint,
  tone = 'default',
  onClick,
}: AdaptiveStatCardProps) {
  const { isSidePanel } = useSidePanelMode();
  const Wrapper = onClick ? 'button' : 'div';
  const commonAria = hint ? `${label}: ${value}. ${hint}` : `${label}: ${value}`;

  if (isSidePanel) {
    return (
      <Wrapper
        onClick={onClick}
        aria-label={commonAria}
        className={`sp-hit flex w-full items-center gap-3 rounded-[var(--sp-radius)]
          bg-white dark:bg-zinc-900 px-3 py-2.5 ring-1 ${toneRing[tone]}
          text-left transition hover:bg-slate-50 dark:hover:bg-zinc-800
          active:scale-[0.99]`}
      >
        {icon && <span className="shrink-0 opacity-80">{icon}</span>}
        <span className="min-w-0 flex-1 truncate sp-meta uppercase tracking-wide text-slate-500 dark:text-zinc-400">
          {label}
        </span>
        <span className="sp-h3 tabular-nums text-slate-900 dark:text-zinc-100">
          {value}
        </span>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      onClick={onClick}
      aria-label={commonAria}
      className={`relative flex flex-col justify-between rounded-[var(--sp-radius)]
        bg-white dark:bg-zinc-900 p-[var(--sp-pad-x)] ring-1 ${toneRing[tone]}
        text-left transition hover:bg-slate-50 dark:hover:bg-zinc-800`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="sp-meta uppercase tracking-wide text-slate-500 dark:text-zinc-400">
          {label}
        </span>
        {icon && <span className="opacity-80">{icon}</span>}
      </div>
      <div className="mt-4 sp-h1 tabular-nums text-slate-900 dark:text-zinc-100">
        {value}
      </div>
      {hint && <div className="mt-1 sp-meta text-slate-500 dark:text-zinc-400">{hint}</div>}
    </Wrapper>
  );
}
