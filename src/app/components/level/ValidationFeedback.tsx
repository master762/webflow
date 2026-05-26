"use client";

import type { RuleCheckResult } from "@/lib/levelValidation";

interface ValidationFeedbackProps {
  failures: RuleCheckResult[];
  onJumpTo: (tab: "html" | "css", line: number) => void;
}

export default function ValidationFeedback({
  failures,
  onJumpTo,
}: ValidationFeedbackProps) {
  if (failures.length === 0) return null;

  return (
    <div className="validation-feedback mt-4 p-4 rounded-xl border border-accent-red/50 bg-accent-red/10">
      <h4 className="font-bold text-accent-red mb-3 flex items-center gap-2">
        <i className="fas fa-exclamation-triangle" />
        Что нужно исправить ({failures.length})
      </h4>
      <ul className="space-y-2">
        {failures.map((f, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onJumpTo(f.targetTab, f.line)}
              className="w-full text-left p-3 rounded-lg bg-black/30 border border-glass-border hover:border-accent-blue hover:bg-accent-blue/10 transition-all group"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-accent-red/20 text-accent-red flex items-center justify-center text-sm font-bold border border-accent-red/50">
                  {f.line}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-light group-hover:text-accent-blue transition-colors">
                    {f.message}
                  </p>
                  <p className="text-xs text-accent-blue mt-1 font-mono truncate">
                    <i className="fas fa-arrow-right mr-1" />
                    {f.arrowLabel}
                  </p>
                </div>
                <i className="fas fa-chevron-right text-text-dim group-hover:text-accent-blue mt-1" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
