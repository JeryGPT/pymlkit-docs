"use client";

import { useState } from "react";

export function Install({ cmd = "pip install pymlkit" }: { cmd?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(cmd);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className="inline-flex items-center gap-3 h-11 px-4 rounded-lg border border-line-strong bg-surface font-mono text-sm hover:border-brand/60 transition-colors"
    >
      <span className="text-dim">$</span>
      <span>{cmd}</span>
      <span className="text-[11px] text-dim w-10 text-right">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
