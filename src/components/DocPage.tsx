import Link from "next/link";
import { type DocPage as Page, pages } from "@/content/docs/pages";

export function DocPage({ page }: { page: Page }) {
  const i = pages.indexOf(page);
  const prev = pages[i - 1];
  const next = pages[i + 1];
  return (
    <article>
      <div className="text-xs font-medium text-brand">{page.group}</div>
      <div className="prose-doc mt-2">
        <h1>{page.title}</h1>
        <p className="!text-lg !text-muted">{page.description}</p>
        {page.body()}
      </div>
      <div className="mt-16 pt-6 border-t border-line grid grid-cols-2 gap-4 text-sm">
        {prev ? (
          <Link
            href={`/docs/${prev.slug}/`}
            className="rounded-lg border border-line px-4 py-3 hover:border-line-strong transition-colors"
          >
            <div className="text-xs text-dim">Previous</div>
            <div className="mt-0.5">{prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/docs/${next.slug}/`}
            className="rounded-lg border border-line px-4 py-3 text-right hover:border-line-strong transition-colors"
          >
            <div className="text-xs text-dim">Next</div>
            <div className="mt-0.5">{next.title}</div>
          </Link>
        )}
      </div>
    </article>
  );
}
