import type { ReactNode } from "react";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function H2({ children }: { children: string }) {
  return <h2 id={slugify(children)}>{children}</h2>;
}

export function Callout({ children, tone = "note" }: { children: ReactNode; tone?: "note" | "warn" }) {
  const color = tone === "warn" ? "var(--py-yellow)" : "var(--brand)";
  return (
    <div
      className="mt-5 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-[#b4b4c0] leading-relaxed [&_p]:mt-0 [&_p]:text-sm"
      style={{ borderLeft: `2px solid ${color}` }}
    >
      {children}
    </div>
  );
}

/** Method/class signature header used in the API reference. */
export function Sig({ children }: { children: string }) {
  return (
    <div className="mt-5 rounded-lg border border-line bg-surface px-4 py-3 font-mono text-[13px] text-fg overflow-x-auto whitespace-nowrap">
      {children}
    </div>
  );
}

export function Params({ rows }: { rows: [string, string, string][] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Parameter</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([n, t, d]) => (
          <tr key={n}>
            <td>
              <code>{n}</code>
            </td>
            <td className="font-mono text-xs text-muted">{t}</td>
            <td>{d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
