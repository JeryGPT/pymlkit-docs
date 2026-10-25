import type { CSSProperties } from "react";

// A terminal replaying a real pymlkit run (XOR, 300 epochs). The numbers are the library's
// actual output; only the reveal is animated, in CSS (see .term-* in globals.css).

type Row =
  | { kind: "cmd"; text: string }
  | { kind: "bar"; epoch: number; loss: string }
  | { kind: "plain"; text: string }
  | { kind: "pred"; input: string; value: string }
  | { kind: "prompt" };

const rows: Row[] = [
  { kind: "cmd", text: "pip install pymlkit" },
  { kind: "plain", text: "Successfully installed pymlkit-0.1.1" },
  { kind: "cmd", text: "python xor.py" },
  { kind: "bar", epoch: 0, loss: "0.117050" },
  { kind: "bar", epoch: 100, loss: "0.000218" },
  { kind: "bar", epoch: 200, loss: "0.000098" },
  { kind: "plain", text: "Finished training 300, 300 epochs" },
  { kind: "pred", input: "[0, 0]", value: "0.019" },
  { kind: "pred", input: "[0, 1]", value: "0.993" },
  { kind: "pred", input: "[1, 0]", value: "0.993" },
  { kind: "pred", input: "[1, 1]", value: "0.005" },
  { kind: "prompt" },
];

const TYPE_SPEED = 0.05; // seconds per typed character
const BAR_TIME = 0.9; // matches term-bar in globals.css

/** Start time (s) and typing duration of each row, so the reveal plays top to bottom. */
function schedule() {
  let t = 0.5;
  return rows.map((row) => {
    const start = t;
    let dur = 0;
    if (row.kind === "cmd") {
      dur = row.text.length * TYPE_SPEED;
      t += dur + 0.45; // typing, then a beat before "enter"
    } else if (row.kind === "bar") t += BAR_TIME + 0.1;
    else if (row.kind === "plain") t += 0.2;
    else t += 0.12;
    return { start, dur };
  });
}

const timing = schedule();

function Prompt() {
  return (
    <>
      <span className="font-semibold text-[#4ade80]">dev@pymlkit</span>
      <span className="text-muted">:</span>
      <span className="font-semibold text-[#6ea8fe]">~/xor</span>
      <span className="text-muted">$</span>{" "}
    </>
  );
}

function Line({ row, dur }: { row: Row; dur: number }) {
  switch (row.kind) {
    case "cmd":
      return (
        <>
          <Prompt />
          <span
            className="term-type text-fg"
            style={{ "--n": row.text.length, "--d": `${dur}s` } as CSSProperties}
          >
            {row.text}
          </span>
        </>
      );
    case "bar":
      return (
        <>
          <span className="text-dim">[</span>
          <span className="term-fill text-brand">==========</span>
          <span className="text-dim">]</span>{" "}
          <span className="text-muted">100% Epoch: {row.epoch}/300</span>{" "}
          <span className="text-pyyellow">Loss: {row.loss}</span>
        </>
      );
    case "plain":
      return <span className="text-muted">{row.text}</span>;
    case "pred":
      return (
        <>
          <span className="text-muted">{row.input}</span> <span className="text-dim">-&gt;</span>{" "}
          <span className="text-fg">{row.value}</span>
        </>
      );
    case "prompt":
      return (
        <>
          <Prompt />
          <span className="term-cursor" />
        </>
      );
  }
}

export function HeroTerminal() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--brand) 20%, transparent), transparent)",
        }}
      />
      <div className="rounded-xl border border-line-strong bg-[#08080a] overflow-hidden shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)]">
        <div className="relative flex items-center h-10 px-4 bg-surface border-b border-line">
          <span className="text-xs text-muted font-mono truncate">dev@pymlkit: ~/xor</span>
          <div className="ml-auto flex items-center gap-1.5 text-muted" aria-hidden>
            <span className="grid size-5 place-items-center rounded-full bg-raised">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M1 6h6" />
              </svg>
            </span>
            <span className="grid size-5 place-items-center rounded-full bg-raised">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="1" width="6" height="6" />
              </svg>
            </span>
            <span className="grid size-5 place-items-center rounded-full bg-raised">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M1 1l6 6M7 1L1 7" />
              </svg>
            </span>
          </div>
        </div>
        <pre
          className="px-5 py-4 min-h-[22.5rem] font-mono text-[13px] leading-[1.7] overflow-x-auto"
          aria-label="Example: installing pymlkit and training a network on XOR"
        >
          {rows.map((row, i) => (
            <div
              key={i}
              className="term-line"
              style={{ "--t": `${timing[i].start}s` } as CSSProperties}
            >
              <Line row={row} dur={timing[i].dur} />
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
