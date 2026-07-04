import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Copy,
  Check,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  X,
  SlidersHorizontal,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sun,
  Moon,
  Target,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import SearchHeader from "./components/SearchHeader";
import { ExcelData, SearchOptions, CopyToast } from "./types";

// Import pre-mapped and compiled datasets
import enrichedNewCategories from "./enrichedNewCategories.json";
import mappedLegacy from "./mappedLegacy.json";
import fullLegacyRaw from "./fullLegacyRaw.json";

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"new_dph" | "legacy_mapping" | "full_catalog">("full_catalog");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [typedQuery, setTypedQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState("all");
  
  // Filtering and parameters
  const [selectedVertical, setSelectedVertical] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showControls, setShowControls] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Column visibility management
  const [hiddenColumnsLegacy, setHiddenColumnsLegacy] = useState<number[]>([]);
  const [hiddenColumnsFull, setHiddenColumnsFull] = useState<number[]>([]);

  // Clipboard Toasts
  const [copyToasts, setCopyToasts] = useState<CopyToast[]>([]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("carrefour-marketplace-theme");
    return saved === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("carrefour-marketplace-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("carrefour-marketplace-theme", "light");
    }
  }, [isDarkMode]);

  // Reset pagination when query, tab, or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, selectedVertical, selectedStatus, caseSensitive, exactMatch, searchColumn]);

  // Handle cell/string clicking to copy
  const triggerCopy = (text: string, e: React.MouseEvent, label?: string) => {
    navigator.clipboard.writeText(text);
    
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: CopyToast = {
      id,
      text: label || (text.length > 22 ? `${text.slice(0, 22)}...` : text),
      x: e.clientX,
      y: e.clientY
    };
    
    setCopyToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setCopyToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  };

  // Pre-compiled list of D.P.H. verticals for quick filters
  const dphVerticals = ["All", "Perfumes & Fragrances", "Makeup", "Skincare", "Bath & Body", "Hair Care", "Personal Care Appliances"];
  
  // Legacy status options
  const legacyStatuses = ["All", "Deprecated & Replaced", "Consolidated", "Retired & Deprecated", "Active (Unchanged)"];

  // Helper to fetch search column target dropdown options
  const getSearchColumnOptions = () => {
    switch (activeTab) {
      case "new_dph":
        return [
          { value: "all", label: "🔍 All Fields" },
          { value: "path", label: "📁 Category Path" },
          { value: "productType", label: "🏷️ Product Type" },
          { value: "vertical", label: "⚡ Vertical" },
          { value: "description", label: "📝 Description" },
        ];
      case "legacy_mapping":
        return [
          { value: "all", label: "🔍 All Columns" },
          { value: "legacyPath", label: "⏳ Legacy Path" },
          { value: "status", label: "📌 Status" },
          { value: "replacementPath", label: "✨ Modern Path" },
          { value: "notes", label: "📓 Notes / Guide" },
        ];
      case "full_catalog":
      default:
        return [
          { value: "all", label: "🔍 All Columns" },
          { value: "path", label: "📁 Category Path" },
          { value: "productType", label: "🏷️ Product Type" },
          { value: "vertical", label: "⚡ Vertical" },
          { value: "levels", label: "🌳 Levels 1-4" },
          { value: "tags", label: "🏷️ Product Tags" },
        ];
    }
  };

  // Perform search in real-time with latency performance counter
  const searchResults = useMemo(() => {
    const start = performance.now();
    const query = searchQuery.trim();
    const normQuery = caseSensitive ? query : query.toLowerCase();

    let list: any[] = [];

    if (activeTab === "new_dph") {
      // Filter the 161 modernized D.P.H. categories
      list = enrichedNewCategories.filter((cat) => {
        // Vertical filter
        if (selectedVertical !== "All" && cat.vertical !== selectedVertical) {
          return false;
        }

        if (!query) return true;

        let fieldsToSearch: (string | undefined)[] = [];
        if (searchColumn === "all") {
          fieldsToSearch = [
            cat.path,
            cat.productType,
            cat.vertical,
            cat.l3,
            cat.l4,
            cat.productTypes,
            cat.description
          ];
        } else if (searchColumn === "path") {
          fieldsToSearch = [cat.path];
        } else if (searchColumn === "productType") {
          fieldsToSearch = [cat.productType];
        } else if (searchColumn === "vertical") {
          fieldsToSearch = [cat.vertical];
        } else if (searchColumn === "description") {
          fieldsToSearch = [cat.description];
        }

        const normalizedFields = fieldsToSearch.map(s => s ? (caseSensitive ? s : s.toLowerCase()) : "");

        return normalizedFields.some((field) => {
          if (exactMatch) {
            return field === normQuery;
          }
          return field.includes(normQuery);
        });
      });
    } else if (activeTab === "legacy_mapping") {
      // Filter legacy mappings
      list = mappedLegacy.filter((mapItem) => {
        // Vertical filter
        if (selectedVertical !== "All" && mapItem.legacyVertical !== selectedVertical && mapItem.replacementVertical !== selectedVertical) {
          return false;
        }
        
        // Status filter
        if (selectedStatus !== "All" && mapItem.status !== selectedStatus) {
          return false;
        }

        if (!query) return true;

        let fieldsToSearch: (string | undefined)[] = [];
        if (searchColumn === "all") {
          fieldsToSearch = [
            mapItem.legacyPath,
            mapItem.legacyVertical,
            mapItem.legacyL4,
            mapItem.status,
            mapItem.replacementPath,
            mapItem.replacementVertical,
            mapItem.notes
          ];
        } else if (searchColumn === "legacyPath") {
          fieldsToSearch = [mapItem.legacyPath];
        } else if (searchColumn === "status") {
          fieldsToSearch = [mapItem.status];
        } else if (searchColumn === "replacementPath") {
          fieldsToSearch = [mapItem.replacementPath];
        } else if (searchColumn === "notes") {
          fieldsToSearch = [mapItem.notes];
        }

        const normalizedFields = fieldsToSearch.map(s => s ? (caseSensitive ? s : s.toLowerCase()) : "");

        return normalizedFields.some((field) => {
          if (exactMatch) {
            return field === normQuery;
          }
          return field.includes(normQuery);
        });
      });
    } else {
      // Full Catalog (2,255 categories)
      list = fullLegacyRaw.filter((row) => {
        const [path, productType, vertical, l1, l2, l3, l4, productTypes] = row;

        if (selectedVertical !== "All" && vertical !== selectedVertical) {
          return false;
        }

        if (!query) return true;

        let fieldsToSearch: (string | undefined)[] = [];
        if (searchColumn === "all") {
          fieldsToSearch = [
            path,
            productType,
            vertical,
            l1,
            l2,
            l3,
            l4,
            productTypes
          ];
        } else if (searchColumn === "path") {
          fieldsToSearch = [path];
        } else if (searchColumn === "productType") {
          fieldsToSearch = [productType];
        } else if (searchColumn === "vertical") {
          fieldsToSearch = [vertical];
        } else if (searchColumn === "levels") {
          fieldsToSearch = [l1, l2, l3, l4];
        } else if (searchColumn === "tags") {
          fieldsToSearch = [productTypes];
        }

        const normalizedFields = fieldsToSearch.map(s => s ? (caseSensitive ? s : s.toLowerCase()) : "");

        return normalizedFields.some((field) => {
          if (exactMatch) {
            return field === normQuery;
          }
          return field.includes(normQuery);
        });
      });
    }

    const end = performance.now();
    return {
      items: list,
      duration: end - start
    };
  }, [activeTab, searchQuery, selectedVertical, selectedStatus, caseSensitive, exactMatch, searchColumn]);

  // Execute Search manually or when Enter is pressed
  const triggerSearch = () => {
    setSearchQuery(typedQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      triggerSearch();
    }
  };

  const clearSearch = () => {
    setTypedQuery("");
    setSearchQuery("");
  };

  // Paginated set
  const totalPages = Math.ceil(searchResults.items.length / itemsPerPage);
  const displayPage = Math.min(currentPage, totalPages || 1);
  const paginatedItems = searchResults.items.slice(
    (displayPage - 1) * itemsPerPage,
    displayPage * itemsPerPage
  );

  // Helper to highlight search matches
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const safeQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const flags = caseSensitive ? "g" : "gi";
    const regex = new RegExp(`(${safeQuery})`, flags);
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <mark key={idx} className="bg-amber-100 text-amber-950 font-semibold rounded-xs px-0.5 border-b border-amber-300">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // --- Column Visibility Toggles ---
  const toggleColumnVisibilityLegacy = (columnIndex: number) => {
    const isHidden = hiddenColumnsLegacy.includes(columnIndex);
    if (isHidden) {
      setHiddenColumnsLegacy(hiddenColumnsLegacy.filter(idx => idx !== columnIndex));
    } else {
      // Prevent hiding all columns
      if (hiddenColumnsLegacy.length >= 3) {
        alert("At least one column must remain visible.");
        return;
      }
      setHiddenColumnsLegacy([...hiddenColumnsLegacy, columnIndex]);
    }
  };

  const toggleColumnVisibilityFull = (columnIndex: number) => {
    const isHidden = hiddenColumnsFull.includes(columnIndex);
    if (isHidden) {
      setHiddenColumnsFull(hiddenColumnsFull.filter(idx => idx !== columnIndex));
    } else {
      // Prevent hiding all columns
      if (hiddenColumnsFull.length >= 4) {
        alert("At least one column must remain visible.");
        return;
      }
      setHiddenColumnsFull([...hiddenColumnsFull, columnIndex]);
    }
  };

  const showAllColumnsLegacy = () => {
    setHiddenColumnsLegacy([]);
  };

  const showAllColumnsFull = () => {
    setHiddenColumnsFull([]);
  };

  // --- Column and Table Dimension Resizing ---
  const [fullCatalogWidths, setFullCatalogWidths] = useState<number[]>([320, 200, 140, 220, 180]);
  const [legacyMappingWidths, setLegacyMappingWidths] = useState<number[]>([350, 180, 300, 220]);

  const [fullTableDimensions, setFullTableDimensions] = useState<{ height: number; width: string }>({
    height: 550,
    width: "100%",
  });
  const [legacyTableDimensions, setLegacyTableDimensions] = useState<{ height: number; width: string }>({
    height: 550,
    width: "100%",
  });

  const resetTableLayout = (isLegacy: boolean) => {
    if (isLegacy) {
      setLegacyMappingWidths([350, 180, 300, 220]);
      setLegacyTableDimensions({ height: 550, width: "100%" });
    } else {
      setFullCatalogWidths([320, 200, 140, 220, 180]);
      setFullTableDimensions({ height: 550, width: "100%" });
    }
  };

  const handleColumnResize = (index: number, isLegacy: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidths = isLegacy ? [...legacyMappingWidths] : [...fullCatalogWidths];
    const startWidth = startWidths[index];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(90, startWidth + deltaX); // Min column width 90px
      const updated = [...startWidths];
      updated[index] = newWidth;
      if (isLegacy) {
        setLegacyMappingWidths(updated);
      } else {
        setFullCatalogWidths(updated);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleTableResize = (isLegacy: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const containerId = isLegacy ? "legacy-table-scroll-container" : "full-table-scroll-container";
    const containerEl = document.getElementById(containerId);
    
    const startWidth = containerEl ? containerEl.clientWidth : 800;
    const startHeight = containerEl ? containerEl.clientHeight : 550;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newWidth = Math.max(400, startWidth + deltaX); // min width 400px
      const newHeight = Math.max(200, startHeight + deltaY); // min height 200px

      const dimensions = {
        height: newHeight,
        width: `${newWidth}px`,
      };

      if (isLegacy) {
        setLegacyTableDimensions(dimensions);
      } else {
        setFullTableDimensions(dimensions);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className={`min-h-screen pb-20 font-sans transition-colors duration-300 relative ${
      isDarkMode ? "bg-zinc-950 text-zinc-100 dark" : "bg-[#faf9f6] text-slate-800"
    }`} id="app-root-container">
      {/* Decorative ambient background glows for HeroUI dark mode branding */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none select-none z-0" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-[140px] pointer-events-none select-none z-0" />

      {/* HeroUI Premium Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-slate-200/60 dark:border-zinc-900/80 shadow-xs select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Brand Segment */}
            <div className="flex items-center gap-3">
              <span className="bg-[#e01a22] text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-widest shadow-sm">
                CARREFOUR
              </span>
              <div className="hidden md:flex flex-col border-l border-slate-200 dark:border-zinc-800 pl-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">MAF Carrefour Categories Bank</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">@mosabdelaziz</span>
              </div>
            </div>

            {/* Portal Meta Indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/80 rounded-full text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                <span>Cosmetics D.P.H. Workstation v2.4</span>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/40 dark:border-zinc-800/50 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 active:scale-95 shadow-sm"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
                aria-label="Toggle Theme Mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {/* Dynamic Header Component */}
        <SearchHeader />

        {/* Dashboard Stat Counter Cards (HeroUI Bento Grid style with hover scale effects) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" id="dashboard-statistics-grid">
          {/* Card 1 */}
          <div className="bg-[#fafafa] dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">New D.P.H. Categories</p>
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 mt-2 tracking-tight">161</h3>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></span>
              <span>Fully Redesigned Channel</span>
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fafafa] dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Total Database Size</p>
              <div className="p-2 bg-slate-500/10 text-slate-600 dark:text-zinc-300 rounded-xl group-hover:bg-slate-500/20 transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 mt-2 tracking-tight">2,255</h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold mt-2">
              Historical catalog paths loaded
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fafafa] dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Merged & Streamlined</p>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0050a4] dark:text-blue-400 mt-2 tracking-tight">106</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Paths merged & mapped</span>
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#fafafa] dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Retired & Replaced</p>
              <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl group-hover:bg-red-500/20 transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#e01a22] dark:text-red-400 mt-2 tracking-tight">55</h3>
            <p className="text-[10px] text-amber-600 dark:text-amber-450 font-semibold mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Sellers action requested</span>
            </p>
          </div>
        </div>

        {/* Central Commanding Command-style Search Dock */}
        <div className="bg-[#fafafa]/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-md p-6 md:p-8 relative overflow-hidden mb-6" id="central-search-card">
          <div className="absolute top-[-20%] right-[-10%] opacity-5 dark:opacity-10 pointer-events-none select-none z-0">
            <Search className="w-56 h-56 text-blue-600 dark:text-cyan-400" />
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/15 dark:to-cyan-500/15 rounded-full text-xs font-bold text-blue-800 dark:text-blue-300 select-none border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>Real-Time Index Search Workstation</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
              {activeTab === "new_dph" ? "Search Beauty D.P.H. Catalog" : activeTab === "legacy_mapping" ? "Translate Legacy Category Records" : "Search All Carrefour Categories"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Query 2,255 marketplace database rows. Access sub-verticals, copy paths, or find mapping guides instantly. Try keywords like <code className="bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono text-xs">lipstick</code> or <code className="bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono text-xs">eau de parfum</code>.
            </p>

            {/* Premium Giant Input Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "new_dph"
                      ? "Search inside 161 modernized beauty categories..."
                      : activeTab === "legacy_mapping"
                      ? "Enter historical path, category keyword to map..."
                      : "Search the complete 2,255 category database records..."
                  }
                  value={typedQuery}
                  onChange={(e) => {
                    setTypedQuery(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-11 pr-10 py-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-[#fafafa] dark:focus:bg-zinc-900 text-sm sm:text-base font-semibold rounded-2xl transition-all outline-hidden text-slate-900 dark:text-zinc-100 shadow-inner-sm"
                />
                {typedQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dynamic target search column select dropdown */}
              <div className="relative shrink-0 flex items-stretch">
                <select
                  value={searchColumn}
                  onChange={(e) => setSearchColumn(e.target.value)}
                  className="w-full sm:w-auto px-4 py-4 bg-[#3e5feb] border border-slate-200 dark:border-zinc-700/80 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-bold rounded-2xl transition-all outline-hidden text-white dark:text-white shadow-3xs cursor-pointer hover:bg-[#2d4ecf] min-w-[150px]"
                  title="Choose which column/field to search"
                >
                  {getSearchColumnOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="trigger-search-btn"
                onClick={triggerSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-[#0050a4] hover:from-blue-700 hover:to-blue-900 dark:from-blue-500 dark:to-indigo-600 dark:hover:from-blue-600 dark:hover:to-indigo-700 text-white font-bold text-sm rounded-2xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Search</span>
              </button>
            </div>

            {/* Performance status & quick preferences toggles */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-mono text-slate-400 dark:text-zinc-500 pt-2 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span>Query Time: <strong className="text-slate-700 dark:text-zinc-300 font-bold">{searchResults.duration.toFixed(2)} ms</strong></span>
              </div>
              <span className="text-slate-200 dark:text-zinc-800 hidden sm:inline">•</span>
              <div>
                <span>Records Filtered: <strong className="text-blue-600 dark:text-blue-400 font-bold">{searchResults.items.length}</strong></span>
              </div>
              <span className="text-slate-200 dark:text-zinc-800 hidden sm:inline">•</span>
              <button
                onClick={() => setShowControls(!showControls)}
                className={`flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 font-bold font-sans cursor-pointer transition-colors ${showControls ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400'}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showControls ? "Hide Search Preferences" : "Configure Parameters"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Preferences Section */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 mb-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3.5">Matching & Extraction Parameters</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-950/20 hover:bg-slate-100/50 dark:hover:bg-zinc-850/40 rounded-xl cursor-pointer select-none group border border-slate-100 dark:border-zinc-800/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={() => setCaseSensitive(!caseSensitive)}
                      className="mt-1 rounded-md border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-500/20 cursor-pointer w-4 h-4 bg-white dark:bg-zinc-800"
                    />
                    <div className="text-xs sm:text-sm">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Case-Sensitive Indexing</span>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Force query letters to align exactly (e.g. 'DPH' vs 'dph')</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-zinc-950/20 hover:bg-slate-100/50 dark:hover:bg-zinc-850/40 rounded-xl cursor-pointer select-none group border border-slate-100 dark:border-zinc-800/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={exactMatch}
                      onChange={() => setExactMatch(!exactMatch)}
                      className="mt-1 rounded-md border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-500/20 cursor-pointer w-4 h-4 bg-white dark:bg-zinc-800"
                    />
                    <div className="text-xs sm:text-sm">
                      <span className="font-bold text-slate-700 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Exact Cell Equivalence</span>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Cell values must match query string entirely with no sub-string results</p>
                    </div>
                  </label>

                  {/* Column targeting within search preferences */}
                  <div className="flex flex-col justify-between p-3 bg-slate-50 dark:bg-zinc-950/20 rounded-xl border border-slate-100 dark:border-zinc-800/40 transition-colors">
                    <div className="text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-bold text-slate-700 dark:text-zinc-200">Search Column Target</span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-2">Restrict query scanning to a single designated column</p>
                    <select
                      value={searchColumn}
                      onChange={(e) => setSearchColumn(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-750 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
                    >
                      {getSearchColumnOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Column Visibility Controls - Tab Specific */}
        {activeTab === "legacy_mapping" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Column Visibility</p>
              </div>
              {hiddenColumnsLegacy.length > 0 && (
                <button
                  onClick={showAllColumnsLegacy}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { idx: 0, label: "Legacy Path" },
                { idx: 1, label: "Status" },
                { idx: 2, label: "Modern Path" },
                { idx: 3, label: "Notes" }
              ].map(({ idx, label }) => {
                const isHidden = hiddenColumnsLegacy.includes(idx);
                return (
                  <button
                    key={`legacy-col-${idx}`}
                    onClick={() => toggleColumnVisibilityLegacy(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isHidden
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 line-through opacity-60"
                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50"
                    }`}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "full_catalog" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-3.5 pb-3.5 border-b border-slate-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Column Visibility</p>
              </div>
              {hiddenColumnsFull.length > 0 && (
                <button
                  onClick={showAllColumnsFull}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
                >
                  Show All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { idx: 0, label: "Category Path" },
                { idx: 1, label: "Product Type" },
                { idx: 2, label: "Vertical" },
                { idx: 3, label: "Levels" },
                { idx: 4, label: "Tags" }
              ].map(({ idx, label }) => {
                const isHidden = hiddenColumnsFull.includes(idx);
                return (
                  <button
                    key={`full-col-${idx}`}
                    onClick={() => toggleColumnVisibilityFull(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isHidden
                        ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 line-through opacity-60"
                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50"
                    }`}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Selection Row (Sliding Pill Segmented Controller - HeroUI v3 specification) */}
        <div className="bg-slate-100/90 dark:bg-zinc-900/60 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1 mb-6 select-none overflow-x-auto scrollbar-none shadow-inner-xs border border-slate-200/50 dark:border-zinc-800/40" id="main-navigation-tabs">
          <button
            onClick={() => {
              setActiveTab("full_catalog");
              setSelectedStatus("All");
              setSelectedVertical("All");
              setSearchColumn("all");
            }}
            className={`relative flex-1 px-5 py-3 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap rounded-xl flex items-center justify-center gap-2.5 outline-hidden ${
              activeTab === "full_catalog"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            {activeTab === "full_catalog" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200/40 dark:border-zinc-700/50 z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <FileSpreadsheet className={`w-4 h-4 relative z-10 shrink-0 ${activeTab === "full_catalog" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-zinc-500"}`} />
            <span className="relative z-10">📦 Full Database (2,255)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("new_dph");
              setSelectedStatus("All");
              setSearchColumn("all");
            }}
            className={`relative flex-1 px-5 py-3 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap rounded-xl flex items-center justify-center gap-2.5 outline-hidden ${
              activeTab === "new_dph"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            {activeTab === "new_dph" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200/40 dark:border-zinc-700/50 z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <CheckCircle2 className={`w-4 h-4 relative z-10 shrink-0 ${activeTab === "new_dph" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-zinc-500"}`} />
            <span className="relative z-10">🆕 Modern Cosmetics (161)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("legacy_mapping");
              setSelectedVertical("All");
              setSearchColumn("all");
            }}
            className={`relative flex-1 px-5 py-3 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap rounded-xl flex items-center justify-center gap-2.5 outline-hidden ${
              activeTab === "legacy_mapping"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
          >
            {activeTab === "legacy_mapping" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200/40 dark:border-zinc-700/50 z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <ArrowRightLeft className={`w-4 h-4 relative z-10 shrink-0 ${activeTab === "legacy_mapping" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-zinc-500"}`} />
            <span className="relative z-10">🔄 Legacy Redirects ({mappedLegacy.filter(m => m.status !== 'Active (Unchanged)').length})</span>
          </button>
        </div>

        {/* Multi-tier Filtering Bar (Sleek Pills) */}
        <div className="bg-slate-100/70 dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl p-4.5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
          {/* Quick filter by vertical */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Vertical:</span>
            {activeTab === "new_dph" ? (
              <div className="flex flex-wrap gap-1.5">
                {dphVerticals.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVertical(v)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                      selectedVertical === v
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500 shadow-xs"
                        : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200/80 dark:border-zinc-800"
                    }`}
                  >
                    {v === "All" ? "All Beauty" : v}
                  </button>
                ))}
              </div>
            ) : activeTab === "legacy_mapping" ? (
              <div className="flex flex-wrap gap-1.5">
                {["All", "Makeup", "Skincare", "Bath & Body", "Hair Care", "Perfumes & Fragrances"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVertical(v)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                      selectedVertical === v
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500 shadow-xs"
                        : "bg-[#fafafa] dark:bg-zinc-800 text-slate-600 dark:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200/80 dark:border-zinc-800"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedVertical}
                  onChange={(e) => setSelectedVertical(e.target.value)}
                  className="bg-white dark:bg-zinc-800 text-xs font-bold text-slate-755 dark:text-zinc-250 px-3 py-2 rounded-xl border border-slate-250 dark:border-zinc-750 outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Verticals (Full Catalog)</option>
                  <option value="DIY & Hardware">DIY & Hardware</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Baby & Kids">Baby & Kids</option>
                  <option value="Food & Grocery">Food & Grocery</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Perfumes & Fragrances">Perfumes & Fragrances</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Toys">Toys</option>
                  <option value="Home Appliances">Home Appliances</option>
                </select>
              </div>
            )}
          </div>

          {/* Legacy Status Filtering (Only on Legacy Mappings tab) */}
          {activeTab === "legacy_mapping" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Status:</span>
              <div className="flex flex-wrap gap-1.5">
                {legacyStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
                      selectedStatus === st
                        ? "bg-blue-600 dark:bg-zinc-200 text-white dark:text-zinc-900 border-blue-600 dark:border-zinc-200 shadow-xs"
                        : "bg-[#fafafa] dark:bg-zinc-800 text-slate-650 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200/80 dark:border-zinc-800"
                    }`}
                  >
                    {st === "All" ? "All Statuses" : st}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono self-end md:self-center">
            Filtered: <strong className="text-slate-800 dark:text-zinc-200 font-extrabold">{searchResults.items.length}</strong> records
          </div>
        </div>

        {/* TAB CONTENT 1: NEW DPH CATEGORIES VIEW */}
        {activeTab === "new_dph" && (
          <div className="space-y-4" id="new-dph-categories-panel">
            {paginatedItems.length === 0 ? (
              <div className="text-center py-16 bg-[#fafafa] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No matching modernized D.P.H. categories</p>
                <p className="text-xs text-slate-400 mt-1">Try clarifying your query keywords or changing the vertical filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paginatedItems.map((cat, idx) => {
                  return (
                    <motion.div
                      key={`cat-card-${idx}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#fafafa] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-all overflow-hidden flex flex-col md:flex-row"
                    >
                      {/* Left Block: Path hierarchy tree */}
                      <div className="p-5 md:w-2/5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 flex flex-col justify-between bg-slate-50/50 dark:bg-zinc-900/40">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200/50 dark:border-blue-900/30">
                              {cat.vertical}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">L4: {cat.l4}</span>
                          </div>
 
                          <div className="space-y-1 mt-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
                              <span className="truncate">{cat.l1}</span>
                              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-zinc-650" />
                              <span className="truncate">{cat.l2}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-650 dark:text-zinc-300 font-semibold">
                              <span className="truncate">{cat.l3}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                              <span className="text-blue-700 dark:text-blue-400 font-bold truncate">{cat.l4}</span>
                            </div>
                          </div>
                        </div>
 
                        {/* Category path value ready to copy */}
                        <div className="mt-5 pt-3 border-t border-slate-150 dark:border-zinc-800">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Catalog Path String</p>
                          <div
                            onClick={(e) => triggerCopy(cat.path, e, "Copied Path!")}
                            className="flex items-center justify-between gap-2 p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition-all rounded-lg text-xs font-mono text-slate-600 dark:text-zinc-300 cursor-pointer select-all group/path"
                          >
                            <span className="truncate max-w-[280px]" title={cat.path}>{highlightMatch(cat.path, (searchColumn === "all" || searchColumn === "path") ? searchQuery : "")}</span>
                            <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover/path:text-blue-600 dark:group-hover/path:text-blue-400 shrink-0" />
                          </div>
                        </div>
                      </div>
 
                      {/* Right Block: Seller details, Description, and Product mappings */}
                      <div className="p-5 md:w-3/5 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                            Seller Catalog Description
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                            {highlightMatch(cat.description, (searchColumn === "all" || searchColumn === "description") ? searchQuery : "")}
                          </p>
                        </div>
 
                        {/* Product Mapping hints */}
                        <div className="bg-slate-50 dark:bg-zinc-950/20 rounded-lg p-3.5 border border-slate-150 dark:border-zinc-800">
                          <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Mapped Seller Keyword Types</p>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.productTypes.split(",").map((pt: string, ptIdx: number) => {
                              const trimmed = pt.trim();
                              return (
                                <span
                                  key={ptIdx}
                                  onClick={(e) => triggerCopy(trimmed, e, `Copied "${trimmed}"!`)}
                                  className="px-2 py-1 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-zinc-300 hover:text-blue-700 dark:hover:text-blue-350 text-[11px] font-mono rounded-md border border-slate-200 dark:border-zinc-800 transition-all cursor-pointer flex items-center gap-1"
                                >
                                  {highlightMatch(trimmed, (searchColumn === "all" || searchColumn === "productType") ? searchQuery : "")}
                                  <Copy className="w-2.5 h-2.5 text-slate-300 dark:text-zinc-650" />
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 2: LEGACY MAPPING VIEWER */}
        {activeTab === "legacy_mapping" && (
          <div className="space-y-4 animate-in fade-in duration-200" id="legacy-mappings-panel">
            {paginatedItems.length === 0 ? (
              <div className="text-center py-20 bg-[#fafafa] dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl">
                <HelpCircle className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">No matching legacy records found</p>
                <p className="text-xs text-slate-400 mt-1">Try clarifying your query keywords or resetting your status filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Table Dimension Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fafafa]/90 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 p-3.5 rounded-2xl text-xs shadow-3xs">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span className="font-bold text-slate-700 dark:text-zinc-200">Table Settings:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Height slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Height:</span>
                      <input
                        type="range"
                        min="250"
                        max="900"
                        value={legacyTableDimensions.height}
                        onChange={(e) => setLegacyTableDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="w-24 h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                      />
                      <span className="font-mono font-semibold text-slate-600 dark:text-zinc-400 w-11 text-right">{legacyTableDimensions.height}px</span>
                    </div>
                    {/* Width slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Width:</span>
                      <input
                        type="range"
                        min="400"
                        max="1600"
                        value={legacyTableDimensions.width === "100%" ? 1000 : parseInt(legacyTableDimensions.width) || 1000}
                        disabled={legacyTableDimensions.width === "100%"}
                        onChange={(e) => setLegacyTableDimensions(prev => ({ ...prev, width: `${e.target.value}px` }))}
                        className={`w-24 h-1 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 ${legacyTableDimensions.width === "100%" ? "bg-slate-200/40 dark:bg-zinc-800/30 opacity-40 cursor-not-allowed" : "bg-slate-200 dark:bg-zinc-800"}`}
                      />
                      <button
                        onClick={() => setLegacyTableDimensions(prev => ({ ...prev, width: prev.width === "100%" ? "1000px" : "100%" }))}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${legacyTableDimensions.width === "100%" ? "bg-blue-50/70 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30" : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-250 dark:border-zinc-700"}`}
                      >
                        {legacyTableDimensions.width === "100%" ? "Fit Screen" : "Custom size"}
                      </button>
                    </div>
                    {/* Reset Button */}
                    <button
                      onClick={() => resetTableLayout(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-250 dark:border-zinc-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-3xs active:scale-95"
                      title="Reset Column Widths and Layout Size to default"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Table Outer Border Container with Resizable Drag Handle */}
                <div className="bg-[#fafafa]/90 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm relative overflow-hidden group/table-container">
                  {/* Resizable Scroll Wrapper */}
                  <div 
                    id="legacy-table-scroll-container" 
                    className="overflow-auto scrollbar-thin w-full"
                    style={{ 
                      maxHeight: `${legacyTableDimensions.height}px`,
                      width: legacyTableDimensions.width,
                      maxWidth: "100%"
                    }}
                  >
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-zinc-950/40 border-b border-slate-200/60 dark:border-zinc-900/80 text-xs font-bold text-slate-500 dark:text-zinc-400 select-none">
                          {/* Legacy Path Column */}
                          {!hiddenColumnsLegacy.includes(0) && (
                            <th 
                              className="p-4 relative group/header select-none"
                              style={{ width: `${legacyMappingWidths[0]}px` }}
                            >
                              <span className="truncate block pr-4" title="Legacy Category Path">Legacy Category Path (Click to Copy)</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(0, true, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Status Column */}
                          {!hiddenColumnsLegacy.includes(1) && (
                            <th 
                              className="p-4 relative group/header select-none"
                              style={{ width: `${legacyMappingWidths[1]}px` }}
                            >
                              <span className="truncate block pr-4" title="Status">Status</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(1, true, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Modern Path Column */}
                          {!hiddenColumnsLegacy.includes(2) && (
                            <th 
                              className="p-4 relative group/header select-none"
                              style={{ width: `${legacyMappingWidths[2]}px` }}
                            >
                              <span className="truncate block pr-4" title="Modern Replacement Path">Modern Replacement Path</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(2, true, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Notes Column */}
                          {!hiddenColumnsLegacy.includes(3) && (
                            <th 
                              className="p-4 relative group/header select-none"
                              style={{ width: `${legacyMappingWidths[3]}px` }}
                            >
                              <span className="truncate block pr-4" title="Migration Notes / Guide">Migration Notes / Guide</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(3, true, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-900/60 text-xs">
                        {paginatedItems.map((mapItem, idx) => {
                          const isRetired = mapItem.status === "Retired & Deprecated";
                          const isConsolidated = mapItem.status === "Consolidated";
                          const isReplaced = mapItem.status === "Deprecated & Replaced";
                          const isUnchanged = mapItem.status === "Active (Unchanged)";

                          return (
                            <tr key={`map-row-${idx}`} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                              {/* Legacy Path Cell */}
                              {!hiddenColumnsLegacy.includes(0) && (
                                <td className="p-4 font-mono text-slate-700 dark:text-zinc-300">
                                  <div
                                    onClick={(e) => triggerCopy(mapItem.legacyPath, e, "Copied Old Path!")}
                                    className="group flex items-center justify-between gap-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  >
                                    <span className="truncate font-medium block max-w-full" title={mapItem.legacyPath}>
                                      {highlightMatch(mapItem.legacyPath, (searchColumn === "all" || searchColumn === "legacyPath") ? searchQuery : "")}
                                    </span>
                                    <Copy className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-650 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                                  </div>
                                  <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans mt-1 truncate max-w-full">
                                    Legacy Vertical: <strong className="text-slate-500 dark:text-zinc-400 font-semibold">{mapItem.legacyVertical}</strong> • Level 4: {mapItem.legacyL4}
                                  </div>
                                </td>
                              )}

                              {/* Status Badge */}
                              {!hiddenColumnsLegacy.includes(1) && (
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                                    isRetired
                                      ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                      : isConsolidated
                                      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                                      : isReplaced
                                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                      : "bg-slate-500/10 text-slate-600 dark:text-zinc-300 border-slate-500/20"
                                  }`}>
                                    {mapItem.status}
                                  </span>
                                </td>
                              )}

                              {/* Modern Replacement Cell */}
                              {!hiddenColumnsLegacy.includes(2) && (
                                <td className="p-4 font-mono text-slate-700 dark:text-zinc-300">
                                  {mapItem.replacementPath === "N/A" ? (
                                    <span className="text-slate-400 dark:text-zinc-600 font-sans italic">No direct replacement</span>
                                  ) : (
                                    <div
                                      onClick={(e) => triggerCopy(mapItem.replacementPath, e, "Copied Replacement!")}
                                      className="group flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-zinc-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-[11px] border border-slate-100 dark:border-zinc-800/40"
                                    >
                                      <span className="truncate font-medium block max-w-full" title={mapItem.replacementPath}>
                                        {highlightMatch(mapItem.replacementPath, (searchColumn === "all" || searchColumn === "replacementPath") ? searchQuery : "")}
                                      </span>
                                      <Copy className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-650 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                                    </div>
                                  )}
                                </td>
                              )}

                              {/* Guidance / Notes */}
                              {!hiddenColumnsLegacy.includes(3) && (
                                <td className="p-4 text-slate-500 dark:text-zinc-400 font-sans leading-relaxed text-xs">
                                  <div className="truncate block max-w-full" title={mapItem.notes}>
                                    {highlightMatch(mapItem.notes, (searchColumn === "all" || searchColumn === "notes") ? searchQuery : "")}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Manual Dragging Corner Resize Handle (Height & Width Adjustment Desk) */}
                  <div
                    onMouseDown={(e) => handleTableResize(true, e)}
                    className="absolute bottom-2 right-2 p-1 bg-white/95 dark:bg-zinc-800/95 border border-slate-200 dark:border-zinc-700 rounded-md shadow-xs cursor-se-resize hover:bg-blue-50 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 z-30 transition-all select-none active:scale-95"
                    title="Drag to resize height and width of table container"
                  >
                    <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21H12M21 12H16M21 21V12" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 3: FULL DATABASE DIRECTORY VIEW */}
        {activeTab === "full_catalog" && (
          <div className="space-y-4 animate-in fade-in duration-200" id="full-catalog-panel">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-zinc-900 border border-blue-100/60 dark:border-blue-900/30 rounded-2xl p-4.5 flex gap-3 text-slate-750 dark:text-zinc-350 mb-2 shadow-xs">
              <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-slate-800 dark:text-zinc-100">Complete Marketplace Archive (Historical Listing)</p>
                <p className="mt-1 text-slate-500 dark:text-zinc-400">This directory lists the complete set of 2,255 categories including non-cosmetic items. Useful for legacy queries and general seller inventory mapping.</p>
              </div>
            </div>

            {paginatedItems.length === 0 ? (
              <div className="text-center py-20 bg-[#fafafa] dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl">
                <HelpCircle className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">No matching category paths found</p>
                <p className="text-xs text-slate-400 mt-1">Try checking for simple search terms or modifying filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Table Dimension Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fafafa]/90 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 p-3.5 rounded-2xl text-xs shadow-3xs">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span className="font-bold text-slate-700 dark:text-zinc-200">Table Settings:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Height slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Height:</span>
                      <input
                        type="range"
                        min="250"
                        max="900"
                        value={fullTableDimensions.height}
                        onChange={(e) => setFullTableDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                        className="w-24 h-1 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                      />
                      <span className="font-mono font-semibold text-slate-600 dark:text-zinc-400 w-11 text-right">{fullTableDimensions.height}px</span>
                    </div>
                    {/* Width slider */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Width:</span>
                      <input
                        type="range"
                        min="400"
                        max="1600"
                        value={fullTableDimensions.width === "100%" ? 1000 : parseInt(fullTableDimensions.width) || 1000}
                        disabled={fullTableDimensions.width === "100%"}
                        onChange={(e) => setFullTableDimensions(prev => ({ ...prev, width: `${e.target.value}px` }))}
                        className={`w-24 h-1 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 ${fullTableDimensions.width === "100%" ? "bg-slate-200/40 dark:bg-zinc-800/30 opacity-40 cursor-not-allowed" : "bg-slate-200 dark:bg-zinc-800"}`}
                      />
                      <button
                        onClick={() => setFullTableDimensions(prev => ({ ...prev, width: prev.width === "100%" ? "1000px" : "100%" }))}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${fullTableDimensions.width === "100%" ? "bg-blue-50/70 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30" : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-250 dark:border-zinc-700"}`}
                      >
                        {fullTableDimensions.width === "100%" ? "Fit Screen" : "Custom size"}
                      </button>
                    </div>
                    {/* Reset Button */}
                    <button
                      onClick={() => resetTableLayout(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-250 dark:border-zinc-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-3xs active:scale-95"
                      title="Reset Column Widths and Layout Size to default"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Table Outer Border Container with Resizable Drag Handle */}
                <div className="bg-[#fafafa]/95 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm relative overflow-hidden group/table-container">
                  {/* Resizable Scroll Wrapper */}
                  <div 
                    id="full-table-scroll-container" 
                    className="overflow-auto scrollbar-thin w-full"
                    style={{ 
                      maxHeight: `${fullTableDimensions.height}px`,
                      width: fullTableDimensions.width,
                      maxWidth: "100%"
                    }}
                  >
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-zinc-950/40 border-b border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-500 dark:text-zinc-400 select-none sticky top-0 backdrop-blur-xs z-20">
                          {/* Category Path Column */}
                          {!hiddenColumnsFull.includes(0) && (
                            <th 
                              className="p-3.5 border-r border-slate-100 dark:border-zinc-800/50 relative group/header select-none"
                              style={{ width: `${fullCatalogWidths[0]}px` }}
                            >
                              <span className="truncate block pr-4" title="Category Path">Category Path (Click to copy)</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(0, false, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Product Type Column */}
                          {!hiddenColumnsFull.includes(1) && (
                            <th 
                              className="p-3.5 border-r border-slate-100 dark:border-zinc-800/50 relative group/header select-none"
                              style={{ width: `${fullCatalogWidths[1]}px` }}
                            >
                              <span className="truncate block pr-4" title="Product Type">Product Type</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(1, false, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Vertical Column */}
                          {!hiddenColumnsFull.includes(2) && (
                            <th 
                              className="p-3.5 border-r border-slate-100 dark:border-zinc-800/50 relative group/header select-none"
                              style={{ width: `${fullCatalogWidths[2]}px` }}
                            >
                              <span className="truncate block pr-4" title="Vertical">Vertical</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(2, false, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Category Levels Column */}
                          {!hiddenColumnsFull.includes(3) && (
                            <th 
                              className="p-3.5 border-r border-slate-100 dark:border-zinc-800/50 relative group/header select-none"
                              style={{ width: `${fullCatalogWidths[3]}px` }}
                            >
                              <span className="truncate block pr-4" title="Category Levels (1-4)">Category Levels (1-4)</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(3, false, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                          
                          {/* Product Type Tags Column */}
                          {!hiddenColumnsFull.includes(4) && (
                            <th 
                              className="p-3.5 relative group/header select-none"
                              style={{ width: `${fullCatalogWidths[4]}px` }}
                            >
                              <span className="truncate block pr-4" title="Product Type Tags">Product Type Tags</span>
                              <div
                                onMouseDown={(e) => handleColumnResize(4, false, e)}
                                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 bg-slate-200/40 dark:bg-zinc-800/35 select-none z-30 transition-colors"
                                title="Drag to resize column"
                              />
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-900/60 text-xs">
                        {paginatedItems.map((item, idx) => {
                          const isArray = Array.isArray(item);
                          const path = isArray ? item[0] : item.legacyPath || item.path;
                          const productType = isArray ? item[1] : item.productType || item.legacyL4;
                          const vertical = isArray ? item[2] : item.vertical || item.legacyVertical;
                          const l1 = isArray ? item[3] : "";
                          const l2 = isArray ? item[4] : "";
                          const l3 = isArray ? item[5] : "";
                          const l4 = isArray ? item[6] : "";
                          const productTypesStr = isArray ? item[7] : "";

                          return (
                            <tr key={`full-row-${idx}`} className="hover:bg-slate-50/40 dark:hover:bg-zinc-800/30 transition-colors">
                              {/* Path */}
                              {!hiddenColumnsFull.includes(0) && (
                                <td className="p-3 font-mono border-r border-slate-100 dark:border-zinc-800/50 text-slate-700 dark:text-zinc-300">
                                  <div
                                    onClick={(e) => triggerCopy(path, e, "Copied Path!")}
                                    className="group flex items-center justify-between gap-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                  >
                                    <span className="truncate font-medium block max-w-full" title={path}>
                                      {highlightMatch(path, (searchColumn === "all" || searchColumn === "path") ? searchQuery : "")}
                                    </span>
                                    <Copy className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-650 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                                  </div>
                                </td>
                              )}

                              {/* Product Type */}
                              {!hiddenColumnsFull.includes(1) && (
                                <td className="p-3 border-r border-slate-100 dark:border-zinc-800/50 font-sans font-semibold text-slate-700 dark:text-zinc-300">
                                  <span
                                    onClick={(e) => triggerCopy(productType, e, `Copied "${productType}"!`)}
                                    className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 block truncate max-w-full"
                                    title={productType}
                                  >
                                    {highlightMatch(productType || "", (searchColumn === "all" || searchColumn === "productType") ? searchQuery : "")}
                                  </span>
                                </td>
                              )}

                              {/* Vertical */}
                              {!hiddenColumnsFull.includes(2) && (
                                <td className="p-3 border-r border-slate-100 dark:border-zinc-800/50 font-sans text-slate-500 dark:text-zinc-450">
                                  <div className="truncate max-w-full">
                                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-zinc-700">
                                      {vertical}
                                    </span>
                                  </div>
                                </td>
                              )}

                              {/* Category Levels */}
                              {!hiddenColumnsFull.includes(3) && (
                                <td className="p-3 border-r border-slate-100 dark:border-zinc-800/50 text-slate-400 dark:text-zinc-550 font-sans">
                                  <div className="truncate block max-w-full" title={`${l1} › ${l2} › ${l3} › ${l4}`}>
                                    {l1 && <span>{l1} › </span>}
                                    {l2 && <span>{l2} › </span>}
                                    {l3 && <span>{l3} › </span>}
                                    {l4 && <strong className="text-slate-755 dark:text-zinc-250 font-bold">{l4}</strong>}
                                  </div>
                                </td>
                              )}

                              {/* Tags */}
                              {!hiddenColumnsFull.includes(4) && (
                                <td className="p-3 text-slate-550 dark:text-zinc-400">
                                  <div className="truncate block max-w-full" title={productTypesStr}>
                                    {highlightMatch(productTypesStr || "", (searchColumn === "all" || searchColumn === "tags") ? searchQuery : "")}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Manual Dragging Corner Resize Handle (Height & Width Adjustment Desk) */}
                  <div
                    onMouseDown={(e) => handleTableResize(false, e)}
                    className="absolute bottom-2 right-2 p-1 bg-white/95 dark:bg-zinc-800/95 border border-slate-200 dark:border-zinc-700 rounded-md shadow-xs cursor-se-resize hover:bg-blue-50 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 z-30 transition-all select-none active:scale-95"
                    title="Drag to resize height and width of table container"
                  >
                    <svg className="w-3.5 h-3.5 stroke-current fill-none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21H12M21 12H16M21 21V12" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Pagination Bar (Premium Glassmorphic Footer) */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 mt-6 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl shadow-sm text-xs select-none">
            <div className="text-slate-500 dark:text-zinc-400 font-medium">
              Showing <span className="font-bold text-slate-700 dark:text-zinc-200">{(displayPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-bold text-slate-700 dark:text-zinc-200">{Math.min(displayPage * itemsPerPage, searchResults.items.length)}</span> of{" "}
              <span className="font-extrabold text-slate-900 dark:text-zinc-100">{searchResults.items.length}</span> matching records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={displayPage === 1}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 transition-colors cursor-pointer font-bold active:scale-95 shadow-2xs"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={displayPage === 1}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 transition-colors cursor-pointer font-bold active:scale-95 shadow-2xs"
              >
                Prev
              </button>

              <span className="px-3.5 py-2 font-bold text-blue-700 dark:text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/10">
                Page {displayPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={displayPage === totalPages}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 transition-colors cursor-pointer font-bold active:scale-95 shadow-2xs"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={displayPage === totalPages}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900 transition-colors cursor-pointer font-bold active:scale-95 shadow-2xs"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Copy Toasts Notification */}
      <AnimatePresence>
        {copyToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: -25, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, y: -45 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: toast.x - 55,
              top: toast.y - 12,
              zIndex: 9999,
              pointerEvents: "none"
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-slate-800 dark:text-zinc-100 text-xs font-bold rounded-xl shadow-lg border border-slate-250 dark:border-zinc-800/80"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[130px]">Copied: {toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
