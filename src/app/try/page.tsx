import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Playground } from "@/components/Playground";
import { abs, OG_IMAGE, SITE } from "@/lib/site";

const title = "Try pymlkit: Python neural network playground";
const description =
  "Run Python neural network code in your browser with pymlkit, Pyodide and a Monaco editor. Nothing to install: train XOR, a circle classifier and MNIST.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/try/" },
  openGraph: { type: "website", title, description, url: "/try/", siteName: SITE.name, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "pymlkit playground",
  description,
  url: abs("/try/"),
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (runs in the browser)",
  browserRequirements: "Requires WebAssembly and JavaScript",
  isAccessibleForFree: true,
  isPartOf: { "@id": abs("/#website") },
  about: { "@id": abs("/#software") },
};

export default function TryPage() {
  return (
    <div className="h-dvh flex flex-col">
      <JsonLd data={jsonLd} />
      <Header flush />
      <h1 className="sr-only">Try pymlkit in your browser</h1>
      <Playground />
    </div>
  );
}
