import headerImg from "../../assets/header_clean.png";
import type { DocHeader } from "../../types/document";

interface DocHeaderBannerProps {
  docHeader: DocHeader;
  setDocHeader: React.Dispatch<React.SetStateAction<DocHeader>>;
}

export function DocHeaderBanner({ docHeader, setDocHeader }: DocHeaderBannerProps) {
  return (
    <div className="doc-header-banner">
      <img src={headerImg} alt="Augmentuss Header" className="header-base-img" />
      <div className="header-meta-overlay">
        <input
          className="header-meta-input header-meta-docnum"
          value={docHeader.docNumber}
          onChange={(e) => setDocHeader((h) => ({ ...h, docNumber: e.target.value }))}
          title="Edit document number"
        />
        <input
          className="header-meta-input header-meta-docdate"
          value={docHeader.docDate}
          onChange={(e) => setDocHeader((h) => ({ ...h, docDate: e.target.value }))}
          title="Edit document date"
        />
      </div>
    </div>
  );
}
