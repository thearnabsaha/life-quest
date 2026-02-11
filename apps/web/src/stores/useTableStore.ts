import { create } from 'zustand';
import api from '@/lib/api';

export type TableColumnType = 'checkbox' | 'string' | 'number';
export type AggregationType = 'none' | 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface TableColumn {
  id: string;
  userId: string;
  name: string;
  type: TableColumnType;
  aggregation: AggregationType;
  sortOrder: number;
  createdAt: string;
}

export interface TableRow {
  id: string;
  userId: string;
  date: string;
  values: Record<string, unknown>;
  createdAt: string;
}

interface TableState {
  columns: TableColumn[];
  rows: TableRow[];
  isLoading: boolean;

  fetchColumns: () => Promise<void>;
  fetchRows: () => Promise<void>;
  fetchAll: () => Promise<void>;

  addColumn: (data: { name: string; type: TableColumnType; aggregation?: AggregationType }) => Promise<void>;
  updateColumn: (id: string, data: Partial<Pick<TableColumn, 'name' | 'type' | 'aggregation' | 'sortOrder'>>) => Promise<void>;
  deleteColumn: (id: string) => Promise<void>;

  addRow: (date: string, values?: Record<string, unknown>) => Promise<void>;
  updateRow: (id: string, data: { date?: string; values?: Record<string, unknown> }) => Promise<void>;
  deleteRow: (id: string) => Promise<void>;
  updateCellValue: (rowId: string, columnId: string, value: unknown) => Promise<void>;
}

export const useTableStore = create<TableState>((set, get) => ({
  columns: [],
  rows: [],
  isLoading: false,

  fetchColumns: async () => {
    try {
      const { data } = await api.get<TableColumn[]>('/table/columns');
      set({ columns: data });
    } catch {
      /* ignore */
    }
  },

  fetchRows: async () => {
    try {
      const { data } = await api.get<TableRow[]>('/table/rows');
      set({ rows: data });
    } catch {
      /* ignore */
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    await Promise.all([get().fetchColumns(), get().fetchRows()]);
    set({ isLoading: false });
  },

  addColumn: async (colData) => {
    try {
      const { data } = await api.post<TableColumn>('/table/columns', colData);
      set((s) => ({ columns: [...s.columns, data] }));
    } catch {
      /* ignore */
    }
  },

  updateColumn: async (id, updateData) => {
    try {
      const { data } = await api.patch<TableColumn>(`/table/columns/${id}`, updateData);
      set((s) => ({ columns: s.columns.map((c) => (c.id === id ? data : c)) }));
    } catch {
      /* ignore */
    }
  },

  deleteColumn: async (id) => {
    try {
      await api.delete(`/table/columns/${id}`);
      set((s) => ({
        columns: s.columns.filter((c) => c.id !== id),
        rows: s.rows.map((r) => {
          const newValues = { ...r.values };
          delete newValues[id];
          return { ...r, values: newValues };
        }),
      }));
    } catch {
      /* ignore */
    }
  },

  addRow: async (date, values = {}) => {
    try {
      const { data } = await api.post<TableRow>('/table/rows', { date, values });
      set((s) => ({ rows: [data, ...s.rows] }));
    } catch {
      /* ignore */
    }
  },

  updateRow: async (id, updateData) => {
    try {
      const { data } = await api.patch<TableRow>(`/table/rows/${id}`, updateData);
      set((s) => ({ rows: s.rows.map((r) => (r.id === id ? data : r)) }));
    } catch {
      /* ignore */
    }
  },

  deleteRow: async (id) => {
    try {
      await api.delete(`/table/rows/${id}`);
      set((s) => ({ rows: s.rows.filter((r) => r.id !== id) }));
    } catch {
      /* ignore */
    }
  },

  updateCellValue: async (rowId, columnId, value) => {
    const row = get().rows.find((r) => r.id === rowId);
    if (!row) return;
    const newValues = { ...row.values, [columnId]: value };
    // Optimistic update
    set((s) => ({
      rows: s.rows.map((r) => (r.id === rowId ? { ...r, values: newValues } : r)),
    }));
    try {
      await api.patch(`/table/rows/${rowId}`, { values: { [columnId]: value } });
    } catch {
      // Revert on failure
      set((s) => ({
        rows: s.rows.map((r) => (r.id === rowId ? row : r)),
      }));
    }
  },
}));
