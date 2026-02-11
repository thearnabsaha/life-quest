'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Check,
  Hash,
  Type,
  CheckSquare,
  ChevronDown,
  X,
  GripVertical,
  MoreHorizontal,
  Calendar,
} from 'lucide-react';
import {
  useTableStore,
  type TableColumn,
  type TableRow,
  type TableColumnType,
  type AggregationType,
} from '@/stores/useTableStore';

// ===== Column type config =====
const COLUMN_TYPES: { value: TableColumnType; label: string; icon: React.ReactNode }[] = [
  { value: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'string', label: 'Text', icon: <Type className="h-4 w-4" /> },
  { value: 'number', label: 'Number', icon: <Hash className="h-4 w-4" /> },
];

const AGGREGATION_OPTIONS: { value: AggregationType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'count', label: 'Count' },
];

// ===== Compute aggregation =====
function computeAggregation(
  rows: TableRow[],
  columnId: string,
  columnType: TableColumnType,
  aggregation: AggregationType
): string {
  if (aggregation === 'none') return '';

  if (columnType === 'checkbox') {
    const checked = rows.filter((r) => r.values[columnId] === true).length;
    if (aggregation === 'count') return `${checked}`;
    if (aggregation === 'sum') return `${checked}`;
    return `${checked}/${rows.length}`;
  }

  if (columnType === 'number') {
    const nums = rows
      .map((r) => Number(r.values[columnId]))
      .filter((n) => !isNaN(n));

    if (nums.length === 0) return '—';
    switch (aggregation) {
      case 'sum':
        return nums.reduce((a, b) => a + b, 0).toFixed(1).replace(/\.0$/, '');
      case 'avg':
        return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
      case 'min':
        return Math.min(...nums).toFixed(1).replace(/\.0$/, '');
      case 'max':
        return Math.max(...nums).toFixed(1).replace(/\.0$/, '');
      case 'count':
        return `${nums.length}`;
      default:
        return '';
    }
  }

  if (columnType === 'string') {
    const filled = rows.filter(
      (r) => typeof r.values[columnId] === 'string' && (r.values[columnId] as string).length > 0
    ).length;
    if (aggregation === 'count') return `${filled}`;
    return `${filled}/${rows.length}`;
  }

  return '';
}

