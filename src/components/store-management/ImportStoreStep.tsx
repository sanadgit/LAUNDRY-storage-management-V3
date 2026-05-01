import { Upload, FileSpreadsheet } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ImportPreviewRow = {
  number: string;
  store: string;
  row: number | null;
  column: number | null;
  customer: string;
  order: string;
  notes: string;
  errors: string[];
  sourceExcelRow?: number;
  sourceExcelColumn?: number;
  warning?: boolean;
  autoAssigned?: boolean;
};

export type ImportMatrixCellPreview = {
  value: string;
  kind: 'header-store' | 'header-column' | 'data' | 'empty';
  status: 'empty' | 'valid' | 'duplicate' | 'invalid' | 'header';
  tooltip?: string;
  errors?: string[];
};

export type ImportMatrixPreview = {
  rowCount: number;
  columnCount: number;
  cells: ImportMatrixCellPreview[][];
};

export type ImportMeta = {
  fileName: string;
  layoutType: 'matrix' | 'table';
  totalRows: number;
  totalCells?: number;
  filledCells?: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  conflictCount?: number;
  skippedCount?: number;
  notEnoughSlots: number;
  emptySlotsAvailable: number;
  expansionSummary?: Array<{
    store: string;
    oldRows: number;
    oldColumns: number;
    newRows: number;
    newColumns: number;
  }>;
  matrix?: ImportMatrixPreview;
};

export type ImportConflictStrategy = 'fill_empty_only' | 'replace_existing' | 'keep_existing' | 'append_duplicate';
export type ImportDuplicateStrategy = 'skip_duplicates' | 'allow_duplicates' | 'move_existing' | 'replace_existing_duplicate';
export type ImportUnknownStoreStrategy = 'auto_create' | 'skip_unknown' | 'map_to_selected';

export type ImportProgress = {
  phase: string;
  current: number;
  total: number;
  percent: number;
};

export type ImportResultSummary = {
  imported: number;
  skippedEmpty: number;
  skippedInvalid: number;
  skippedDuplicates: number;
  skippedConflicts: number;
  replaced: number;
  expandedStores: number;
  storesUpdated: string[];
  durationMs: number;
};

type ImportStoreStepProps = {
  locked: boolean;
  preview: ImportPreviewRow[] | null;
  meta: ImportMeta | null;
  busy: boolean;
  onPickFile: () => void;
  onCancel: () => void;
  onDownloadErrors: () => void;
  onImportValidOnly: () => void;
  onForceImport: () => void;
  onConfirmImport: () => void;
  conflictStrategy: ImportConflictStrategy;
  duplicateStrategy: ImportDuplicateStrategy;
  unknownStoreStrategy: ImportUnknownStoreStrategy;
  onConflictStrategyChange: (value: ImportConflictStrategy) => void;
  onDuplicateStrategyChange: (value: ImportDuplicateStrategy) => void;
  onUnknownStoreStrategyChange: (value: ImportUnknownStoreStrategy) => void;
  progress: ImportProgress | null;
  result: ImportResultSummary | null;
};

const toExcelCol = (index: number) => {
  let n = index + 1;
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};

