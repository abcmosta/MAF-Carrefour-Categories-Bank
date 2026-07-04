import { Settings, Eye, EyeOff, Check, Filter } from "lucide-react";
import { SearchOptions } from "../types";

interface SearchControlsProps {
  headers: string[];
  searchOptions: SearchOptions;
  onSearchOptionsChange: (options: SearchOptions) => void;
  hiddenColumns: number[];
  onHiddenColumnsChange: (columns: number[]) => void;
}

export default function SearchControls({
  headers,
  searchOptions,
  onSearchOptionsChange,
  hiddenColumns,
  onHiddenColumnsChange,
}: SearchControlsProps) {
  const toggleCaseSensitive = () => {
    onSearchOptionsChange({
      ...searchOptions,
      caseSensitive: !searchOptions.caseSensitive,
    });
  };

  const toggleExactMatch = () => {
    onSearchOptionsChange({
      ...searchOptions,
      exactMatch: !searchOptions.exactMatch,
    });
  };

  const toggleColumnSearchable = (idx: number) => {
    const isCurrentlySearchable = searchOptions.searchableColumns.includes(idx);
    let newSearchable: number[];
    if (isCurrentlySearchable) {
      // Remove it
      newSearchable = searchOptions.searchableColumns.filter((colIdx) => colIdx !== idx);
    } else {
      // Add it
      newSearchable = [...searchOptions.searchableColumns, idx];
    }
    onSearchOptionsChange({
      ...searchOptions,
      searchableColumns: newSearchable,
    });
  };

  const clearColumnSearchFilters = () => {
    onSearchOptionsChange({
      ...searchOptions,
      searchableColumns: [],
    });
  };

  const toggleColumnVisibility = (idx: number) => {
    const isHidden = hiddenColumns.includes(idx);
    if (isHidden) {
      onHiddenColumnsChange(hiddenColumns.filter((colIdx) => colIdx !== idx));
    } else {
      if (hiddenColumns.length >= headers.length - 1) {
        // Prevent hiding ALL columns
        alert("At least one column must remain visible.");
        return;
      }
      onHiddenColumnsChange([...hiddenColumns, idx]);
    }
  };

  const showAllColumns = () => {
    onHiddenColumnsChange([]);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xs p-5 mb-6" id="search-controls-container">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 mb-4">
        <Settings className="w-4 h-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-100">Search Options & Column Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Mode Settings */}
        <div className="space-y-3.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Match Parameters</p>
          <div className="space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={searchOptions.caseSensitive}
                onChange={toggleCaseSensitive}
                className="mt-0.5 rounded-sm border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
              />
              <div className="text-sm">
                <span className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">Case Sensitive</span>
                <p className="text-xs text-zinc-400">Match exact casing of query words</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={searchOptions.exactMatch}
                onChange={toggleExactMatch}
                className="mt-0.5 rounded-sm border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
              />
              <div className="text-sm">
                <span className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">Exact Cell Match</span>
                <p className="text-xs text-zinc-400">Cell contents must match query entirely</p>
              </div>
            </label>
          </div>
        </div>

        {/* Target Columns to Search */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Search In</p>
            {searchOptions.searchableColumns.length > 0 && (
              <button
                onClick={clearColumnSearchFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
              >
                Reset (All Columns)
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto border border-zinc-800 rounded-xl p-2 bg-zinc-900/30 space-y-1">
            {headers.map((header, idx) => {
              const isChecked = searchOptions.searchableColumns.includes(idx);
              const isSearchingAll = searchOptions.searchableColumns.length === 0;
              return (
                <button
                  key={`search-col-${idx}`}
                  onClick={() => toggleColumnSearchable(idx)}
                  className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isChecked
                      ? "bg-emerald-900/40 text-emerald-300 font-medium"
                      : "hover:bg-zinc-800/40 text-zinc-300"
                  }`}
                >
                  <span className="truncate pr-2">{header}</span>
                  {isChecked ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  ) : isSearchingAll ? (
                    <span className="text-[10px] text-zinc-400 font-medium bg-zinc-800/60 px-1.5 py-0.5 rounded-sm">Active</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-zinc-400 shrink-0" />
            {searchOptions.searchableColumns.length === 0
              ? "Currently searching across all spreadsheet columns."
              : `Searching specifically in ${searchOptions.searchableColumns.length} chosen column(s).`}
          </p>
        </div>

        {/* Column Visibility */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Visible Columns</p>
            {hiddenColumns.length > 0 && (
              <button
                onClick={showAllColumns}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto border border-zinc-800 rounded-xl p-2 bg-zinc-900/30 space-y-1">
            {headers.map((header, idx) => {
              const isHidden = hiddenColumns.includes(idx);
              return (
                <button
                  key={`vis-col-${idx}`}
                  onClick={() => toggleColumnVisibility(idx)}
                  className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isHidden
                      ? "bg-zinc-800/40 text-zinc-500 line-through decoration-zinc-600"
                      : "hover:bg-zinc-800/40 text-zinc-200 font-medium"
                  }`}
                >
                  <span className="truncate pr-2">{header}</span>
                  {isHidden ? (
                    <EyeOff className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-zinc-400">
            {hiddenColumns.length === 0
              ? "All columns are currently visible in the table below."
              : `Hiding ${hiddenColumns.length} column(s) from table rendering.`}
          </p>
        </div>
      </div>
    </div>
  );
}
