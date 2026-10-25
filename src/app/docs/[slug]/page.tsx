import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/DocPage";
import { JsonLd } from "@/components/JsonLd";
import { pages } from "@/content/docs/pages";
import { docsSeoDescription, docsSeoTitle } from "@/content/docs/seo";
import { abs, OG_IMAGE, SITE } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = pages.find((p) => p.slug === slug);
  if (!page) return {};
  const title = docsSeoTitle[slug] ?? page.title;
  const description = docsSeoDescription[slug] ?? page.description;
  const url = `/docs/${slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, siteName: SITE.name, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages.find((p) => p.slug === slug);
  if (!page) notFound();

  const url = abs(`/docs/${slug}/`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: docsSeoTitle[slug] ?? page.title,
        description: docsSeoDescription[slug] ?? page.description,
        url,
        inLanguage: "en",
        about: { "@id": abs("/#software") },
        isPartOf: { "@id": abs("/#website") },
        mainEntityOfPage: url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE.name, item: abs("/") },
          { "@type": "ListItem", position: 2, name: "Docs", item: abs("/docs/introduction/") },
          { "@type": "ListItem", position: 3, name: page.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <DocPage page={page} />
    </>
  );
}
