import { useState, useRef, useEffect, useCallback } from "react";
import { TextColorPicker } from "../common/ColorPicker";
import type { Section } from "../../types/document";

interface EditableTextProps {
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

export function EditableText({
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
}: EditableTextProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isInitialized.current && editorRef.current) {
      isInitialized.current = true;
      if (!section.content?.startsWith("__signature__")) {
        editorRef.current.innerHTML = section.content || "";
      }
    }
  }, []);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      setSavedSelection(sel.getRangeAt(0).cloneRange());
    }
  }, []);

  const handleChange = useCallback(() => {
    if (!editorRef.current) return;
    onUpdate({ ...section, content: editorRef.current.innerHTML });
  }, [section, onUpdate]);

  const execCmd = useCallback(
    (cmd: string, val?: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && savedSelection) {
        sel.removeAllRanges();
        try {
          sel.addRange(savedSelection);
        } catch (_) {}
      }
      document.execCommand(cmd, false, val || undefined);
      const sel2 = window.getSelection();
      if (sel2 && sel2.rangeCount > 0) setSavedSelection(sel2.getRangeAt(0).cloneRange());
      setTimeout(() => {
        if (editorRef.current) onUpdate({ ...section, content: editorRef.current.innerHTML });
      }, 0);
    },
    [savedSelection, section, onUpdate],
  );

  if (section.content && section.content.startsWith("__signature__")) {
    const parts = section.content.split("|");
    const sigLeft = parts[1] || "For Augmentuss Automations LLP";
    const sigRight = parts[2] || "For SJR Trading Co.";
    const updateSig = (left: string, right: string) => {
      onUpdate({ ...section, content: `__signature__|${left}|${right}` });
    };
    return (
      <div
        className={`doc-section${hovered ? " section-hovered" : ""}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="section-controls" style={{ opacity: hovered ? 1 : 0 }}>
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
            <span className="section-title-label" onClick={() => setIsEditingTitle(true)}>
              {section.title}
            </span>
          )}
          <div className="section-btns">
            <button className="sc-btn" onClick={onMoveUp} disabled={isFirst} title="Move Up">↑</button>
            <button className="sc-btn" onClick={onMoveDown} disabled={isLast} title="Move Down">↓</button>
            <button className="sc-btn sc-del" onClick={onDelete} title="Delete">✕</button>
          </div>
        </div>
        <h3 className="section-heading">{section.title}</h3>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, paddingBottom: 16 }}>
          {[
            { label: sigLeft, isLeft: true },
            { label: sigRight, isLeft: false },
          ].map(({ label, isLeft }) => (
            <div key={String(isLeft)} style={{ textAlign: "center", minWidth: 220 }}>
              <div style={{ borderBottom: "1px solid #333", width: 220, marginBottom: 8, height: 48 }} />
              <div
                contentEditable
                suppressContentEditableWarning
                style={{ fontSize: 13, color: "#444", outline: "none", cursor: "text" }}
                onBlur={(e) =>
                  isLeft
                    ? updateSig(e.currentTarget.textContent || label, sigRight)
                    : updateSig(sigLeft, e.currentTarget.textContent || label)
                }
                dangerouslySetInnerHTML={{ __html: label }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`doc-section${hovered ? " section-hovered" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="section-toolbar"
        style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? "auto" : "none" }}
      >
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd("bold"); }}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd("italic"); }}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd("underline"); }}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="tb-sep">|</span>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd("justifyLeft"); }}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd("justifyCenter"); }}
          title="Center"
        >
          ⬌
        </button>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => { e.preventDefault(); execCmd("justifyRight"); }}
          title="Right"
        >
          ➡
        </button>
        <span className="tb-sep">|</span>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!editorRef.current) return;
            editorRef.current.focus();
            const sel = window.getSelection();
            if (savedSelection && sel) {
              sel.removeAllRanges();
              try { sel.addRange(savedSelection); } catch (_) {}
            } else if (sel && !sel.rangeCount) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
            document.execCommand("insertUnorderedList", false, undefined);
            setTimeout(() => {
              if (editorRef.current) {
                const s2 = window.getSelection();
                if (s2 && s2.rangeCount > 0) setSavedSelection(s2.getRangeAt(0).cloneRange());
                onUpdate({ ...section, content: editorRef.current.innerHTML });
              }
            }, 0);
          }}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          className="tb-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!editorRef.current) return;
            editorRef.current.focus();
            const sel = window.getSelection();
            if (savedSelection && sel) {
              sel.removeAllRanges();
              try { sel.addRange(savedSelection); } catch (_) {}
            } else if (sel && !sel.rangeCount) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
            document.execCommand("insertOrderedList", false, undefined);
            setTimeout(() => {
              if (editorRef.current) {
                const s2 = window.getSelection();
                if (s2 && s2.rangeCount > 0) setSavedSelection(s2.getRangeAt(0).cloneRange());
                onUpdate({ ...section, content: editorRef.current.innerHTML });
              }
            }, 0);
          }}
          title="Numbered List"
        >
          1. List
        </button>
        <span className="tb-sep">|</span>
        <select
          className="tb-select"
          onChange={(e) => {
            execCmd("fontSize", e.target.value);
            e.target.value = "3";
          }}
          defaultValue="3"
          title="Font Size"
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3">12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>
        <span className="tb-sep">|</span>
        <TextColorPicker
          type="text"
          onApply={handleChange}
          editorRef={editorRef}
          savedSelection={savedSelection}
          setSavedSelection={setSavedSelection}
        />
        <TextColorPicker
          type="bg"
          onApply={handleChange}
          editorRef={editorRef}
          savedSelection={savedSelection}
          setSavedSelection={setSavedSelection}
        />
      </div>
      <div
        className="section-controls"
        style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? "auto" : "none" }}
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
          <span className="section-title-label" onClick={() => setIsEditingTitle(true)}>
            {section.title}
          </span>
        )}
        <div className="section-btns">
          <button className="sc-btn" onClick={onMoveUp} disabled={isFirst} title="Move Up">↑</button>
          <button className="sc-btn" onClick={onMoveDown} disabled={isLast} title="Move Down">↓</button>
          <button className="sc-btn sc-del" onClick={onDelete} title="Delete">✕</button>
        </div>
      </div>
      <h3 className="section-heading">{section.title}</h3>
      <div
        ref={editorRef}
        className="text-body"
        contentEditable
        suppressContentEditableWarning
        onInput={handleChange}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        data-placeholder="Start typing here…"
      />
    </div>
  );
}
