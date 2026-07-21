import React, { useState } from "react";
import { FileSpreadsheet, ChevronDown, ChevronUp, Info, BookOpen, Layers, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SearchHeader() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div 
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md p-5 mb-6 transition-all relative overflow-hidden" 
      id="search-header-container"
    >
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 opacity-90" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        {/* Title Section */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0 border border-blue-500/20 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400 font-extrabold">
                MAF Carrefour Categories Bank
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold flex items-center gap-2 mt-1">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span>Active Redesign Catalog • D.P.H. Taxonomy Manager</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            id="toggle-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`group flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer border ${
              !isCollapsed 
                ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]" 
                : "bg-zinc-800/40 text-zinc-300 border-zinc-800 hover:bg-zinc-800/80"
            }`}
          >
            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
            <span>{isCollapsed ? "View System Guidelines" : "Hide System Guidelines"}</span>
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible content (animated smoothly) */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 20 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-150 dark:border-zinc-800/80 pt-5"
          >
            <div className="space-y-4 text-xs text-slate-600 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
                  MAF Carrefour Categories Bank Manual
                </h3>
              </div>
              <p className="leading-relaxed text-[13px] text-slate-500 dark:text-zinc-400">
                Welcome to the Carrefour taxonomy migration workstation. This interface provides seller-partners with instant read-only mapping directories to align historical catalogs with modern consolidated <strong className="text-slate-800 dark:text-zinc-100 font-semibold">D.P.H. (Drugs, Perfumery, & Hygiene)</strong> standards. Use the modules below to verify paths, copy raw system keys, or query retired codes.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/60 transition-all hover:shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2 font-bold text-slate-700 dark:text-zinc-200">
                    <span className="p-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">01</span>
                    <span>Consolidated Search</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Search 2,255 raw catalog records or 161 redesigned active channels. Type any key phrase like <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded text-blue-600 font-mono text-[10px]">hair</code> or <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded text-blue-600 font-mono text-[10px]">shampoo</code>.
                  </p>
                </div>

                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/60 transition-all hover:shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2 font-bold text-slate-700 dark:text-zinc-200">
                    <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">02</span>
                    <span>Instant Copy Action</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Simply click on any category path code block, seller product type cell, or tag. The system will copy the value to your clipboard instantly with visual notification.
                  </p>
                </div>

                <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/60 transition-all hover:shadow-xs">
                  <div className="flex items-center gap-1.5 mb-2 font-bold text-slate-700 dark:text-zinc-200">
                    <span className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs">03</span>
                    <span>Legacy Path Redirects</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    The <strong className="text-slate-800 dark:text-zinc-100 font-semibold">Legacy Mappings</strong> view highlights retired, replaced, or merged paths requiring direct seller item migration.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100/40 dark:border-blue-900/20 text-blue-800 dark:text-blue-300 text-[11px]">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Security Assurance: Read-Only workstation node. All database connections are statically cached for maximum millisecond responsiveness.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
