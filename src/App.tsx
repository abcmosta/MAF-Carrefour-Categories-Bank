import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  Search, Check, Columns3, Maximize2, Minimize2,
  PanelLeftClose, PanelLeftOpen, RotateCcw, Filter, AlertTriangle,
} from "lucide-react";
import categoriesData from "./mkpCategories.json";

type Category = {
  path: string; productType: string; vertical: string;
  l1: string; l2: string; l3: string; l4: string;
  l1_ar?: string; l2_ar?: string; l3_ar?: string; l4_ar?: string;
  hybris?: string; unmatched?: boolean;
};
const CATEGORIES = categoriesData as unknown as Category[];

type ColId = "productType" | "l1" | "l2" | "l3" | "l4" | "path" | "hybris";
interface ColDef { id: ColId; label: string; width: number; mono?: boolean; }
const DEFAULT_COLUMNS: ColDef[] = [
  { id: "productType", label: "Product Type", width: 240 },
  { id: "l1", label: "L1 · Department", width: 175 },
  { id: "l2", label: "L2 · Section", width: 175 },
  { id: "l3", label: "L3 · Family", width: 185 },
  { id: "l4", label: "L4 · Sub-family", width: 175 },
  { id: "path", label: "Mirakl Path", width: 340, mono: true },
  { id: "hybris", label: "Hybris Class", width: 150 },
];

type Density = "compact" | "comfortable" | "spacious";
const ROW_H: Record<Density, number> = { compact: 30, comfortable: 38, spacious: 48 };

interface LayoutState { sidebarOpen: boolean; density: Density; hidden: ColId[]; widths: Partial<Record<ColId, number>>; }
const LS_KEY = "mkp-workspace-layout-v1";
function loadLayout(): LayoutState {
  const fallback: LayoutState = { sidebarOpen: true, density: "compact", hidden: [], widths: {} };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...fallback, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return fallback;
}

