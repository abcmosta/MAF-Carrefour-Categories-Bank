import React, { useState } from "react";
import {
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  CopyCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CopyToast } from "../types";

interface SpreadsheetTableProps {
  headers: string[];
  rows: string[][]; // Filtered rows only
  totalOriginalRowsCount: number;
  searchQuery: string;
  caseSensitive: boolean;
  hiddenColumns: number[];
}

export default function SpreadsheetTable({
  headers,
  rows,
  totalOriginalRowsCount,
  searchQuery,
  caseSensitive,
  hiddenColumns,
}: SpreadsheetTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copyToasts, setCopyToasts] = useState<CopyToast[]>([]);
  const itemsPerPage = 50;

  // Reset pagination when filtered rows or search parameters change
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const displayPage = Math.min(currentPage, totalPages || 1);
  const startIndex = (displayPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, rows.length);
  const paginatedRows = rows.slice(startIndex, endIndex);

  const handleCellClick = (text: string, e: React.MouseEvent) => {
    // Write text to clipboard
    navigator.clipboard.writeText(text);

    // Create a toast message directly at the click coordinates
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: CopyToast = {
      id,
      text: text.length > 20 ? `${text.slice(0, 20)}...` : text,
      x: e.clientX,
      y: e.clientY,
    };

    setCopyToasts((prev) => [...prev, newToast]);

    // Auto delete after 900ms
    setTimeout(() => {
      setCopyToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 900);
  };

  const handleCopyRow = (row: string[], e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy only visible cells
    const visibleCells = row.filter((_, idx) => !hiddenColumns.includes(idx));
    const rowText = visibleCells.join("\t");
    navigator.clipboard.writeText(rowText);

    const id = Math.random().toString(36).substring(2, 9);
    const newToast: CopyToast = {
      id,
      text: "Copied Row!",
      x: e.clientX,
      y: e.clientY,
    };
    setCopyToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setCopyToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 900);
  };

  const handleCopyAllFiltered = () => {
    if (rows.length === 0) return;
    
    // Copy entire filtered set (only visible columns)
    const visibleHeaders = headers.filter((_, idx) => !hiddenColumns.includes(idx));
    const csvContent = [
      visibleHeaders.join("\t"),
      ...rows.map(row => 
        row.filter((_, idx) => !hiddenColumns.includes(idx)).join("\t")
      )
    ].join("\n");

    navigator.clipboard.writeText(csvContent);
    alert(`Copied all ${rows.length} rows to clipboard in tab-separated Excel format!`);
  };

  const handleDownloadCSV = () => {
    if (rows.length === 0) return;

    const visibleHeaders = headers.filter((_, idx) => !hiddenColumns.includes(idx));
    const csvRows = [
      visibleHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => 
        row
          .filter((_, idx) => !hiddenColumns.includes(idx))
          .map(val => `"${val.replace(/"/g, '""')}"`)
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `filtered_search_results.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to highlight matches safely
  const highlightCell = (text: string, query: string) => {
    if (!query.trim()) return <span className="text-zinc-300">{text}</span>;

    // Standardize query to make regex-safe
    const safeQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const flags = caseSensitive ? "g" : "gi";
    const regex = new RegExp(`(${safeQuery})`, flags);

    const parts = text.split(regex);

    return (
      <span className="text-zinc-300 font-normal">
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark
              key={index}
              className="bg-amber-600/40 text-amber-200 px-0.5 rounded-sm font-medium border-b border-amber-500/40"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xs overflow-hidden" id="spreadsheet-table-container">
      {/* Table Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900/50 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            <span>Query Results Table</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-zinc-800/80 text-zinc-300 rounded-full font-mono">
              {rows.length} of {totalOriginalRowsCount} rows matching
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Click any individual cell to copy its value, or use row copy buttons.
          </p>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllFiltered}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-900/30 hover:bg-emerald-900/50 rounded-lg border border-emerald-800/60 transition-colors cursor-pointer"
              title="Copy all matching rows to paste into Excel"
            >
              <CopyCheck className="w-3.5 h-3.5" />
              Copy Grid
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Download results as a CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {/* Actual Data Table Grid Container */}
      {rows.length === 0 ? (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-zinc-800/40 text-zinc-500 rounded-full mb-3">
            <ChevronLeft className="w-6 h-6 rotate-45" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">No search records match</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, toggling the case sensitivity option, or resetting column restriction filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full max-h-[550px]">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-zinc-800/30 border-b border-zinc-800 select-none">
                {/* Action header */}
                <th className="p-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 w-12 text-center border-r border-zinc-800">
                  Copy Row
                </th>
                {headers.map((header, idx) => {
                  if (hiddenColumns.includes(idx)) return null;
                  return (
                    <th
                      key={`th-${idx}`}
                      className="p-3 text-[11px] font-bold uppercase tracking-wider text-zinc-300 font-sans border-r border-zinc-800 last:border-r-0"
                    >
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paginatedRows.map((row, rowIdx) => {
                const actualIndex = startIndex + rowIdx + 1;
                return (
                  <tr
                    key={`tr-${rowIdx}`}
                    className="hover:bg-zinc-800/20 group transition-colors"
                  >
                    {/* Copy row trigger */}
                    <td className="p-2.5 text-center border-r border-zinc-800 align-middle">
                      <button
                        onClick={(e) => handleCopyRow(row, e)}
                        className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-md transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Copy entire row to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {row.map((cell, colIdx) => {
                      if (hiddenColumns.includes(colIdx)) return null;
                      return (
                        <td
                          key={`td-${rowIdx}-${colIdx}`}
                          onClick={(e) => handleCellClick(cell, e)}
                          className="p-3 text-xs font-mono border-r border-zinc-800 last:border-r-0 relative hover:bg-emerald-900/20 cursor-pointer group/cell"
                          title="Click to copy cell value"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate max-w-[320px] select-all">
                              {highlightCell(cell, searchQuery)}
                            </span>
                            <span className="opacity-0 group-hover/cell:opacity-100 text-[10px] text-emerald-600 font-sans font-medium flex items-center gap-0.5 shrink-0 select-none transition-opacity bg-white/90 px-1 rounded shadow-xs border border-slate-200">
                              Click to copy
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-zinc-800 text-xs bg-zinc-900/30 select-none">
          <div className="text-zinc-400">
            Showing <span className="font-semibold text-zinc-200">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-zinc-200">{endIndex}</span> of{" "}
            <span className="font-semibold text-zinc-200">{rows.length}</span> filtered results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={displayPage === 1}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/60 disabled:opacity-40 disabled:hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={displayPage === 1}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/60 disabled:opacity-40 disabled:hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-zinc-300">
              Page {displayPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={displayPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/60 disabled:opacity-40 disabled:hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={displayPage === totalPages}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/60 disabled:opacity-40 disabled:hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Clipboard Animations (CopyToasts) */}
      <AnimatePresence>
        {copyToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.8 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: -48 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: toast.x - 40,
              top: toast.y - 12,
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-zinc-800"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[120px]">Copied!</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
