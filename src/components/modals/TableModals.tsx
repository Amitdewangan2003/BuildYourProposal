import { useState } from "react";

interface TableSetupModalProps {
  onClose: () => void;
  onCreate: (cfg: { cols: number; rows: number }) => void;
}

export function TableSetupModal({ onClose, onCreate }: TableSetupModalProps) {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(5);
  const pc = Math.max(cols, 1);
  const pr = Math.max(rows, 1);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 style={{ margin: "0 0 20px", fontSize: 18, color: "#1a2e4a" }}>Create Table</h2>
        <div className="modal-field">
          <label>Columns</label>
          <input
            type="number"
            min={1}
            value={cols}
            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <div className="modal-field">
          <label>Rows</label>
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <div style={{ margin: "16px 0" }}>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Preview:</p>
          <table className="modal-preview-table">
            <thead>
              <tr>
                {Array.from({ length: Math.min(pc, 8) }, (_, i) => (
                  <th key={i}>{String.fromCharCode(65 + i)}</th>
                ))}
                {pc > 8 && <th style={{ color: "#aaa" }}>+{pc - 8}</th>}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(pr, 5) }, (_, r) => (
                <tr key={r}>
                  {Array.from({ length: Math.min(pc, 8) }, (_, c) => (
                    <td key={c}></td>
                  ))}
                  {pc > 8 && <td style={{ color: "#aaa" }}>...</td>}
                </tr>
              ))}
              {pr > 5 && (
                <tr>
                  <td
                    colSpan={Math.min(pc, 8) + (pc > 8 ? 1 : 0)}
                    style={{ textAlign: "center", color: "#aaa", fontSize: 11 }}
                  >
                    …{pr - 5} more rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-create"
            onClick={() => {
              onCreate({ cols: pc, rows: pr });
              onClose();
            }}
          >
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
}
