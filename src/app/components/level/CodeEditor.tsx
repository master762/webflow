"use client";

import { useRef, useCallback } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightLines: number[];
  activeArrowLine?: number | null;
  arrowLabel?: string;
}

const LINE_HEIGHT = 22;

export default function CodeEditor({
  value,
  onChange,
  highlightLines,
  activeArrowLine,
  arrowLabel,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = value.split("\n");
  const highlightSet = new Set(highlightLines);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (ta && gutter) {
      gutter.scrollTop = ta.scrollTop;
    }
  }, []);

  return (
    <div className="relative flex h-96 bg-secondary-dark overflow-hidden">
      <div
        ref={gutterRef}
        className="shrink-0 w-12 py-4 pr-2 text-right text-text-dim/60 font-mono text-sm select-none overflow-hidden border-r border-glass-border bg-black/20"
        aria-hidden
      >
        {lines.map((_, i) => {
          const lineNum = i + 1;
          const isError = highlightSet.has(lineNum);
          const isArrow = activeArrowLine === lineNum;
          return (
            <div
              key={lineNum}
              className={`leading-[22px] px-1 rounded-l ${
                isArrow
                  ? "text-accent-blue font-bold bg-accent-blue/20"
                  : isError
                    ? "text-accent-red font-semibold"
                    : ""
              }`}
              style={{ height: LINE_HEIGHT }}
            >
              {lineNum}
            </div>
          );
        })}
      </div>

      <div className="relative flex-1 min-w-0">
        <div
          className="absolute inset-0 py-4 pl-4 pr-4 pointer-events-none font-mono text-sm overflow-hidden"
          aria-hidden
        >
          {lines.map((line, i) => {
            const lineNum = i + 1;
            if (!highlightSet.has(lineNum)) return null;
            return (
              <div
                key={lineNum}
                className="absolute left-0 right-0 bg-accent-red/15 border-l-2 border-accent-red"
                style={{
                  top: 16 + (lineNum - 1) * LINE_HEIGHT,
                  height: LINE_HEIGHT,
                }}
              />
            );
          })}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          className="code-editor-input w-full h-full bg-transparent text-text-light p-4 pl-4 font-mono text-sm resize-none focus:outline-none relative z-10"
          spellCheck={false}
          style={{ lineHeight: `${LINE_HEIGHT}px` }}
        />

        {activeArrowLine && arrowLabel && (
          <div
            className="validation-arrow pointer-events-none absolute z-20 flex items-center gap-2"
            style={{ top: 16 + (activeArrowLine - 1) * LINE_HEIGHT - 4 }}
          >
            <div className="flex items-center -ml-2">
              <span className="text-accent-blue text-lg animate-pulse">◀</span>
            </div>
            <span className="validation-arrow-label text-xs font-semibold text-accent-blue bg-accent-blue/15 border border-accent-blue/50 px-2 py-1 rounded-md whitespace-nowrap max-w-[220px] truncate shadow-neon-blue">
              {arrowLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
