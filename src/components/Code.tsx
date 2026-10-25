"use client";

import { useState } from "react";

const KW = new Set(
  "from import as def class return if else elif for in while not and or is None True False with try except raise lambda pass break continue".split(" "),
);
const BI = new Set("print range len float int str list dict set open sum min max abs round zip enumerate".split(" "));

type Tok = { t: string; c?: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  const re =
    /(#[^\n]*)|("""[\s\S]*?"""|'[^'\n]*'|"[^"\n]*"|f"[^"\n]*")|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_][A-Za-z_0-9]*)|(\s+|[^\sA-Za-z_0-9#"']+)/g;
  let m: RegExpExecArray | null;
  let prev = "";
  while ((m = re.exec(src))) {
    if (m[1]) out.push({ t: m[1], c: "tok-com" });
    else if (m[2]) out.push({ t: m[2], c: "tok-str" });
    else if (m[3]) out.push({ t: m[3], c: "tok-num" });
    else if (m[4]) {
      const w = m[4];
      const next = src[re.lastIndex];
      let c: string | undefined;
      if (KW.has(w)) c = "tok-kw";
      else if (prev === "class" || /^[A-Z]/.test(w)) c = "tok-cls";
      else if (prev === "def" || next === "(") c = BI.has(w) ? "tok-bi" : "tok-fn";
      out.push({ t: w, c });
      prev = w;
      continue;
    } else out.push({ t: m[5] });
    if (m[5] && m[5].trim()) prev = "";
  }
  return out;
}

export function Highlight({ code, lang }: { code: string; lang: string }) {
  if (lang !== "python" && lang !== "py") return <>{code}</>;
  return (
    <>
      {tokenize(code).map((k, i) =>
        k.c ? (
          <span key={i} className={k.c}>
            {k.t}
          </span>
        ) : (
          k.t
        ),
      )}
    </>
  );
}

export function Code({
  code,
  lang = "python",
  title,
  bare = false,
}: {
  code: string;
  lang?: string;
  title?: string;
  /** No title bar: just the code, with a copy button in the corner. */
  bare?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = code.replace(/^\n/, "").replace(/\s+$/, "");
  const copyButton = (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className="text-[11px] font-mono text-dim hover:text-fg transition-colors"
    >
      {copied ? "copied" : "copy"}
    </button>
  );

  return (
    <div className="group relative mt-5 rounded-lg border border-line bg-surface overflow-hidden">
      {bare ? (
        <div className="absolute top-2.5 right-3 z-10">{copyButton}</div>
      ) : (
        <div className="flex items-center justify-between h-9 px-3 border-b border-line text-[11px] text-dim font-mono">
          <span>{title ?? lang}</span>
          {copyButton}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-[13px] leading-[1.65] font-mono text-[#d6d6e0]">
        <code>
          <Highlight code={text} lang={lang} />
        </code>
      </pre>
    </div>
  );
}
