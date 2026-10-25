import type { Metadata } from "next";
import { DocPage } from "@/components/DocPage";
import { pages } from "@/content/docs/pages";

// /docs/ shows the introduction, which also lives at /docs/introduction/. Point search
// engines at that one so the content is not indexed twice.
export const metadata: Metadata = {
  alternates: { canonical: "/docs/introduction/" },
  robots: { index: false, follow: true },
};

export default function DocsIndex() {
  return <DocPage page={pages[0]} />;
}
