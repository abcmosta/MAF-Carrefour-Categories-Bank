export interface ExcelSheet {
  name: string;
  headers: string[];
  rows: string[][]; // Rows represented as arrays of strings/cell values
}

export interface ExcelData {
  fileName: string;
  fileSize: number;
  sheets: ExcelSheet[];
}

export interface SearchOptions {
  caseSensitive: boolean;
  exactMatch: boolean;
  searchableColumns: number[]; // Indices of columns to search (empty means all)
}

export interface CopyToast {
  id: string;
  text: string;
  x: number;
  y: number;
}
