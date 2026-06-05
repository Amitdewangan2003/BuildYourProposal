import type { Section, DocHeader } from "../../types/document";

interface StickyToolbarProps {
  sections: Section[];
  docHeader: DocHeader;
  onAddText: () => void;
  onAddTable: () => void;
  onExportWord: () => void;
  onPrint: () => void;
}

export function StickyToolbar({
  onAddText,
  onAddTable,
  onExportWord,
  onPrint,
}: StickyToolbarProps) {
  return (
    <div className="sticky-toolbar">
      <div className="sticky-toolbar-brand">📋 Proposal Builder</div>
      <div className="sticky-toolbar-actions">
        <button className="toolbar-action-btn" onClick={onAddText}>
          + Add Text
        </button>
        <button className="toolbar-action-btn" onClick={onAddTable}>
          + Add Table
        </button>
        <button className="toolbar-action-btn word" onClick={onExportWord}>
          📝 Export Word
        </button>
        <button
          className="toolbar-action-btn print"
          onClick={onPrint}
          title="Opens print dialog — in dialog, set Margins to None and uncheck Headers &amp; Footers"
        >
          🖨️ Print / Save PDF
        </button>
      </div>
    </div>
  );
}
