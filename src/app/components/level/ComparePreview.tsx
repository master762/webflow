"use client";

import { useEffect, useRef } from "react";

interface ComparePreviewProps {
  userHtml: string;
  userCss: string;
  expectedHtml: string;
  expectedCss: string;
}

function writePreview(
  iframe: HTMLIFrameElement | null,
  html: string,
  css: string,
) {
  if (!iframe) return;
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    margin: 0; padding: 20px;
    font-family: Arial, sans-serif;
    background: white;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  ${css}
</style>
</head>
<body>${html}</body>
</html>`);
  doc.close();
}

export default function ComparePreview({
  userHtml,
  userCss,
  expectedHtml,
  expectedCss,
}: ComparePreviewProps) {
  const userRef = useRef<HTMLIFrameElement>(null);
  const expectedRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    writePreview(userRef.current, userHtml, userCss);
    writePreview(expectedRef.current, expectedHtml, expectedCss);
  }, [userHtml, userCss, expectedHtml, expectedCss]);

  return (
    <div className="compare-preview mt-4 p-4 rounded-xl border border-accent-red/40 bg-accent-red/5 animate-[fadeIn_0.4s_ease]">
      <h4 className="text-sm font-bold text-accent-red mb-3 flex items-center gap-2">
        <i className="fas fa-code-compare" />
        Сравнение: ваш код vs ожидаемый результат
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-text-dim mb-2 uppercase tracking-wide">
            Ваш результат
          </p>
          <div className="h-40 bg-white rounded-lg overflow-hidden border-2 border-accent-red/50">
            <iframe
              ref={userRef}
              title="Ваш результат"
              className="w-full h-full border-0"
            />
          </div>
        </div>
        <div>
          <p className="text-xs text-accent-green mb-2 uppercase tracking-wide flex items-center gap-1">
            <i className="fas fa-check-circle" />
            Ожидаемый результат
          </p>
          <div className="h-40 bg-white rounded-lg overflow-hidden border-2 border-accent-green/50">
            <iframe
              ref={expectedRef}
              title="Ожидаемый результат"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
