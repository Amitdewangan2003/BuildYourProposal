import { useState, useEffect, useRef } from "react";
import { COLORS } from "../../utils/constants";

interface TextColorPickerProps {
  type: "text" | "bg";
  onApply: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  savedSelection: Range | null;
  setSavedSelection: (r: Range | null) => void;
}

export function TextColorPicker({
  type,
  onApply,
  editorRef,
  savedSelection,
  setSavedSelection,
}: TextColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const applyColor = (color: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        if (savedSelection) {
          try {
            sel.addRange(savedSelection);
          } catch (_) {}
        }
        document.execCommand(type === "bg" ? "hiliteColor" : "foreColor", false, color);
        if (sel.rangeCount > 0) setSavedSelection(sel.getRangeAt(0).cloneRange());
      }
      onApply();
    }
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="tb-btn"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={type === "bg" ? "Background Color" : "Text Color"}
      >
        {type === "bg" ? "🎨" : "🔤"}
      </button>
      {isOpen && (
        <div className="color-drop">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-sw"
              style={{ backgroundColor: c }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                applyColor(c);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TableColorPickerProps {
  type: "text" | "bg";
  onApply: (color: string) => void;
}

export function TableColorPicker({ type, onApply }: TableColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={pickerRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className="tb-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={type === "bg" ? "Background Color" : "Text Color"}
      >
        {type === "bg" ? "🎨" : "🔤"}
      </button>
      {isOpen && (
        <div className="color-drop">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-sw"
              style={{ backgroundColor: c }}
              onClick={() => {
                onApply(c);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