// ===== Inline editable cell =====
function CellEditor({
  column,
  value,
  onChange,
}: {
  column: TableColumn;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (column.type === 'checkbox') {
    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={() => onChange(!value)}
          className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: value ? 'var(--color-accent)' : 'var(--color-border)',
            backgroundColor: value ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {value && <Check className="h-3 w-3" style={{ color: 'var(--color-bg-base)' }} />}
        </button>
      </div>
    );
  }

  if (editing) {
    const handleBlur = () => {
      setEditing(false);
      if (column.type === 'number') {
        const num = parseFloat(localVal);
        onChange(isNaN(num) ? null : num);
      } else {
        onChange(localVal);
      }
    };

    return (
      <input
        ref={inputRef}
        type={column.type === 'number' ? 'number' : 'text'}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleBlur();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-full bg-transparent outline-none px-2 py-1 font-mono text-sm"
        style={{ color: 'var(--color-text-primary)' }}
        step={column.type === 'number' ? 'any' : undefined}
      />
    );
  }

  const display =
    value === null || value === undefined
      ? ''
      : column.type === 'number'
        ? String(value)
        : String(value);

  return (
    <div
      className="px-2 py-1 cursor-text min-h-[28px] font-mono text-sm truncate"
      style={{ color: display ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
      onClick={() => {
        setLocalVal(display);
        setEditing(true);
      }}
    >
      {display || <span className="opacity-40 italic">Empty</span>}
    </div>
  );
}

// ===== Column header dropdown =====
function ColumnMenu({
  column,
  onUpdate,
  onDelete,
  onClose,
}: {
  column: TableColumn;
  onUpdate: (data: Partial<Pick<TableColumn, 'name' | 'type' | 'aggregation'>>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(column.name);
  const [type, setType] = useState<TableColumnType>(column.type);
  const [aggr, setAggr] = useState<AggregationType>(column.aggregation);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleSave = () => {
    onUpdate({ name, type, aggregation: type === 'number' ? aggr : (type === 'checkbox' ? aggr : 'none') });
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="absolute top-full left-0 mt-1 z-50 w-64 rounded-lg p-3 space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '2px solid var(--color-border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Column name */}
      <div>
        <label className="block text-xs font-mono mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Column Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1.5 rounded text-sm font-mono outline-none"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {/* Column type */}
      <div>
        <label className="block text-xs font-mono mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Type
        </label>
        <div className="flex gap-1">
          {COLUMN_TYPES.map((ct) => (
            <button
              key={ct.value}
              onClick={() => {
                setType(ct.value);
                if (ct.value !== 'number') setAggr('none');
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all"
              style={{
                backgroundColor: type === ct.value ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: type === ct.value ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
                border: `1px solid ${type === ct.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              {ct.icon}
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregation (only for number and checkbox) */}
      {(type === 'number' || type === 'checkbox') && (
        <div>
          <label className="block text-xs font-mono mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Aggregation
          </label>
          <select
            value={aggr}
            onChange={(e) => setAggr(e.target.value as AggregationType)}
            className="w-full px-2 py-1.5 rounded text-sm font-mono outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {(type === 'checkbox'
              ? AGGREGATION_OPTIONS.filter((a) => ['none', 'count', 'sum'].includes(a.value))
              : AGGREGATION_OPTIONS
            ).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all hover:opacity-80"
          style={{ color: '#ff4444', backgroundColor: 'rgba(255,68,68,0.1)' }}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1 rounded text-xs font-mono font-bold transition-all"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg-base)',
          }}
        >
          <Check className="h-3 w-3" />
          Save
        </button>
      </div>
    </motion.div>
  );
}

// ===== Add Column Dialog =====
function AddColumnDialog({
  onAdd,
  onClose,
}: {
  onAdd: (data: { name: string; type: TableColumnType; aggregation: AggregationType }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TableColumnType>('string');
  const [aggr, setAggr] = useState<AggregationType>('none');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), type, aggregation: aggr });
    onClose();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute top-full right-0 mt-1 z-50 w-72 rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '2px solid var(--color-border)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          New Column
        </span>
        <button onClick={onClose}>
          <X className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Column name..."
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        className="w-full px-2 py-1.5 rounded text-sm font-mono outline-none"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      />

      <div className="flex gap-1">
        {COLUMN_TYPES.map((ct) => (
          <button
            key={ct.value}
            onClick={() => {
              setType(ct.value);
              if (ct.value !== 'number') setAggr('none');
            }}
            className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono transition-all flex-1 justify-center"
            style={{
              backgroundColor: type === ct.value ? 'var(--color-accent)' : 'var(--color-bg-card)',
              color: type === ct.value ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
              border: `1px solid ${type === ct.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}
          >
            {ct.icon}
            <span className="hidden sm:inline">{ct.label}</span>
          </button>
        ))}
      </div>

      {(type === 'number' || type === 'checkbox') && (
        <div>
          <label className="block text-xs font-mono mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Aggregation
          </label>
          <select
            value={aggr}
            onChange={(e) => setAggr(e.target.value as AggregationType)}
            className="w-full px-2 py-1.5 rounded text-sm font-mono outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            {(type === 'checkbox'
              ? AGGREGATION_OPTIONS.filter((a) => ['none', 'count', 'sum'].includes(a.value))
              : AGGREGATION_OPTIONS
            ).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full py-2 rounded font-mono text-sm font-bold transition-all disabled:opacity-40"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-bg-base)',
        }}
      >
        Add Column
      </button>
    </motion.div>
  );
}

// ===== Main NotionTable Component =====
export function NotionTable() {
  const {
    columns,
    rows,
    isLoading,
    fetchAll,
    addColumn,
    updateColumn,
    deleteColumn,
    addRow,
    deleteRow,
    updateCellValue,
  } = useTableStore();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAddCol, setShowAddCol] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAddColumn = useCallback(
    async (data: { name: string; type: TableColumnType; aggregation: AggregationType }) => {
      await addColumn(data);
    },
    [addColumn]
  );

  const handleAddRow = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const defaults: Record<string, unknown> = {};
    columns.forEach((col) => {
      if (col.type === 'checkbox') defaults[col.id] = false;
      else if (col.type === 'number') defaults[col.id] = null;
      else defaults[col.id] = '';
    });
    await addRow(today, defaults);
  }, [addRow, columns]);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [rows]
  );

  const hasAggregation = columns.some((c) => c.aggregation !== 'none');

  if (isLoading && columns.length === 0) {
    return (
      <div
        className="rounded-lg p-8 text-center"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '2px solid var(--color-border)',
        }}
      >
        <div className="font-mono text-sm animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
          Loading table...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="font-heading text-lg font-bold tracking-wider"
          style={{ color: 'var(--color-text-primary)' }}
        >
          DATA TRACKER
        </h2>
        <div className="flex items-center gap-2">
          {columns.length > 0 && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-base)',
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {columns.length === 0 ? (
        <div
          className="rounded-lg p-12 text-center"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '2px dashed var(--color-border)',
          }}
        >
          <div className="space-y-3">
            <div
              className="inline-flex p-3 rounded-full"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <Hash className="h-6 w-6" style={{ color: 'var(--color-accent)' }} />
            </div>
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No columns yet. Create your first column to start tracking data.
            </p>
            <button
              onClick={() => setShowAddCol(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-mono text-sm font-bold transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg-base)',
              }}
            >
              <Plus className="h-4 w-4" />
              Add First Column
            </button>
            <AnimatePresence>
              {showAddCol && (
                <div className="relative inline-block">
                  <AddColumnDialog
                    onAdd={handleAddColumn}
                    onClose={() => setShowAddCol(false)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        /* Table */
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: '2px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-card)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[500px]">
              {/* Column headers */}
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                  {/* Date column (fixed) */}
                  <th
                    className="px-3 py-2 text-left font-mono text-xs font-bold tracking-wider whitespace-nowrap"
                    style={{
                      color: 'var(--color-text-muted)',
                      borderBottom: '2px solid var(--color-border)',
                      borderRight: '1px solid var(--color-border)',
                      width: 120,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </div>
                  </th>
                  {/* Dynamic columns */}
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="px-3 py-2 text-left font-mono text-xs font-bold tracking-wider whitespace-nowrap relative"
                      style={{
                        color: 'var(--color-text-muted)',
                        borderBottom: '2px solid var(--color-border)',
                        borderRight: '1px solid var(--color-border)',
                        minWidth: col.type === 'checkbox' ? 80 : 140,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.type === 'checkbox' && <CheckSquare className="h-3.5 w-3.5" />}
                        {col.type === 'string' && <Type className="h-3.5 w-3.5" />}
                        {col.type === 'number' && <Hash className="h-3.5 w-3.5" />}
                        <span className="truncate max-w-[100px]">{col.name}</span>
                        <button
                          onClick={() => setOpenMenu(openMenu === col.id ? null : col.id)}
                          className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <AnimatePresence>
                        {openMenu === col.id && (
                          <ColumnMenu
                            column={col}
                            onUpdate={(data) => updateColumn(col.id, data)}
                            onDelete={() => {
                              deleteColumn(col.id);
                              setOpenMenu(null);
                            }}
                            onClose={() => setOpenMenu(null)}
                          />
                        )}
                      </AnimatePresence>
                    </th>
                  ))}
                  {/* Add column button */}
                  <th
                    className="px-2 py-2 relative"
                    style={{
                      borderBottom: '2px solid var(--color-border)',
                      width: 44,
                    }}
                  >
                    <button
                      onClick={() => setShowAddCol(!showAddCol)}
                      className="p-1 rounded transition-all hover:opacity-80"
                      style={{ color: 'var(--color-text-muted)' }}
                      title="Add column"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <AnimatePresence>
                      {showAddCol && (
                        <AddColumnDialog
                          onAdd={handleAddColumn}
                          onClose={() => setShowAddCol(false)}
                        />
                      )}
                    </AnimatePresence>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                <AnimatePresence>
                  {sortedRows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      {/* Date cell */}
                      <td
                        className="px-3 py-1 font-mono text-xs"
                        style={{
                          color: 'var(--color-text-primary)',
                          borderRight: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg-surface)',
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => {
                              if (e.target.value) {
                                useTableStore.getState().updateRow(row.id, { date: e.target.value });
                              }
                            }}
                            className="bg-transparent outline-none font-mono text-xs cursor-pointer"
                            style={{ color: 'var(--color-text-primary)', colorScheme: 'dark' }}
                          />
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ml-auto"
                            title="Delete row"
                          >
                            <Trash2 className="h-3 w-3" style={{ color: '#ff4444' }} />
                          </button>
                        </div>
                      </td>
                      {/* Data cells */}
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className="px-0 py-0"
                          style={{ borderRight: '1px solid var(--color-border)' }}
                        >
                          <CellEditor
                            column={col}
                            value={row.values[col.id]}
                            onChange={(val) => updateCellValue(row.id, col.id, val)}
                          />
                        </td>
                      ))}
                      <td />
                    </motion.tr>
                  ))}
                </AnimatePresence>

                {/* Empty rows state */}
                {sortedRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="px-4 py-8 text-center font-mono text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      No rows yet. Click &ldquo;Add Row&rdquo; to start tracking.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Aggregation footer */}
              {hasAggregation && sortedRows.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      backgroundColor: 'var(--color-bg-elevated)',
                      borderTop: '2px solid var(--color-border)',
                    }}
                  >
                    <td
                      className="px-3 py-2 font-mono text-xs font-bold"
                      style={{
                        color: 'var(--color-accent)',
                        borderRight: '1px solid var(--color-border)',
                      }}
                    >
                      Totals
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className="px-3 py-2 font-mono text-xs font-bold"
                        style={{
                          color: col.aggregation !== 'none' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                          borderRight: '1px solid var(--color-border)',
                        }}
                      >
                        {col.aggregation !== 'none' && (
                          <div className="flex items-center gap-1">
                            <span className="opacity-60 text-[10px] uppercase">{col.aggregation}:</span>
                            <span>{computeAggregation(sortedRows, col.id, col.type, col.aggregation)}</span>
                          </div>
                        )}
                      </td>
                    ))}
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
