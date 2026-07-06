import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSidePanelMode } from '../../layout/SidePanelContext';

interface AdaptiveDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Primary action button (rendered in footer / bottom bar) */
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  /** Max width in wide mode (Tailwind class) */
  maxWidthClass?: string;
}

/**
 * Wide/compact: centered modal card, subtle scrim, ESC to close.
 * Side panel:   full-height bottom-sheet, drag-handle affordance, actions
 *               pinned to the bottom action bar (thumb-reachable).
 *
 * Body-scroll lock is applied while open so background pages don't shift.
 */
export function AdaptiveDialog({
  open,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  maxWidthClass = 'max-w-lg',
}: AdaptiveDialogProps) {
  const { isSidePanel } = useSidePanelMode();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const footer = (primaryAction || secondaryAction) && (
    <>
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          className="sp-hit flex-1 rounded-[var(--sp-radius)]
                     bg-slate-100 dark:bg-zinc-800 px-4 sp-body font-semibold
                     text-slate-800 dark:text-zinc-100
                     ring-1 ring-slate-200 dark:ring-zinc-700"
        >
          {secondaryAction.label}
        </button>
      )}
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className="sp-hit flex-[2] rounded-[var(--sp-radius)] bg-blue-600 px-4
                     sp-body font-semibold text-white hover:bg-blue-500
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {primaryAction.label}
        </button>
      )}
    </>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex bg-black/50"
      onClick={onClose}
    >
      {isSidePanel ? (
        <div
          className="sp-sheet mt-auto flex max-h-[92dvh] w-full flex-col
                     bg-white dark:bg-zinc-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle affordance */}
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300 dark:bg-zinc-600" aria-hidden />
          <div className="flex items-center justify-between px-[var(--sp-pad-x)] py-3
                          border-b border-slate-200 dark:border-zinc-800">
            <div className="sp-h3 text-slate-900 dark:text-zinc-100">{title}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="sp-hit rounded-md px-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto sp-scroll p-[var(--sp-pad-x)] text-slate-800 dark:text-zinc-200">
            {children}
          </div>
          {footer && (
            <div className="sp-actionbar !static !border-t !bg-white dark:!bg-zinc-950">
              {footer}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`m-auto flex w-full ${maxWidthClass} flex-col
                      rounded-[var(--sp-radius)] bg-white dark:bg-zinc-900
                      ring-1 ring-slate-200 dark:ring-zinc-800 shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="sp-h3 text-slate-900 dark:text-zinc-100">{title}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="sp-hit rounded-md px-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-6 text-slate-800 dark:text-zinc-200">
            {children}
          </div>
          {footer && (
            <div className="flex items-center gap-3 border-t border-slate-200 dark:border-zinc-800 p-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
