import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/docs/introduction/", label: "Docs" },
  { href: "/docs/network/", label: "API" },
  { href: "/try/", label: "Try" },
];

export function Header({ flush = false }: { flush?: boolean }) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-line bg-bg/80 backdrop-blur-md">
      <div
        className={`h-full flex items-center justify-between ${flush ? "px-4" : "mx-auto max-w-6xl px-5"}`}
      >
        <Link href="/" aria-label="pymlkit home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm text-muted">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-md hover:text-fg hover:bg-raised transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com/JeryGPT/Multi-Layer-Perceptron-Kit"
            className="px-3 py-1.5 rounded-md hover:text-fg hover:bg-raised transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
