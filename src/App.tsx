import { useState, useRef, useEffect } from "react";
import "./App.css";

import { buildDefaultSections } from "./data/defaultSections";
import { formatDate, uid } from "./utils/helpers";
import { generateDocx } from "./utils/docxGenerator";
import type { Section, DocHeader } from "./types/document";

import { DocHeaderBanner } from "./components/layouts/DocheaderBanner";
import { DocFooterBanner } from "./components/layouts/DocfooterBanner";
import { StickyToolbar } from "./components/layouts/StickyToolbar";
import { TableSetupModal } from "./components/modals/TableModals";
import { SectionRenderer } from "./components/sections/SectionRenderer";

export default function App() {
  const [sections, setSections] = useState<Section[]>(buildDefaultSections);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [docHeader, setDocHeader] = useState<DocHeader>({
    docNumber: "A2003351",
    docDate: formatDate(new Date()),
    clientName: "SJR Trading Co.",
    docSubtitle: "Web application - SOW",
  });

  const documentPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  const updateSection = (updated: Section) =>
    setSections((p) => p.map((s) => (s.id === updated.id ? updated : s)));

  const deleteSection = (id: string) =>
    setSections((p) => p.filter((s) => s.id !== id));

  const moveSection = (i: number, dir: number) => {
    setSections((p) => {
      const n = [...p];
      const ni = i + dir;
      if (ni >= 0 && ni < n.length) [n[i], n[ni]] = [n[ni], n[i]];
      return n;
    });
  };

  const insertTextAt = (idx: number) => {
    const s: Section = {
      id: uid(),
      type: "text",
      title: "New Section",
      content: "",
    };
    setSections((p) => {
      const n = [...p];
      n.splice(idx, 0, s);
      return n;
    });
  };

  const insertTableAt = (idx: number, cfg: { cols: number; rows: number }) => {
    const s: Section = {
      id: uid(),
      type: "table",
      title: "New Table",
      data: Array(cfg.rows)
        .fill(null)
        .map(() =>
          Array(cfg.cols)
            .fill(null)
            .map(() => ({ value: "" })),
        ),
      colWidths: Array(cfg.cols).fill(120),
      rowHeights: Array(cfg.rows).fill(35),
    };
    setSections((p) => {
      const n = [...p];
      n.splice(idx, 0, s);
      return n;
    });
  };

  const exportWord = async () => {
    try {
      await generateDocx(sections, docHeader);
    } catch (e: any) {
      alert("Word export failed: " + e.message);
    }
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) {
      window.print();
      return;
    }
    const styles = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    )
      .map((el) => el.outerHTML)
      .join("\n");
    const docPage = documentPageRef.current;
    if (!docPage) {
      printWin.close();
      window.print();
      return;
    }

    // Blur any focused element so no selection highlight bakes into the snapshot
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const docHTML = docPage.outerHTML;

    /*
     * SPACER-TABLE HACK — fixes header/footer overlap on pages 2+
     *
     * A CSS `<table>` with a `<thead>` and `<tfoot>` has its head/foot
     * rendered on *every* printed page by the browser.  We exploit this by
     * making the head/foot invisible spacer rows whose height matches the
     * fixed header/footer images, so the body content is always pushed
     * below the header and above the footer on every page automatically.
     *
     * 72mm  ≈ rendered height of the header image at A4 width
     * 40mm  ≈ rendered height of the footer image at A4 width
     * Adjust these values if your images are taller/shorter.
     */
    const HEADER_H = "80px";
    const FOOTER_H = "100px";

    const spacerTableOpen = `
      <table class="print-spacer-table" style="
        width:100%;
        border:none;
        border-collapse:collapse;
        border-spacing:0;
      ">
        <thead><tr><td style="
          height:${HEADER_H};
          padding:0;
          border:none;
          display:block;
        "></td></tr></thead>
        <tfoot><tr><td style="
          height:${FOOTER_H};
          padding:0;
          border:none;
          display:block;
        "></td></tr></tfoot>
        <tbody><tr><td style="padding:0;border:none;">
    `;
    const spacerTableClose = `
        </td></tr></tbody>
      </table>
    `;

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title></title>
  ${styles}
  <style>
    @page { size: A4; margin: 0 !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
    .sticky-toolbar,.section-toolbar,.section-controls,.insert-zone,.modal-overlay,.cell-resize-handle { display: none !important; }

    /* Kill selection highlights */
    .selected-cell { background-color: transparent !important; outline: none !important; }
    *::selection { background: transparent !important; color: inherit !important; }
    *:focus, *:focus-visible { outline: none !important; box-shadow: none !important; background: transparent !important; }
    td:focus, td:focus-within, input:focus, [contenteditable]:focus { outline: none !important; box-shadow: none !important; background: inherit !important; }

    .doc-scroll { padding: 0 !important; background: white !important; }
    .document-page { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; max-width: 100% !important; width: 100% !important; overflow: visible !important; }

    .doc-header-banner { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; width: 100% !important; display: block !important; line-height: 0 !important; }
    .header-base-img { width: 100% !important; height: auto !important; display: block !important; }
    .header-meta-overlay { display: flex !important; background: transparent !important; pointer-events: none !important; border: none !important; }
    .header-meta-input { border-bottom: none !important; pointer-events: none !important; color: #d8e2ee !important; background: transparent !important; }

    .doc-footer-banner { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; width: 100% !important; margin-top: 0 !important; display: block !important; line-height: 0 !important; }
    .footer-base-img { width: 100% !important; height: auto !important; display: block !important; }

    /* Padding now comes from the spacer table, not doc-content */
    .doc-content { padding: 0 48px !important; }

    .doc-title-client, .doc-title-sub { pointer-events: none !important; border: none !important; background: transparent !important; }
    .doc-section { page-break-inside: avoid !important; break-inside: avoid !important; orphans: 4; widows: 4; margin-bottom: 14px !important; }
    .doc-section:has(.custom-table) { page-break-before: auto !important; break-before: auto !important; page-break-inside: avoid !important; break-inside: avoid !important; }

    /* Spacer table must never show its own borders */
    table.print-spacer-table,
    table.print-spacer-table thead,
    table.print-spacer-table tfoot,
    table.print-spacer-table tbody,
    table.print-spacer-table tr,
    table.print-spacer-table td {
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
    }

    /* ── TABLE BORDERS inside doc content ── */
    table.custom-table,
    table.custom-table * { border-color: #555e6b !important; }
    table.custom-table {
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      width: 100% !important;
      border: 1px solid #555e6b !important;
    }
    table.custom-table td,
    table.custom-table th {
      border-top: 1px solid #555e6b !important;
      border-right: 1px solid #555e6b !important;
      border-bottom: 1px solid #555e6b !important;
      border-left: 1px solid #555e6b !important;
      padding: 6px 10px !important;
      outline: none !important;
      box-shadow: none !important;
    }

    .text-body { orphans: 4; widows: 4; }
    .text-body ol { padding-left: 28px !important; list-style-type: decimal !important; }
    .text-body ul { padding-left: 28px !important; list-style-type: disc !important; }
    .text-body li { display: list-item !important; }
    .doc-hr { border: none !important; border-top: 1.5px solid #1a2e4a !important; }
  </style>
</head>
<body>
  <div class="doc-scroll">
    ${spacerTableOpen}
      ${docHTML}
    ${spacerTableClose}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 1200); }, 1000);
    });
  <\/script>
