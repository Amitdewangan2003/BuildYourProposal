export interface CellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  verticalAlign?: string;
  fontSize?: string;
}

export interface Cell {
  value: string;
  style?: CellStyle;
  rowSpan?: number;
  colSpan?: number;
}

export interface Section {
  id: string;
  type: "text" | "table";
  title: string;
  content?: string;
  data?: Cell[][];
  colWidths?: number[];
  rowHeights?: number[];
}

export interface DocHeader {
  docNumber: string;
  docDate: string;
  clientName: string;
  docSubtitle: string;
}
