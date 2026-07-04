# Phase 2A: SearchControls UI Integration (REVISED)
**Date:** July 4, 2026  
**Status:** Implementation Ready  
**Risk Level:** LOW — Adds UI without changing search logic

---

## Why Phase 2A Changed

After deeper analysis of App.tsx table rendering:

- **App.tsx tables** have evolved with custom features:
  - Column resizing with draggable separators
  - Sticky headers with backdrop blur
  - Specialized domain logic (legacy mapping, product types, verticals)
  - Custom styling and animations

- **SpreadsheetTable.tsx** is a more generic component:
  - Fixed column widths (no resizing)
  - Standard pagination
  - Good for new features, not retrofitting

**Conclusion:** Forcing SpreadsheetTable into existing App.tsx tables would remove valuable features and complicate refactoring.

**Better Approach:** Focus on SearchControls UI integration — adds **column visibility feature** (currently missing) without risking existing table logic.

---

## Phase 2A: SearchControls UI Integration

### Goal
Add column visibility toggles and improved search UI layout from SearchControls.tsx into App.tsx search section.

### Current State

App.tsx Search UI (Lines 640-695):
- ✅ Case-Sensitive toggle
- ✅ Exact Match toggle
- ✅ Search Column Target (dropdown)
- ❌ **NO column visibility toggles**

SearchControls.tsx Provides:
- ✅ Case-Sensitive toggle
- ✅ Exact Match toggle
- ✅ Multi-column search targeting
- ✅ **Column visibility UI** ← VALUE ADD
- ✅ Better organized grid layout

### Integration Strategy

**Option A: Hybrid Approach (RECOMMENDED)**
- Keep App.tsx search logic intact
- Extract and adapt SearchControls UI elements (column visibility only)
- Add `hiddenColumns` state to App.tsx
- Apply column visibility when rendering tables

**Effort:** Medium  
**Risk:** Low  
**Value:** High (adds missing feature)  

**Option B: Full SearchControls Component**
- Import SearchControls as separate component
- Connect to App.tsx state
- Requires multi-column search logic refactor

**Effort:** High  
**Risk:** Medium  
**Value:** High

---

## Phase 2A Implementation (Option A)

### Step 1: Add Hidden Columns State to App.tsx

**File:** `src/App.tsx`

Add to state section (after line 50):
```typescript
// Column visibility management
const [hiddenColumns, setHiddenColumns] = useState<number[]>([]);
```

### Step 2: Add Toggle Function

Add utility function:
```typescript
const toggleColumnVisibility = (columnIndex: number) => {
  const isHidden = hiddenColumns.includes(columnIndex);
  if (isHidden) {
    setHiddenColumns(hiddenColumns.filter(idx => idx !== columnIndex));
  } else {
    // Prevent hiding all columns
    if (hiddenColumns.length >= columnHeaders.length - 1) {
      alert("At least one column must remain visible.");
      return;
    }
    setHiddenColumns([...hiddenColumns, columnIndex]);
  }
};

const showAllColumns = () => {
  setHiddenColumns([]);
};
```

### Step 3: Add Column Visibility UI Section

**Insert after line 670** (after Exact Match toggle):

```typescript
{/* Column Visibility Controls */}
<div className="flex flex-col justify-between p-3 bg-slate-50 dark:bg-zinc-950/20 rounded-xl border border-slate-100 dark:border-zinc-800/40 transition-colors">
  <div className="flex items-center justify-between mb-2">
    <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
      <Eye className="w-4 h-4 text-slate-500" />
      Visible Columns
    </div>
    {hiddenColumns.length > 0 && (
      <button
        onClick={showAllColumns}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
      >
        Show All
      </button>
    )}
  </div>
  
  <div className="max-h-32 overflow-y-auto border border-slate-100 dark:border-zinc-800 rounded-lg p-2 bg-white dark:bg-zinc-950/40 space-y-1">
    {columnHeaders.map((header, idx) => {
      const isHidden = hiddenColumns.includes(idx);
      return (
        <button
          key={`col-vis-${idx}`}
          onClick={() => toggleColumnVisibility(idx)}
          className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
            isHidden
              ? "bg-slate-100/60 text-slate-400 line-through decoration-slate-300"
              : "hover:bg-slate-100 text-slate-700 font-medium"
          }`}
        >
          <span className="truncate pr-2">{header}</span>
          {isHidden ? (
            <EyeOff className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          ) : (
            <Eye className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          )}
        </button>
      );
    })}
  </div>
