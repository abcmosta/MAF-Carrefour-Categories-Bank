import { createContext, useContext } from 'react';
import type { LayoutMode } from './breakpoints';

export interface SidePanelContextValue {
  /** Current resolved layout mode based on container width */
  mode: LayoutMode;
  /** Live container width in px */
  width: number;
  /** Convenience booleans for JSX ergonomics */
  isSidePanel: boolean;
  isCompact: boolean;
  isStandard: boolean;
  isWide: boolean;
}

export const SidePanelContext = createContext<SidePanelContextValue>({
  mode: 'wide',
  width: 1440,
  isSidePanel: false,
  isCompact: false,
  isStandard: false,
  isWide: true,
});

/**
 * Access the current layout mode from anywhere inside <SidePanelLayout>.
 *
 * @example
 *   const { isSidePanel } = useSidePanelMode();
 *   return isSidePanel ? <StackedView /> : <TableView />;
 */
export function useSidePanelMode(): SidePanelContextValue {
  return useContext(SidePanelContext);
}
