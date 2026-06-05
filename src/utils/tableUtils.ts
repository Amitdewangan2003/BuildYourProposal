import type { Cell } from "../types/document";

export function isCellMerged(data: Cell[][], row: number, col: number): boolean {
  for (let r = 0; r <= row; r++) {
    for (let c = 0; c <= col; c++) {
      const cell = data[r]?.[c];
      if (!cell) continue;
      const rs = cell.rowSpan || 1;
      const cs = cell.colSpan || 1;
      if (r + rs > row && c + cs > col && !(r === row && c === col)) return true;
    }
  }
  return false;
}

export function createEmptyRow(cols: number): Cell[] {
  return Array(cols).fill(null).map(() => ({ value: "" }));
}

export function createTableData(rows: number, cols: number): Cell[][] {
  return Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => ({ value: "" })));
}