</div>
```

### Step 4: Update Table Rendering

Modify column headers and cells to filter by `hiddenColumns`:

**Legacy Table Headers Example:**
```typescript
{/* Legacy Path Header */}
{!hiddenColumns.includes(0) && (
  <th className="p-4 relative group/header select-none" style={{ width: `${legacyMappingWidths[0]}px` }}>
    <span className="truncate block pr-4">Legacy Category Path</span>
    ...
  </th>
)}

{/* Status Header */}
{!hiddenColumns.includes(1) && (
  <th className="p-4 relative group/header select-none" style={{ width: `${legacyMappingWidths[1]}px` }}>
    <span className="truncate block pr-4">Status</span>
    ...
  </th>
)}
```

**Apply same pattern to table cells (td elements)**

### Step 5: Import Required Icons

**File:** `src/App.tsx` (imports section)

Add:
```typescript
import { Eye, EyeOff } from "lucide-react";
```

---

## Files Modified in Phase 2A

1. **src/App.tsx**
   - Add `hiddenColumns` state
   - Add `toggleColumnVisibility()` function
   - Add `showAllColumns()` function
   - Add column visibility UI section
   - Update table rendering (legacy & full catalog)
   - Import Eye/EyeOff icons

2. **PHASE_2A_INTEGRATION.md** (this file)
   - Document implementation

---

## Implementation Checklist

- [ ] Add `hiddenColumns` state (line ~51)
- [ ] Add toggle functions
- [ ] Import Eye/EyeOff icons
- [ ] Add column visibility UI section after Exact Match toggle
- [ ] Update legacy table header rendering to filter by `hiddenColumns`
- [ ] Update legacy table cell rendering to filter by `hiddenColumns`
- [ ] Update full catalog table header rendering
- [ ] Update full catalog table cell rendering
- [ ] Test: Toggle column visibility
- [ ] Test: Verify pagination works with hidden columns
- [ ] Test: Verify copy functionality with hidden columns
- [ ] Commit changes

---

## Expected Outcome

After Phase 2A:

✅ **New Features:**
- Column visibility toggles (Eye/EyeOff icons)
- "Show All" button to restore hidden columns
- Hides specified columns from both tables

✅ **UI Improvements:**
- Better organized search controls section
- Added Eye/EyeOff visual indicators
- Responsive column toggle list

✅ **No Regressions:**
- Existing search logic unchanged
- Table functionality preserved
- Copy-to-clipboard works with visible columns
- Pagination unaffected

✅ **Code Quality:**
- Added 30-50 lines to App.tsx
- Follows existing patterns
- Reuses existing component styling

---

## Success Criteria

- ✅ Column visibility toggles render in search section
- ✅ Clicking eye icon hides/shows column
- ✅ "Show All" button restores all columns
- ✅ Hidden columns don't appear in either table
- ✅ All existing features still work
- ✅ No console errors
- ✅ Responsive on mobile/tablet

---

## Phase 2B Timeline (After Phase 2A Completes)

Once Phase 2A is complete:

1. **Full SearchControls Integration** (if desired)
   - Decide: Keep single-column search (current) vs multi-column search
   - Either refactor search logic or create SearchControls wrapper
   - Integrate remaining UI components

2. **SpreadsheetTable as Future Component**
   - Document as template for future "search results" display
   - Keep available for new features
   - Don't force into existing specialized tables

3. **App.tsx Refactoring (Lower Priority)**
   - Extract complex table logic to separate utility file
   - Consider creating table configuration layer
   - Improve maintainability incrementally

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Hidden column index mismatch | Low | Medium | Test both tables thoroughly |
| Performance with many hidden columns | Very Low | Low | Filter during render |
| Mobile responsiveness | Low | Low | Test on multiple screen sizes |
| Copy functionality breaks | Low | Medium | Verify copy includes visible only |

---

## Next Steps

1. ✅ Read and understand this plan
2. ⏳ Implement Phase 2A steps
3. ⏳ Test functionality
4. ⏳ Commit changes
5. ⏳ Document completion
6. ⏳ Plan Phase 2B

**Ready to proceed? Start with Step 1: Add hidden columns state.**

