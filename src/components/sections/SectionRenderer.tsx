import { useState, useRef, useEffect } from "react";
import type { Section } from "../../types/document";
import { EditableText } from "./Editabletext";
import { EditableTable } from "./Editabletable";

interface InsertZoneProps {
  onInsertText: () => void;
  onInsertTable: () => void;
}

export function InsertZone({ onInsertText, onInsertTable }: InsertZoneProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div
      ref={zoneRef}
      className="insert-zone"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ opacity: hovered || menuOpen ? 1 : 0 }}
    >
      <div className="insert-line" />
      <button
        className="insert-plus-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        title="Insert section here"
      >
        ＋
      </button>
      {menuOpen && (
        <div className="insert-menu">
          <button onClick={() => { onInsertText(); setMenuOpen(false); }}>📝 Insert Text Section</button>
          <button onClick={() => { onInsertTable(); setMenuOpen(false); }}>📊 Insert Table</button>
        </div>
      )}
    </div>
  );
}

interface SectionRendererProps {
  sections: Section[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onUpdate: (s: Section) => void;
  onDelete: (id: string) => void;
  onMoveSection: (i: number, dir: number) => void;
  onInsertText: (idx: number) => void;
  onInsertTable: (idx: number) => void;
}

export function SectionRenderer({
  sections,
  hoveredId,
  setHoveredId,
  onUpdate,
  onDelete,
  onMoveSection,
  onInsertText,
  onInsertTable,
}: SectionRendererProps) {
  return (
    <>
      {sections.map((sec, i) => (
        <div key={sec.id}>
          {i === 0 && (
            <InsertZone
              onInsertText={() => onInsertText(0)}
              onInsertTable={() => onInsertTable(0)}
            />
          )}
          {sec.type === "text" ? (
            <EditableText
              section={sec}
              onUpdate={onUpdate}
              onDelete={() => onDelete(sec.id)}
              onMoveUp={() => onMoveSection(i, -1)}
              onMoveDown={() => onMoveSection(i, 1)}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
              hovered={hoveredId === sec.id}
              onMouseEnter={() => setHoveredId(sec.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          ) : (
            <EditableTable
              section={sec}
              onUpdate={onUpdate}
              onDelete={() => onDelete(sec.id)}
              onMoveUp={() => onMoveSection(i, -1)}
              onMoveDown={() => onMoveSection(i, 1)}
              isFirst={i === 0}
              isLast={i === sections.length - 1}
              hovered={hoveredId === sec.id}
              onMouseEnter={() => setHoveredId(sec.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          )}
          <InsertZone
            onInsertText={() => onInsertText(i + 1)}
            onInsertTable={() => onInsertTable(i + 1)}
          />
        </div>
      ))}
      {sections.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
          <p style={{ fontSize: 15 }}>No sections yet. Use the toolbar above to add content.</p>
        </div>
      )}
    </>
  );
}
