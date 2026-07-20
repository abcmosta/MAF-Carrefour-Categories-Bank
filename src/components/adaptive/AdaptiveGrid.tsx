import type { ReactNode, CSSProperties } from 'react';

interface AdaptiveGridProps {
  children: ReactNode;
  /** Desktop column count (auto-collapses to 2 in compact, 1 in side panel) */
  cols?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * A grid that automatically collapses columns based on CONTAINER width,
 * not viewport width. Powered by CSS container queries in sidepanel.css.
 *
 *   <AdaptiveGrid cols={4}> ... </AdaptiveGrid>
 *     → 4 cols (wide) · 2 cols (compact) · 1 col (side panel)
 *
 * Use this everywhere you'd normally hardcode `grid-cols-4`, etc.
 */
export function AdaptiveGrid({ children, cols = 4, className = '', style, id }: AdaptiveGridProps) {
  return (
    <div
      id={id}
      className={`sp-grid ${className}`}
      style={{ ...(style ?? {}), ['--sp-cols' as string]: cols }}
    >
      {children}
    </div>
  );
}
