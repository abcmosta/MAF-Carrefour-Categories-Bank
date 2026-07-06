import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { SidePanelContext } from './SidePanelContext';
import { resolveMode, type LayoutMode } from './breakpoints';

interface SidePanelLayoutProps {
  children: ReactNode;
  /**
   * Optional override — force a specific mode (useful for Storybook,
   * screenshot tests, or debugging).
   */
  forceMode?: LayoutMode;
  /** Extra className on the outer container */
  className?: string;
}

/**
 * Root layout wrapper. Measures its OWN width with ResizeObserver and
 * publishes the resolved LayoutMode to the whole subtree via context.
 *
 * Wrap once at the root of your app (e.g. in main.tsx). All pages/components
 * read `useSidePanelMode()` — no prop drilling.
 *
 * The wrapper also sets a CSS container so `@container` queries work
 * for pure-CSS/Tailwind styling paths.
 */
export function SidePanelLayout({
  children,
  forceMode,
  className = '',
}: SidePanelLayoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth,
  );

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // contentBoxSize is more accurate than getBoundingClientRect
        const w = Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0].inlineSize
          : (entry.contentBoxSize as ResizeObserverSize).inlineSize;
        setWidth(Math.round(w));
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mode: LayoutMode = forceMode ?? resolveMode(width);

  const value = useMemo(
    () => ({
      mode,
      width,
      isSidePanel: mode === 'sidepanel',
      isCompact: mode === 'compact',
      isStandard: mode === 'standard',
      isWide: mode === 'wide',
    }),
    [mode, width],
  );

  return (
    <SidePanelContext.Provider value={value}>
      <div
        ref={ref}
        data-layout-mode={mode}
        // The `sp-root` class enables container queries via sidepanel.css
        className={`sp-root min-h-dvh w-full ${className}`}
      >
        {children}
      </div>
    </SidePanelContext.Provider>
  );
}
