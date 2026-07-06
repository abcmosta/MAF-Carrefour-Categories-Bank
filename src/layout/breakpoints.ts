/**
 * Container-query breakpoints (in pixels) for the adaptive layout system.
 *
 * These are CONTAINER widths (not viewport widths) — the app decides its own
 * mode based on the space it actually gets, so it works identically in:
 *   - A full-screen browser tab
 *   - A Chrome / Edge side panel
 *   - A VS Code webview
 *   - A resized popup / PWA window
 *
 * If you tweak these, also update the matching `@container` rules in
 * `src/styles/sidepanel.css`.
 */
export const BREAKPOINTS = {
  /** ≤ this width → Side Panel Mode (single column, compact, touch-friendly) */
  sidePanel: 520,
  /** ≤ this width → Compact Mode (2-column max, condensed toolbars) */
  compact: 768,
  /** ≤ this width → Standard Mode */
  standard: 1024,
} as const;

export type LayoutMode = 'sidepanel' | 'compact' | 'standard' | 'wide';

export function resolveMode(width: number): LayoutMode {
  if (width <= BREAKPOINTS.sidePanel) return 'sidepanel';
  if (width <= BREAKPOINTS.compact) return 'compact';
  if (width <= BREAKPOINTS.standard) return 'standard';
  return 'wide';
}
