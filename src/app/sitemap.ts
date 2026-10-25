import type { MetadataRoute } from "next";
import { pages } from "@/content/docs/pages";
import { abs } from "@/lib/site";

export const dynamic = "force-static";

// /docs/ is left out on purpose: it renders the introduction and canonicalises to it.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: abs("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: abs("/try/"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...pages.map((p) => ({
      url: abs(`/docs/${p.slug}/`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.slug === "introduction" || p.slug === "quickstart" ? 0.9 : 0.7,
    })),
  ];
}
