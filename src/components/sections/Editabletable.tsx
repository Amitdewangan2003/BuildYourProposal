import { useState, useRef, useEffect } from "react";
import { TableColorPicker } from "../common/ColorPicker";
import { isCellMerged } from "../../utils/tableUtils";
import type { Section, Cell, CellStyle } from "../../types/document";

interface EditableTableProps {
  section: Section;
  onUpdate: (s: Section) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function EditableTable({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  hovered,
  onMouseEnter,
  onMouseLeave,
}: EditableTableProps) {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionStart, setSelectionStart] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [resizingCell, setResizingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const colWidths =
    section.colWidths || Array(section.data![0]?.length || 3).fill(120);
  const rowHeights =
    section.rowHeights || Array(section.data!.length || 1).fill(35);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    const cols = section.data![0]?.length || 3;
    const rows = section.data!.length || 1;
    if (!section.colWidths || section.colWidths.length !== cols) {
      onUpdate({ ...section, colWidths: Array(cols).fill(120) });
    }
    if (!section.rowHeights || section.rowHeights.length !== rows) {
      onUpdate({ ...section, rowHeights: Array(rows).fill(35) });
    }
  }, [section.data!.length, section.data![0]?.length]);

  const updateCellValue = (row: number, col: number, value: string) => {
    const newData = section.data!.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? { ...c, value } : c)) : r,
    );
    onUpdate({ ...section, data: newData });
  };

  const applyStyleToSelection = (style: Partial<CellStyle>) => {
    const newData = section.data!.map((row, ri) =>
      row.map((cell, ci) =>
        selectedCells.has(`${ri}-${ci}`)
          ? { ...cell, style: { ...cell.style, ...style } }
          : cell,
      ),
    );
    onUpdate({ ...section, data: newData });
  };

  const toggleStyleInSelection = (prop: keyof CellStyle, value: string) => {
    const newData = section.data!.map((row, ri) =>
      row.map((cell, ci) => {
        if (selectedCells.has(`${ri}-${ci}`)) {
          const cur = cell.style?.[prop];
          return {
            ...cell,
            style: { ...cell.style, [prop]: cur === value ? undefined : value },
          };
        }
        return cell;
      }),
    );
    onUpdate({ ...section, data: newData });
  };

  const handleAddRow = () => {
    const cols = section.data![0]?.length || 3;
    const newRow: Cell[] = Array(cols)
      .fill(null)
      .map(() => ({ value: "" }));
    onUpdate({
      ...section,
      data: [...section.data!, newRow],
      rowHeights: [...rowHeights, 35],
    });
  };

  const handleRemoveRow = () => {
    if (section.data!.length <= 1) return;
    onUpdate({
      ...section,
      data: section.data!.slice(0, -1),
      rowHeights: rowHeights.slice(0, -1),
    });
  };

  const handleAddColumn = () => {
    const newData = section.data!.map((row) => [...row, { value: "" }]);
    onUpdate({ ...section, data: newData, colWidths: [...colWidths, 120] });
  };

  const handleRemoveColumn = () => {
    const cols = section.data![0]?.length || 0;
    if (cols <= 1) return;
    const newData = section.data!.map((row) => row.slice(0, -1));
    onUpdate({ ...section, data: newData, colWidths: colWidths.slice(0, -1) });
  };

  const handleMergeCells = () => {
    if (selectedCells.size < 2) {
      alert("Select at least 2 cells to merge");
      return;
    }
    const cells = Array.from(selectedCells).map((k) => {
      const [r, c] = k.split("-").map(Number);
      return { row: r, col: c };
    });
    const minRow = Math.min(...cells.map((c) => c.row));
    const maxRow = Math.max(...cells.map((c) => c.row));
    const minCol = Math.min(...cells.map((c) => c.col));
    const maxCol = Math.max(...cells.map((c) => c.col));
    let combinedValue = "";
    for (let r = minRow; r <= maxRow; r++)
      for (let c = minCol; c <= maxCol; c++) {
        const val = section.data![r][c].value?.trim();
        if (val) combinedValue += (combinedValue ? " " : "") + val;
      }
    const newData = section.data!.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === minRow && ci === minCol)
          return {
            ...cell,
            value: combinedValue,
            rowSpan: maxRow - minRow + 1,
            colSpan: maxCol - minCol + 1,
          };
        if (ri >= minRow && ri <= maxRow && ci >= minCol && ci <= maxCol)
          return { ...cell, value: "", rowSpan: undefined, colSpan: undefined };
        return cell;
      }),
    );
    onUpdate({ ...section, data: newData });
    setSelectedCells(new Set());
  };

  const handleUnmergeCells = () => {
    let found = false;
    const newData = section.data!.map((row, ri) =>
      row.map((cell, ci) => {
        if (
          selectedCells.has(`${ri}-${ci}`) &&
          (cell.rowSpan || cell.colSpan)
        ) {
          found = true;
          return { ...cell, rowSpan: undefined, colSpan: undefined };
        }
        return cell;
      }),
    );
    if (!found) {
      alert("No merged cells found in selection");
      return;
    }
    onUpdate({ ...section, data: newData });
    setSelectedCells(new Set());
  };

  const handleCellMouseDown = (
    row: number,
    col: number,
    e: React.MouseEvent,
    isNearEdge: boolean,
  ) => {
    if (
      e.currentTarget
        .querySelector(".cell-resize-handle")
        ?.contains(e.target as Node) ||
      isNearEdge
    ) {
      e.preventDefault();
      return;
    }
    if (!e.shiftKey) {
      setSelectionStart({ row, col });
      setSelectedCells(new Set([`${row}-${col}`]));
    } else if (selectionStart) {
      const minR = Math.min(selectionStart.row, row);
      const maxR = Math.max(selectionStart.row, row);
      const minC = Math.min(selectionStart.col, col);
      const maxC = Math.max(selectionStart.col, col);
      const ns = new Set<string>();
      for (let r = minR; r <= maxR; r++)
        for (let c = minC; c <= maxC; c++)
          if (!isCellMerged(section.data!, r, c)) ns.add(`${r}-${c}`);
      setSelectedCells(ns);
    }
  };

  const handleCellMouseEnter = (
    row: number,
    col: number,
    e: React.MouseEvent,
  ) => {
    if (resizingCell) return;
    if (
      e.buttons === 1 &&
      selectionStart &&
      !isCellMerged(section.data!, row, col)
    ) {
      const minR = Math.min(selectionStart.row, row);
      const maxR = Math.max(selectionStart.row, row);
      const minC = Math.min(selectionStart.col, col);
      const maxC = Math.max(selectionStart.col, col);
      const ns = new Set<string>();
      for (let r = minR; r <= maxR; r++)
        for (let c = minC; c <= maxC; c++)
          if (!isCellMerged(section.data!, r, c)) ns.add(`${r}-${c}`);
      setSelectedCells(ns);
    }
  };

  const handleResizeStart = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCell({ row, col });
    setSelectionStart(null);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = colWidths[col];
    const startH = rowHeights[row];
    const mv = (me: MouseEvent) => {
      me.preventDefault();
      const nw = [...colWidths];
      nw[col] = Math.max(40, startW + (me.clientX - startX));
      const nh = [...rowHeights];
      nh[row] = Math.max(25, startH + (me.clientY - startY));
      onUpdate({ ...section, colWidths: nw, rowHeights: nh });
    };
    const up = () => {
      setResizingCell(null);
      document.removeEventListener("mousemove", mv);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", mv);
    document.addEventListener("mouseup", up);
  };

  return (
    <div
      className={`doc-section${hovered ? " section-hovered" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="section-toolbar"
        style={{
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        <button
          className="tb-btn"
          onClick={() => toggleStyleInSelection("fontWeight", "bold")}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          className="tb-btn"
          onClick={() => toggleStyleInSelection("fontStyle", "italic")}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          className="tb-btn"
          onClick={() => toggleStyleInSelection("textDecoration", "underline")}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="tb-sep">|</span>
        <button
          className="tb-btn"
          onClick={() => applyStyleToSelection({ textAlign: "left" })}
          title="Left"
        >
          ⬅
        </button>
        <button
          className="tb-btn"
          onClick={() => applyStyleToSelection({ textAlign: "center" })}
          title="Center"
        >
          ⬌
        </button>
        <button
          className="tb-btn"
          onClick={() => applyStyleToSelection({ textAlign: "right" })}
          title="Right"
        >
          ➡
        </button>
        <span className="tb-sep">|</span>
        <select
          className="tb-select"
          onChange={(e) => {
            applyStyleToSelection({ fontSize: e.target.value + "px" });
            e.target.value = "13";
          }}
          defaultValue="13"
        >
          {[8, 10, 11, 12, 13, 14, 16, 18, 20, 24].map((s) => (
            <option key={s} value={s}>
              {s}pt
            </option>
          ))}
        </select>
        <span className="tb-sep">|</span>
        <TableColorPicker
          type="text"
          onApply={(c) => applyStyleToSelection({ color: c })}
        />
        <TableColorPicker
          type="bg"
          onApply={(c) => applyStyleToSelection({ backgroundColor: c })}
        />
        <span className="tb-sep">|</span>
        <button className="tb-btn" onClick={handleAddRow}>
          ➕ Row
        </button>
        <button className="tb-btn" onClick={handleRemoveRow}>
          ➖ Row
        </button>
        <button className="tb-btn" onClick={handleAddColumn}>
          ➕ Col
        </button>
        <button className="tb-btn" onClick={handleRemoveColumn}>
          ➖ Col
        </button>
        <span className="tb-sep">|</span>
        <button className="tb-btn" onClick={handleMergeCells}>
          ⧉ Merge
        </button>
        <button className="tb-btn" onClick={handleUnmergeCells}>
          ⊞ Unmerge
        </button>
      </div>
      <div
        className="section-controls"
        style={{
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            className="section-title-input"
            value={section.title}
            onChange={(e) => onUpdate({ ...section, title: e.target.value })}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
          />
        ) : (
          <span
            className="section-title-label"
            onClick={() => setIsEditingTitle(true)}
          >
            {section.title}
          </span>
        )}
        <div className="section-btns">
          <button className="sc-btn" onClick={onMoveUp} disabled={isFirst}>
            ↑
          </button>
          <button className="sc-btn" onClick={onMoveDown} disabled={isLast}>
            ↓
          </button>
          <button className="sc-btn sc-del" onClick={onDelete}>
            ✕
          </button>
        </div>
      </div>
      <h3 className="section-heading">{section.title}</h3>
      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table
          ref={tableRef}
          className="custom-table"
          style={{ borderCollapse: "collapse" }}
        >
          <tbody>
            {section.data!.map((row, ri) => (
              <tr key={ri} style={{ height: rowHeights[ri] }}>
                {row.map((cell, ci) => {
                  if (isCellMerged(section.data!, ri, ci)) return null;
                  const isSelected = selectedCells.has(`${ri}-${ci}`);
                  // Bug 3 fix: user-set background always wins; selection
                  // highlight is a CSS class, not an inline style, so
                  // @media print can suppress it without touching user colors.
                  const cellStyle: React.CSSProperties = {
                    backgroundColor: cell.style?.backgroundColor || "#ffffff",
                    color: cell.style?.color || "#333",
                    fontWeight: cell.style?.fontWeight,
                    fontStyle: cell.style?.fontStyle,
                    textDecoration: cell.style?.textDecoration,
                    textAlign:
                      (cell.style
                        ?.textAlign as React.CSSProperties["textAlign"]) ||
                      "left",
                    verticalAlign:
                      (cell.style
                        ?.verticalAlign as React.CSSProperties["verticalAlign"]) ||
                      "top",
                    // Border is now always neutral; selection outline comes
                    // from the .selected-cell CSS class via outline property.
                    border: "1px solid #555e6b",
                    padding: "8px 12px",
                    position: "relative",
                    minWidth: 80,
                    width: colWidths[ci],
                    height: rowHeights[ri],
                    fontSize: cell.style?.fontSize || "13px",
                    cursor: "text",
                  };
                  return (
                    <td
                      key={ci}
                      rowSpan={cell.rowSpan}
                      colSpan={cell.colSpan}
                      // Bug 3 fix: selection highlight via class, not inline style
                      className={isSelected ? "selected-cell" : undefined}
                      style={cellStyle}
                      onMouseDown={(e) => {
                        const td = e.currentTarget;
                        const rect = td.getBoundingClientRect();
                        const isNearEdge =
                          e.clientX > rect.right - 10 &&
                          e.clientY > rect.bottom - 10;
                        if (!isNearEdge)
                          handleCellMouseDown(ri, ci, e, isNearEdge);
                      }}
                      onMouseEnter={(e) => {
                        handleCellMouseEnter(ri, ci, e);
                        setHoveredCell({ row: ri, col: ci });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      onMouseMove={(e) => {
                        const td = e.currentTarget;
                        const rect = td.getBoundingClientRect();
                        td.style.cursor =
                          e.clientX > rect.right - 10 &&
                          e.clientY > rect.bottom - 10
                            ? "nwse-resize"
                            : "text";
                      }}
                    >
                      <input
                        type="text"
                        value={cell.value || ""}
                        onChange={(e) =>
                          updateCellValue(ri, ci, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          fontWeight: cell.style?.fontWeight,
                          fontStyle: cell.style?.fontStyle,
                          textDecoration: cell.style?.textDecoration,
                          color: cell.style?.color || "#333",
                          textAlign:
                            (cell.style
                              ?.textAlign as React.CSSProperties["textAlign"]) ||
                            "left",
                          padding: 0,
                          direction: "ltr",
                        }}
                      />
                      <div
                        className="cell-resize-handle"
                        onMouseDown={(e) => handleResizeStart(ri, ci, e)}
                        style={{
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          width: 8,
                          height: 8,
                          cursor: "nwse-resize",
                          background: "#1a2e4a",
                          borderRadius: "50%",
                          opacity:
                            (hoveredCell?.row === ri &&
                              hoveredCell?.col === ci) ||
                            (resizingCell?.row === ri &&
                              resizingCell?.col === ci)
                              ? 1
                              : 0,
                          transition: "opacity 0.1s",
                          zIndex: 20,
                          pointerEvents: "auto",
                        }}
                        title="Drag to resize"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
