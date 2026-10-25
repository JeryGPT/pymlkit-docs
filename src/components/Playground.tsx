"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { examples, starter } from "@/content/examples";
import { registerPymlkit } from "./editorSupport";

type Tab = { id: string; label: string; code: string; custom?: boolean };

const STORE = "pymlkit:projects";

const loadProjects = (): Tab[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? "[]");
    return Array.isArray(raw)
      ? raw
          .filter((t) => t && typeof t.id === "string" && typeof t.code === "string")
          .map((t) => ({ ...t, custom: true }))
      : [];
  } catch {
    return [];
  }
};

const saveProjects = (tabs: Tab[]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(tabs.filter((t) => t.custom)));
  } catch {}
};

type Line = { kind: "out" | "err" | "sys" | "img"; text: string };
type State = "loading" | "installing" | "ready" | "running" | "failed";

const defineTheme: BeforeMount = (monaco) => {
  registerPymlkit(monaco);
  monaco.editor.defineTheme("pymlkit", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "c792ea" },
      { token: "string", foreground: "ffd43b" },
      { token: "number", foreground: "f78c6c" },
      { token: "comment", foreground: "5c5c69", fontStyle: "italic" },
      { token: "type.identifier", foreground: "7fd1ff" },
      { token: "identifier", foreground: "d6d6e0" },
    ],
    colors: {
      "editor.background": "#09090b",
      "editor.foreground": "#d6d6e0",
      "editorLineNumber.foreground": "#3a3a46",
      "editorLineNumber.activeForeground": "#8b8b98",
      "editor.lineHighlightBackground": "#0f0f13",
      "editor.selectionBackground": "#5b6bff44",
      "editorCursor.foreground": "#5b6bff",
      "editorIndentGuide.background1": "#1a1a22",
      "editorWidget.background": "#0f0f13",
      "scrollbarSlider.background": "#2b2b3660",
    },
  });
};