export default function ImportStoreStep({
  locked,
  preview,
  meta,
  busy,
  onPickFile,
  onCancel,
  onDownloadErrors,
  onImportValidOnly,
  onForceImport,
  onConfirmImport,
  conflictStrategy,
  duplicateStrategy,
  unknownStoreStrategy,
  onConflictStrategyChange,
  onDuplicateStrategyChange,
  onUnknownStoreStrategyChange,
  progress,
  result,
}: ImportStoreStepProps) {
  const cellStatusClass = (status: ImportMatrixCellPreview['status']) => {
    if (status === 'header') return 'bg-[#17263A] text-slate-200 border-[#2d4568]';
    if (status === 'valid') return 'bg-emerald-950/30 text-emerald-200 border-emerald-700/50';
    if (status === 'duplicate') return 'bg-amber-950/35 text-amber-200 border-amber-700/60';
    if (status === 'invalid') return 'bg-rose-950/35 text-rose-200 border-rose-700/60';
    return 'bg-[#0B172A] text-slate-500 border-[#1f3350]';
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onPickFile}
        disabled={locked || busy}
        className={cn(
          'w-full h-12 rounded-2xl border text-sm font-black flex items-center justify-center gap-2',
          locked || busy
            ? 'border-slate-700 bg-slate-800 text-slate-500'
            : 'border-[#2F7DFF] bg-[#17263A] text-white hover:bg-[#1d304a]'
        )}
      >
        <Upload size={16} />
        Select .xlsx / .csv File
      </button>

      {!preview || !meta ? (
        <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-4 py-5 text-sm text-[#8EA2BD]">
          Supports matrix warehouse layout and normal table layout. Import runs only after confirmation.
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-black text-white"><FileSpreadsheet size={16} /> {meta.fileName}</div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">Layout: <span className="text-blue-300 font-black uppercase">{meta.layoutType}</span></div>
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">Rows: <span className="text-white font-black">{meta.totalRows}</span></div>
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">Valid: <span className="text-emerald-300 font-black">{meta.validCount}</span></div>
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">Invalid: <span className="text-rose-300 font-black">{meta.invalidCount}</span></div>
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">Duplicates: <span className="text-amber-300 font-black">{meta.duplicateCount}</span></div>
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">No Slots: <span className="text-rose-300 font-black">{meta.notEnoughSlots}</span></div>
              <div className="rounded-lg border border-[#263B5B] bg-[#17263A] px-2 py-1.5 text-[#8EA2BD]">Empty Slots: <span className="text-white font-black">{meta.emptySlotsAvailable}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <label className="rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2 text-xs text-slate-200">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA2BD] mb-1">Conflict Strategy</div>
              <select
                value={conflictStrategy}
                onChange={(event) => onConflictStrategyChange(event.target.value as ImportConflictStrategy)}
                className="w-full h-9 rounded-lg border border-[#263B5B] bg-[#17263A] px-2 text-xs text-white"
              >
                <option value="fill_empty_only">Fill Empty Only (Default)</option>
                <option value="replace_existing">Replace Existing</option>
                <option value="keep_existing">Merge / Keep Existing</option>
                <option value="append_duplicate">Append as Duplicate Record</option>
              </select>
            </label>
            <label className="rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2 text-xs text-slate-200">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA2BD] mb-1">Duplicate Strategy</div>
              <select
                value={duplicateStrategy}
                onChange={(event) => onDuplicateStrategyChange(event.target.value as ImportDuplicateStrategy)}
                className="w-full h-9 rounded-lg border border-[#263B5B] bg-[#17263A] px-2 text-xs text-white"
              >
                <option value="skip_duplicates">Skip Duplicates (Default)</option>
                <option value="allow_duplicates">Allow Duplicates</option>
                <option value="move_existing">Move Existing to New Location</option>
                <option value="replace_existing_duplicate">Replace Existing Duplicate</option>
              </select>
            </label>
            <label className="rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2 text-xs text-slate-200">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA2BD] mb-1">Unknown Store</div>
              <select
                value={unknownStoreStrategy}
                onChange={(event) => onUnknownStoreStrategyChange(event.target.value as ImportUnknownStoreStrategy)}
                className="w-full h-9 rounded-lg border border-[#263B5B] bg-[#17263A] px-2 text-xs text-white"
              >
                <option value="auto_create">Auto-create (Default)</option>
                <option value="skip_unknown">Skip Unknown Store</option>
                <option value="map_to_selected">Map Unknown to Current Store</option>
              </select>
            </label>
          </div>

          {meta.expansionSummary && meta.expansionSummary.length > 0 ? (
            <div className="rounded-2xl border border-blue-700/40 bg-blue-950/20 px-4 py-3">
              <div className="text-xs font-black text-blue-200 mb-2">Store Expansion Required</div>
              <div className="space-y-1.5 text-xs text-blue-100">
                {meta.expansionSummary.map((item) => (
                  <div key={item.store} className="rounded-lg border border-blue-800/40 bg-blue-950/25 px-2.5 py-1.5">
                    {item.store}: {item.oldRows}x{item.oldColumns} → {item.newRows}x{item.newColumns}
                    {' · '}+{Math.max(0, item.newRows - item.oldRows)} rows, +{Math.max(0, item.newColumns - item.oldColumns)} cols
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {meta.layoutType === 'matrix' && meta.matrix ? (
            <div className="max-h-[42vh] overflow-auto rounded-2xl border border-[#263B5B] bg-[#0d1626]">
              <table className="text-xs border-separate border-spacing-1 min-w-max w-full">
                <thead>
                  <tr>
                    <th className="sticky top-0 left-0 z-20 bg-[#101D30] text-[#8EA2BD] px-2 py-1.5 rounded-lg border border-[#263B5B]">#</th>
                    {Array.from({ length: meta.matrix.columnCount }).map((_, c) => (
                      <th key={`col-${c}`} className="sticky top-0 z-10 bg-[#101D30] text-[#8EA2BD] px-2 py-1.5 rounded-lg border border-[#263B5B] min-w-[6.5rem]">
                        {toExcelCol(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meta.matrix.cells.map((row, r) => (
                    <tr key={`row-${r}`}>
                      <th className="sticky left-0 z-10 bg-[#101D30] text-[#8EA2BD] px-2 py-1.5 rounded-lg border border-[#263B5B]">{r + 1}</th>
                      {row.map((cell, c) => (
                        <td
                          key={`cell-${r}-${c}`}
                          title={cell.tooltip || cell.errors?.join('; ') || ''}
                          className={cn('px-2 py-1.5 rounded-lg border align-top min-w-[6.5rem] max-w-[12rem]', cellStatusClass(cell.status))}
                        >
                          <div className="truncate font-semibold">{cell.value || ''}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-[36vh] overflow-auto rounded-2xl border border-[#263B5B]">
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 bg-[#101D30] text-[#8EA2BD]">
                  <tr>
                    <th className="text-left px-3 py-2">Number</th>
                    <th className="text-left px-3 py-2">Store</th>
                    <th className="text-left px-3 py-2">Row</th>
                    <th className="text-left px-3 py-2">Column</th>
                    <th className="text-left px-3 py-2">Order</th>
                    <th className="text-left px-3 py-2">Errors / Conflicts</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={`${row.number}-${index}`} className="border-t border-[#263B5B]">
                      <td className="px-3 py-2 text-white">{row.number}</td>
                      <td className="px-3 py-2 text-blue-300">{row.store || '-'}</td>
                      <td className="px-3 py-2 text-slate-300">{row.row ?? ''}</td>
                      <td className="px-3 py-2 text-slate-300">{row.column ?? ''}</td>
                      <td className="px-3 py-2 text-slate-300">{row.order || '-'}</td>
                      <td className={cn('px-3 py-2', row.errors.length > 0 ? 'text-rose-300' : 'text-emerald-300')}>
                        {row.errors.length > 0 ? row.errors.join('; ') : 'Valid'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onCancel} className="h-10 px-3 rounded-xl border border-[#263B5B] bg-[#17263A] text-xs font-bold text-slate-200">Cancel</button>
            <button type="button" onClick={onDownloadErrors} className="h-10 px-3 rounded-xl border border-[#263B5B] bg-[#17263A] text-xs font-bold text-slate-200">Download Error Report</button>
            <button type="button" onClick={onImportValidOnly} disabled={busy || locked || meta.validCount === 0} className="h-10 px-3 rounded-xl bg-emerald-600 disabled:bg-slate-700 text-xs font-black text-white">{busy ? 'Importing...' : 'Import Valid Only'}</button>
            <button type="button" onClick={onForceImport} disabled={busy || locked || meta.filledCells === 0} className="h-10 px-3 rounded-xl bg-amber-600 disabled:bg-slate-700 text-xs font-black text-white">{busy ? 'Importing...' : 'Force Import With Report'}</button>
            <button type="button" onClick={onConfirmImport} disabled={busy || locked || meta.validCount === 0} className="h-10 px-3 rounded-xl bg-[#2F7DFF] disabled:bg-slate-700 text-xs font-black text-white">{busy ? 'Importing...' : 'Confirm Import'}</button>
          </div>

          {progress ? (
            <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-4 py-3">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>{progress.phase}</span>
                <span>{progress.percent}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress.percent}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {progress.current} / {progress.total}
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-4 py-3 text-xs text-slate-200 space-y-1.5">
              <div className="text-sm font-black text-emerald-300">Import Finished</div>
              <div>Imported: <span className="font-black text-white">{result.imported}</span></div>
              <div>Skipped empty: <span className="font-black">{result.skippedEmpty}</span></div>
              <div>Skipped invalid: <span className="font-black">{result.skippedInvalid}</span></div>
              <div>Skipped duplicates: <span className="font-black">{result.skippedDuplicates}</span></div>
              <div>Skipped conflicts: <span className="font-black">{result.skippedConflicts}</span></div>
              <div>Replaced: <span className="font-black">{result.replaced}</span></div>
              <div>Expanded stores: <span className="font-black">{result.expandedStores}</span></div>
              <div>Stores updated: <span className="font-black">{result.storesUpdated.join(', ') || '-'}</span></div>
              <div>Time: <span className="font-black">{(result.durationMs / 1000).toFixed(2)}s</span></div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