</body>
</html>`);
    printWin.document.close();
  };

  return (
    <>
      <StickyToolbar
        sections={sections}
        docHeader={docHeader}
        onAddText={() => insertTextAt(sections.length)}
        onAddTable={() => {
          setInsertIndex(sections.length);
          setShowModal(true);
        }}
        onExportWord={exportWord}
        onPrint={handlePrint}
      />

      <div className="doc-scroll">
        <div className="document-page" ref={documentPageRef}>
          <DocHeaderBanner docHeader={docHeader} setDocHeader={setDocHeader} />
          <div className="doc-content">
            <div className="doc-title-block">
              <input
                className="doc-title-client"
                value={docHeader.clientName}
                onChange={(e) =>
                  setDocHeader((h) => ({ ...h, clientName: e.target.value }))
                }
                placeholder="Client Name"
              />
              <input
                className="doc-title-sub"
                value={docHeader.docSubtitle}
                onChange={(e) =>
                  setDocHeader((h) => ({ ...h, docSubtitle: e.target.value }))
                }
                placeholder="Document Subtitle"
              />
            </div>
            <hr className="doc-hr" />

            <SectionRenderer
              sections={sections}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onMoveSection={moveSection}
              onInsertText={insertTextAt}
              onInsertTable={(idx) => {
                setInsertIndex(idx);
                setShowModal(true);
              }}
            />
          </div>

          <DocFooterBanner />
        </div>
      </div>

      {showModal && (
        <TableSetupModal
          onClose={() => {
            setShowModal(false);
            setInsertIndex(null);
          }}
          onCreate={(cfg) => {
            const idx = insertIndex !== null ? insertIndex : sections.length;
            insertTableAt(idx, cfg);
          }}
        />
      )}
    </>
  );
}
