import { readDb, writeDb, cuid } from '../db';
import type { TableColumnType, AggregationType, DbTableColumn, DbTableRow } from '../db';
import { AppError } from '../api-utils';

// ===== Column CRUD =====

export async function getColumns(userId: string): Promise<DbTableColumn[]> {
  const db = readDb();
  return (db.tableColumns || [])
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createColumn(
  userId: string,
  data: { name: string; type: TableColumnType; aggregation?: AggregationType }
): Promise<DbTableColumn> {
  const db = readDb();
  if (!db.tableColumns) db.tableColumns = [];
  const maxOrder = db.tableColumns
    .filter((c) => c.userId === userId)
    .reduce((max, c) => Math.max(max, c.sortOrder), -1);

  const col: DbTableColumn = {
    id: cuid(),
    userId,
    name: data.name,
    type: data.type,
    aggregation: data.aggregation || 'none',
    sortOrder: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  db.tableColumns.push(col);
  writeDb(db);
  return col;
}

export async function updateColumn(
  columnId: string,
  userId: string,
  data: { name?: string; type?: TableColumnType; aggregation?: AggregationType; sortOrder?: number }
): Promise<DbTableColumn> {
  const db = readDb();
  if (!db.tableColumns) db.tableColumns = [];
  const idx = db.tableColumns.findIndex((c) => c.id === columnId && c.userId === userId);
  if (idx === -1) throw new AppError(404, 'Column not found');

  const col = db.tableColumns[idx];
  if (data.name !== undefined) col.name = data.name;
  if (data.type !== undefined) col.type = data.type;
  if (data.aggregation !== undefined) col.aggregation = data.aggregation;
  if (data.sortOrder !== undefined) col.sortOrder = data.sortOrder;
  db.tableColumns[idx] = col;
  writeDb(db);
  return col;
}

export async function deleteColumn(columnId: string, userId: string): Promise<void> {
  const db = readDb();
  if (!db.tableColumns) db.tableColumns = [];
  const col = db.tableColumns.find((c) => c.id === columnId && c.userId === userId);
  if (!col) throw new AppError(404, 'Column not found');

  db.tableColumns = db.tableColumns.filter((c) => c.id !== columnId);

  // Remove this column's values from all rows
  if (db.tableRows) {
    db.tableRows.forEach((row) => {
      if (row.userId === userId && row.values) {
        delete row.values[columnId];
      }
    });
  }
  writeDb(db);
}

// ===== Row CRUD =====

export async function getRows(userId: string): Promise<DbTableRow[]> {
  const db = readDb();
  return (db.tableRows || [])
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function createRow(
  userId: string,
  data: { date: string; values?: Record<string, unknown> }
): Promise<DbTableRow> {
  const db = readDb();
  if (!db.tableRows) db.tableRows = [];

  const row: DbTableRow = {
    id: cuid(),
    userId,
    date: data.date.split('T')[0],
    values: data.values || {},
    createdAt: new Date().toISOString(),
  };
  db.tableRows.push(row);
  writeDb(db);
  return row;
}

export async function updateRow(
  rowId: string,
  userId: string,
  data: { date?: string; values?: Record<string, unknown> }
): Promise<DbTableRow> {
  const db = readDb();
  if (!db.tableRows) db.tableRows = [];
  const idx = db.tableRows.findIndex((r) => r.id === rowId && r.userId === userId);
  if (idx === -1) throw new AppError(404, 'Row not found');

  const row = db.tableRows[idx];
  if (data.date !== undefined) row.date = data.date.split('T')[0];
  if (data.values !== undefined) {
    // Merge values (allows partial updates)
    row.values = { ...row.values, ...data.values };
  }
  db.tableRows[idx] = row;
  writeDb(db);
  return row;
}

export async function deleteRow(rowId: string, userId: string): Promise<void> {
  const db = readDb();
  if (!db.tableRows) db.tableRows = [];
  const row = db.tableRows.find((r) => r.id === rowId && r.userId === userId);
  if (!row) throw new AppError(404, 'Row not found');
  db.tableRows = db.tableRows.filter((r) => r.id !== rowId);
  writeDb(db);
}
