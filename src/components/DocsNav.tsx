"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { groups, pages } from "@/content/docs/pages";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname().replace(/\/?$/, "/");
  return (
    <nav className="text-sm">
      {groups.map((g) => (
        <div key={g} className="mb-6">
          <div className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-dim">
            {g}
          </div>
          {pages
            .filter((p) => p.group === g)
            .map((p) => {
              const href = `/docs/${p.slug}/`;
              const active = path === href || (path === "/docs/" && p.slug === "introduction");
              return (
                <Link
                  key={p.slug}
                  href={href}
                  onClick={onNavigate}
                  className={`block px-3 py-1.5 rounded-md transition-colors ${
                    active
                      ? "bg-raised text-fg shadow-[inset_2px_0_0_var(--brand)]"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {p.title}
                </Link>
              );
            })}
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-4">
        <NavList />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden sticky top-14 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-5 flex items-center justify-between text-sm text-muted"
      >
        <span>Menu</span>
        <span className="font-mono">{open ? "×" : "≡"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 max-h-[70vh] overflow-y-auto border-t border-line pt-4">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export function Toc() {
  const path = usePathname();
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: rescan headings whenever the route changes
  useEffect(() => {
    const hs = Array.from(document.querySelectorAll<HTMLElement>(".prose-doc h2[id]"));
    setItems(hs.map((h) => ({ id: h.id, text: h.textContent ?? "" })));
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-72px 0px -70% 0px" },
    );
    for (const h of hs) io.observe(h);
    return () => io.disconnect();
  }, [path]);

  if (!items.length) return null;
  return (
    <aside className="hidden xl:block w-52 shrink-0">
      <div className="sticky top-14 py-8 pl-4">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-dim">
          On this page
        </div>
        <ul className="text-[13px] border-l border-line">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                className={`block -ml-px pl-3 py-1 border-l transition-colors ${
                  active === i.id
                    ? "border-brand text-fg"
                    : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {i.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
