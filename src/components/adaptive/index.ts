// ---------- Adaptive components ----------
export { AdaptiveGrid } from './AdaptiveGrid';

export { AdaptiveStatCard } from './AdaptiveStatCard';

export { AdaptiveNavigation } from './AdaptiveNavigation';
export type { NavItem } from './AdaptiveNavigation';

export { AdaptiveSearch } from './AdaptiveSearch';

export { AdaptiveFilters } from './AdaptiveFilters';
export type { FilterGroup } from './AdaptiveFilters';

export { AdaptiveTable } from './AdaptiveTable';
export type { TableColumn } from './AdaptiveTable';

export { AdaptiveDialog } from './AdaptiveDialog';

export { AdaptiveToolbar } from './AdaptiveToolbar';
export type { ToolbarAction } from './AdaptiveToolbar';

// ---------- Layout re-exports (single import path) ----------
export { SidePanelLayout } from '../../layout/SidePanelLayout';
export { useSidePanelMode } from '../../layout/SidePanelContext';
export { BREAKPOINTS, resolveMode } from '../../layout/breakpoints';
export type { LayoutMode } from '../../layout/breakpoints';
