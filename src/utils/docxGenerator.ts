import {
  Packer,
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  ShadingType,
  Header,
  Footer,
  ImageRun,
  convertInchesToTwip,
} from "docx";
import type { Section, DocHeader } from "../types/document";

async function fetchImageAsBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return await res.arrayBuffer();
}

// A4 at 96 dpi = 794 × 1123 px
const A4_WIDTH_PX = 794;

const getNaturalHeight = (
  buf: ArrayBuffer,
  mime = "image/png",
): Promise<number> =>
  new Promise((resolve) => {
    const blob = new Blob([buf], { type: mime });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const h = Math.round(
        (img.naturalHeight / img.naturalWidth) * A4_WIDTH_PX,
      );
      URL.revokeObjectURL(url);
      resolve(h);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(80);
    };
    img.src = url;
  });

export async function generateDocx(
  sections: Section[],
  docHeader: DocHeader,
): Promise<void> {
  const headerImgUrl = new URL("../assets/header_clean.png", import.meta.url)
    .href;
  const footerImgUrl = new URL("../assets/footer.png", import.meta.url).href;

  let headerImgBuf: ArrayBuffer | null = null;
  let footerImgBuf: ArrayBuffer | null = null;

  try {
    headerImgBuf = await fetchImageAsBuffer(headerImgUrl);
  } catch {
    headerImgBuf = null;
  }
  try {
    footerImgBuf = await fetchImageAsBuffer(footerImgUrl);
  } catch {
    footerImgBuf = null;
  }

  const headerHeight = headerImgBuf ? await getNaturalHeight(headerImgBuf) : 80;
  const footerHeight = footerImgBuf ? await getNaturalHeight(footerImgBuf) : 90;

  // ── Header ──────────────────────────────────────────────────────────────
  const headerChildren: Paragraph[] = [];
  if (headerImgBuf) {
    headerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: headerImgBuf,
            transformation: { width: A4_WIDTH_PX, height: headerHeight },
            type: "png",
          }),
        ],
        // Zero out all paragraph spacing so image sits flush at page top
        spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
      }),
    );
    // Doc number + date row overlaid via a separate paragraph
    headerChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: docHeader.docNumber,
            size: 20,
            bold: true,
            color: "d8e2ee",
          }),
          new TextRun({ text: "    " }),
          new TextRun({ text: docHeader.docDate, size: 18, color: "d8e2ee" }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 0 },
      }),
    );
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  const footerChildren: Paragraph[] = [];
  if (footerImgBuf) {
    footerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: footerImgBuf,
            transformation: { width: A4_WIDTH_PX, height: footerHeight },
            type: "png",
          }),
        ],
        spacing: { before: 0, after: 0, line: 240, lineRule: "auto" },
      }),
    );
  } else {
    footerChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Augmentuss Automations LLP",
            size: 16,
            color: "888888",
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    );
  }

  // ── Body ─────────────────────────────────────────────────────────────────
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: docHeader.clientName,
          bold: true,
          size: 44,
          color: "1a2e4a",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: docHeader.docSubtitle, size: 32, color: "444444" }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];

  for (const sec of sections) {
    if (sec.content?.startsWith("__signature__")) continue;
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: sec.title,
            bold: true,
            size: 26,
            color: "1a2e4a",
          }),
        ],
        spacing: { before: 300, after: 160 },
      }),
    );
    if (sec.type === "text") {
      const tmp = document.createElement("div");
      tmp.innerHTML = sec.content || "";
      const txt = tmp.innerText || tmp.textContent || "";
      txt.split("\n").forEach((line) => {
        if (line.trim())
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 22 })],
              spacing: { after: 80 },
            }),
          );
      });
    } else {
      const data = sec.data || [];
      const cols = data[0]?.length || 0;
      if (cols > 0 && data.length > 0) {
        const colWidthPct = Math.floor(100 / cols);
        const rows = data.map(
          (row) =>
            new TableRow({
              children: Array.from(
                { length: cols },
                (_, c) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: String(row[c]?.value || ""),
                            size: 20,
                            bold:
                              row[c]?.style?.fontWeight === "bold" ||
                              row[c]?.style?.fontWeight === "600",
                            italics: row[c]?.style?.fontStyle === "italic",
                          }),
                        ],
                      }),
                    ],
                    shading: row[c]?.style?.backgroundColor
                      ? {
                          fill: row[c].style!.backgroundColor!.replace("#", ""),
                          type: ShadingType.SOLID,
                          color: row[c].style!.backgroundColor!.replace(
                            "#",
                            "",
                          ),
                        }
                      : {
                          fill: "ffffff",
                          type: ShadingType.SOLID,
                          color: "ffffff",
                        },
                    width: { size: colWidthPct, type: WidthType.PERCENTAGE },
                    margins: {
                      top: convertInchesToTwip(0.04),
                      bottom: convertInchesToTwip(0.04),
                      left: convertInchesToTwip(0.08),
                      right: convertInchesToTwip(0.08),
                    },
                  }),
              ),
            }),
        );
        children.push(
          new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }),
        );
      }
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "" })],
          spacing: { after: 200 },
        }),
      );
    }
  }

  // ── Assemble ──────────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1.2),
              bottom: convertInchesToTwip(1.1),
              left: convertInchesToTwip(0), // ← zero: image spans full page width
              right: convertInchesToTwip(0), // ← zero: nothing clipped on right
              // header/footer distance from page edge (in twips, ~0 = flush)
              header: 0,
              footer: 0,
            },
          },
        },
        headers: { default: new Header({ children: headerChildren }) },
        footers: { default: new Footer({ children: footerChildren }) },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    `${docHeader.clientName}_${docHeader.docSubtitle}`.replace(
      /[^a-z0-9]/gi,
      "_",
    ) + ".docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