export function Playground() {
  const [tabs, setTabs] = useState<Tab[]>(examples);
  const [active, setActive] = useState(examples[0].id);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  const code = current.code;
  const [state, setState] = useState<State>("loading");
  const [status, setStatus] = useState("Loading Python");
  const [info, setInfo] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [live, setLive] = useState("");
  const [progress, setProgress] = useState<{ frac: number; epoch: number; total: number } | null>(null);

  const worker = useRef<Worker | null>(null);
  const codeRef = useRef(code);
  const stateRef = useRef(state);
  const outRef = useRef<HTMLDivElement>(null);
  codeRef.current = code;
  stateRef.current = state;

  // Restore saved projects after mount so the server HTML matches the first render.
  useEffect(() => {
    const saved = loadProjects();
    if (saved.length) setTabs((t) => [...t, ...saved]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProjects(tabs);
  }, [tabs, hydrated]);

  const setCode = (c: string) =>
    setTabs((ts) => ts.map((t) => (t.id === current.id ? { ...t, code: c } : t)));

  const addProject = () => {
    const n = tabs.filter((t) => t.custom).length + 1;
    const id = `project-${Date.now()}`;
    setTabs((ts) => [...ts, { id, label: `project ${n}`, code: starter, custom: true }]);
    setActive(id);
  };

  const closeProject = (id: string) => {
    if (!window.confirm("Delete this project?")) return;
    setTabs((ts) => ts.filter((t) => t.id !== id));
    if (active === id) setActive(examples[0].id);
  };

  const renameProject = (id: string, label: string) => {
    const name = label.trim();
    if (name) setTabs((ts) => ts.map((t) => (t.id === id ? { ...t, label: name } : t)));
    setRenaming(null);
  };

  const push = useCallback((kind: Line["kind"], text: string) => {
    setLines((l) => [...l, { kind, text }]);
  }, []);

  const start = useCallback(() => {
    worker.current?.terminate();
    setState("loading");
    setStatus("Loading Python");
    const w = new Worker("/py-worker.js", { type: "module" });
    worker.current = w;
    w.onmessage = (ev) => {
      const d = ev.data;
      switch (d.type) {
        case "status":
          setState(d.state);
          setStatus(d.text);
          break;
        case "ready":
          setState("ready");
          setInfo(d.version);
          break;
        case "progress":
          setProgress({ frac: d.frac, epoch: d.epoch, total: d.total });
          break;
        case "image":
          push("img", d.src);
          break;
        case "live":
          setLive(d.text);
          break;
        case "out":
          push("out", d.text);
          break;
        case "err":
          push("err", d.text);
          break;
        case "done":
          setProgress(null);
          setLive("");
          setState("ready");
          push("sys", `finished in ${d.ms} ms`);
          break;
        case "error":
          setProgress(null);
          setLive("");
          setState("ready");
          push("err", d.text);
          break;
        case "fatal":
          setState("failed");
          push("err", d.text);
          break;
      }
    };
  }, [push]);

  useEffect(() => {
    start();
    return () => worker.current?.terminate();
  }, [start]);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, live]);

  const run = useCallback(() => {
    if (stateRef.current !== "ready") return;
    setLines([]);
    setLive("");
    setProgress(null);
    worker.current?.postMessage({ type: "run", code: codeRef.current });
  }, []);
  const runRef = useRef(run);
  runRef.current = run;

  const stop = () => {
    push("sys", "stopped");
    setLive("");
    setProgress(null);
    start();
  };

  const onMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runRef.current());
  };

  const busy = state === "loading" || state === "installing";
  const running = state === "running";

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="relative h-10 shrink-0 flex items-center border-b border-line text-[13px]">
        <div
          aria-hidden
          className="absolute left-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-brand to-pyyellow transition-[width] duration-300 ease-out"
          style={{ width: progress && running ? `${progress.frac * 100}%` : 0 }}
        />
        <div className="flex h-full overflow-x-auto">
          {tabs.map((t) => (
            <div
              key={t.id}
              className={`flex items-center h-full border-r border-line transition-colors ${
                active === t.id
                  ? "text-fg bg-surface shadow-[inset_0_-2px_0_var(--brand)]"
                  : "text-muted hover:text-fg"
              }`}
            >
              {renaming === t.id ? (
                <input
                  // biome-ignore lint/a11y/noAutofocus: inline rename needs focus
                  autoFocus
                  defaultValue={t.label}
                  maxLength={24}
                  onBlur={(e) => renameProject(t.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-28 mx-2 bg-transparent outline-none border-b border-brand text-fg"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setActive(t.id)}
                  onDoubleClick={() => t.custom && setRenaming(t.id)}
                  title={t.custom ? "Double-click to rename" : undefined}
                  className="px-4 h-full whitespace-nowrap"
                >
                  {t.label}
                </button>
              )}
              {t.custom && renaming !== t.id && (
                <button
                  type="button"
                  aria-label={`Delete ${t.label}`}
                  onClick={() => closeProject(t.id)}
                  className="-ml-2 mr-2 px-1 text-dim hover:text-[var(--err)] transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            aria-label="New project"
            title="New project"
            className="px-4 h-full text-muted hover:text-fg transition-colors"
          >
            +
          </button>
        </div>
        <div className="ml-auto flex h-full items-center">
          <span className="hidden sm:flex items-center gap-2 px-4 text-xs text-dim font-mono">
            <span
              className={`size-1.5 rounded-full ${
                state === "failed"
                  ? "bg-[var(--err)]"
                  : busy || running
                    ? "bg-pyyellow animate-pulse"
                    : "bg-[var(--ok)]"
              }`}
            />
            {progress && running
              ? `training epoch ${Math.min(progress.epoch, progress.total)}/${progress.total} · ${Math.round(progress.frac * 100)}%`
              : state === "ready"
                ? info
                : state === "failed"
                  ? "failed to load"
                  : `${status}…`}
          </span>
          <button
            type="button"
            onClick={() => setLines([])}
            className="px-4 h-full border-l border-line text-muted hover:text-fg transition-colors"
          >
            Clear
          </button>
          {running ? (
            <button
              type="button"
              onClick={stop}
              className="px-5 h-full border-l border-line text-[var(--err)] hover:bg-raised transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={run}
              disabled={state !== "ready"}
              className="px-5 h-full bg-brand text-white font-medium disabled:bg-raised disabled:text-dim transition-colors"
            >
              Run <span className="hidden sm:inline text-white/60 font-normal ml-1">Ctrl ⏎</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-[3fr_2fr] lg:grid-rows-1 lg:grid-cols-2">
        <div className="min-h-0 min-w-0">
          <Editor
            height="100%"
            language="python"
            theme="pymlkit"
            path={current.id}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            beforeMount={defineTheme}
            onMount={onMount}
            loading={<div className="p-4 text-xs text-dim font-mono">Loading editor…</div>}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              lineHeight: 21,
              padding: { top: 14, bottom: 14 },
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              tabSize: 4,
              automaticLayout: true,
            }}
          />
        </div>
        <div
          ref={outRef}
          className="min-h-0 min-w-0 overflow-auto border-t lg:border-t-0 lg:border-l border-line bg-surface font-mono text-[13px] leading-[1.6] p-4"
        >
          {lines.length === 0 && !live ? (
            <span className="text-dim">
              {busy
                ? `${status}…  first load downloads the Python runtime`
                : state === "failed"
                  ? ""
                  : "Press Run to execute."}
            </span>
          ) : (
            lines.map((l, i) =>
              l.kind === "img" ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only log
                // biome-ignore lint/performance/noImgElement: data URL from the worker
                <img key={i} src={l.text} alt="Matplotlib figure" className="my-3 max-w-full rounded-md border border-line" />
              ) : (
              <pre
                // biome-ignore lint/suspicious/noArrayIndexKey: append-only log
                key={i}
                className={`whitespace-pre-wrap break-words ${
                  l.kind === "err"
                    ? "text-[var(--err)]"
                    : l.kind === "sys"
                      ? "text-dim mt-1"
                      : "text-[#d6d6e0]"
                }`}
              >
                {l.text || " "}
              </pre>
              ),
            )
          )}
          {live && <pre className="whitespace-pre-wrap break-words text-[#d6d6e0]">{live}</pre>}
        </div>
      </div>
    </div>
  );
}