export default function App() {
  const [layout, setLayout] = useState<LayoutState>(loadLayout);
  const [query, setQuery] = useState("");
  const [selectedL1, setSelectedL1] = useState<Set<string>>(new Set());
  const [fullscreen, setFullscreen] = useState(false);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(600);

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(layout)); } catch { /* ignore */ } }, [layout]);

  const departments = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of CATEGORIES) if (c.l1) m.set(c.l1, (m.get(c.l1) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORIES.filter((c) => {
      if (selectedL1.size && !selectedL1.has(c.l1)) return false;
      if (!q) return true;
      return `${c.productType} ${c.l1} ${c.l2} ${c.l3} ${c.l4} ${c.path}`.toLowerCase().includes(q);
    });
  }, [query, selectedL1]);

  const columns = useMemo(
    () => DEFAULT_COLUMNS.filter((c) => !layout.hidden.includes(c.id)).map((c) => ({ ...c, width: layout.widths[c.id] ?? c.width })),
    [layout.hidden, layout.widths],
  );
  const rowH = ROW_H[layout.density];
  const totalWidth = columns.reduce((s, c) => s + c.width, 0);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setViewportH(el.clientHeight));
    ro.observe(el); setViewportH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const total = rows.length;
  const overscan = 10;
  const start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + viewportH) / rowH) + overscan);
  const visible = rows.slice(start, end);

  const copy = useCallback((text: string) => {
    navigator.clipboard?.writeText(text);
    setToast(text.length > 34 ? `Copied: ${text.slice(0, 34)}…` : `Copied: ${text}`);
    window.setTimeout(() => setToast(null), 1400);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = (e.target as HTMLElement)?.tagName === "INPUT";
      if (e.key === "/" && !inInput) { e.preventDefault(); searchRef.current?.focus(); }
      else if (e.key === "Escape") { setQuery(""); setColMenuOpen(false); }
      else if ((e.key === "f" || e.key === "F") && !inInput) setFullscreen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startResize = (id: ColId, e: ReactMouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = layout.widths[id] ?? DEFAULT_COLUMNS.find((c) => c.id === id)!.width;
    const move = (ev: MouseEvent) => setLayout((l) => ({ ...l, widths: { ...l.widths, [id]: Math.max(90, startW + ev.clientX - startX) } }));
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const toggleDept = (name: string) => setSelectedL1((s) => { const n = new Set(s); if (n.has(name)) n.delete(name); else n.add(name); return n; });
  const toggleCol = (id: ColId) => setLayout((l) => ({ ...l, hidden: l.hidden.includes(id) ? l.hidden.filter((h) => h !== id) : [...l.hidden, id] }));

  return (
    <div className="h-dvh w-full flex flex-col bg-[#fafafa] text-zinc-900 font-sans overflow-hidden">
      <header className="flex items-center gap-2.5 h-12 px-3 border-b border-slate-200 bg-white shrink-0">
        <span className="bg-[#e01a22] text-white px-2 py-0.5 rounded text-[10px] font-extrabold tracking-widest shrink-0">CARREFOUR</span>
        <span className="text-sm font-bold text-zinc-800 hidden lg:block shrink-0">Categories Bank</span>
        <div className="relative flex-1 max-w-2xl">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product types, paths, levels…   ( / )"
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-100 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
        </div>
        <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap hidden sm:block">{total.toLocaleString()} / {CATEGORIES.length.toLocaleString()}</span>
        <div className="hidden md:flex items-center rounded-lg ring-1 ring-slate-200 overflow-hidden text-xs shrink-0">
          {(["compact", "comfortable", "spacious"] as Density[]).map((d) => (
            <button key={d} onClick={() => setLayout((l) => ({ ...l, density: d }))}
              className={`px-2 py-1 capitalize transition-colors ${layout.density === d ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>{d}</button>
          ))}
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setColMenuOpen((v) => !v)} className="flex items-center gap-1 h-8 px-2.5 rounded-lg ring-1 ring-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Columns3 className="w-4 h-4" /><span className="hidden sm:inline">Columns</span>
          </button>
          {colMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setColMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg bg-white shadow-xl ring-1 ring-slate-200 p-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Customize columns</div>
                {DEFAULT_COLUMNS.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm text-slate-700">
                    <input type="checkbox" checked={!layout.hidden.includes(c.id)} onChange={() => toggleCol(c.id)} />
                    {c.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        <button onClick={() => setLayout((l) => ({ ...l, sidebarOpen: !l.sidebarOpen }))} title="Toggle filters" className="h-8 px-2 rounded-lg ring-1 ring-slate-200 bg-white text-slate-600 hover:bg-slate-50 shrink-0">
          {layout.sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
        <button onClick={() => setFullscreen((v) => !v)} title="Full-screen table (f)" className="h-8 px-2 rounded-lg ring-1 ring-slate-200 bg-white text-slate-600 hover:bg-slate-50 shrink-0">
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {layout.sidebarOpen && !fullscreen && (
          <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5"><Filter className="w-3.5 h-3.5" />Departments</span>
              {selectedL1.size > 0 && <button onClick={() => setSelectedL1(new Set())} className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"><RotateCcw className="w-3 h-3" />Clear</button>}
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              {departments.map(([name, count]) => {
                const on = selectedL1.has(name);
                return (
                  <button key={name} onClick={() => toggleDept(name)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left text-[13px] ${on ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50"}`}>
                    <span className="truncate flex items-center gap-1.5 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${on ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>{on && <Check className="w-2.5 h-2.5 text-white" />}</span>
                      <span className="truncate">{name}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 flex flex-col bg-white">
          <div ref={scrollRef} onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)} className="flex-1 overflow-auto">
            <div style={{ width: totalWidth, minWidth: "100%" }}>
              <div className="flex sticky top-0 z-20 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500 select-none">
                {columns.map((c, i) => (
                  <div key={c.id} style={{ width: c.width, height: 36 }} className={`relative px-3 flex items-center shrink-0 ${i === 0 ? "sticky left-0 z-30 bg-slate-50 border-r border-slate-200" : ""}`}>
                    <span className="truncate">{c.label}</span>
                    <span onMouseDown={(e) => startResize(c.id, e)} className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/50" />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ height: start * rowH }} />
                {visible.map((row, idx) => {
                  const i = start + idx;
                  return (
                    <div key={i} style={{ height: rowH }} className={`flex text-[13px] border-b border-slate-100 group ${row.unmatched ? "bg-amber-50/60" : "hover:bg-blue-50/40"}`}>
                      {columns.map((c, ci) => {
                        const val = String((row as Record<string, unknown>)[c.id] ?? "");
                        return (
                          <div key={c.id} style={{ width: c.width }} onClick={() => val && copy(val)} title={val}
                            className={`px-3 flex items-center shrink-0 cursor-pointer overflow-hidden ${ci === 0 ? "sticky left-0 z-10 bg-white group-hover:bg-blue-50/40 border-r border-slate-200 font-medium" : ""} ${c.mono ? "font-mono text-[12px] text-slate-500" : ""}`}>
                            {ci === 0 && row.unmatched && <AlertTriangle className="w-3 h-3 text-amber-500 mr-1 shrink-0" />}
                            <span className="truncate">{val || <span className="text-slate-300">—</span>}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <div style={{ height: Math.max(0, (total - end) * rowH) }} />
              </div>
              {total === 0 && <div className="p-12 text-center text-slate-400 text-sm">No categories match your search or filters.</div>}
            </div>
          </div>
          <footer className="h-7 shrink-0 border-t border-slate-200 bg-white px-3 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="tabular-nums font-medium text-slate-600">{total.toLocaleString()} rows</span>
            <span className="text-slate-300">·</span><span>{columns.length} cols</span>
            <span className="text-slate-300">·</span><span className="capitalize">{layout.density}</span>
            <span className="ml-auto hidden md:block text-slate-400">Click any cell to copy · <kbd className="px-1 rounded bg-slate-100 font-mono">/</kbd> search · <kbd className="px-1 rounded bg-slate-100 font-mono">f</kbd> full-screen</span>
          </footer>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
          <Check className="w-3.5 h-3.5 text-emerald-400" />{toast}
        </div>
      )}
    </div>
  );
}
