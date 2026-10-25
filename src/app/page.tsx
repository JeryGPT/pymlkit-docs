import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@/components/Code";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { HeroTerminal } from "@/components/HeroTerminal";
import { Install } from "@/components/Install";
import { LogoMark } from "@/components/Logo";


import { abs, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: ${SITE.tagline}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": abs("/#website"),
      url: abs("/"),
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": abs("/#software"),
      name: SITE.name,
      description: SITE.description,
      url: abs("/"),
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Windows, macOS, Linux, Web browser (WebAssembly)",
      softwareVersion: SITE.version,
      programmingLanguage: ["Python", "C"],
      license: "https://opensource.org/licenses/MIT",
      downloadUrl: SITE.pypi,
      installUrl: SITE.pypi,
      codeRepository: SITE.repo,
      sameAs: [SITE.repo, SITE.pypi],
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

const sample = `
from pymlkit import Network, Activations, Losses

model = Network(2)                        # 2 inputs
model.add_dense(16, Activations.ReLU)
model.add_dense(1, Activations.Sigmoid)
model.set_loss(Losses.HalfMSE)

model.fit(train_x, train_y, lr=0.1, epochs=100, batch=16)

print(model.forward([0.1, 0.2]))          # -> [0.93]
model.export("model.mlk")
`;

const features = [
  {
    title: "C core",
    body: "Dense layers, backprop and mini-batch SGD in plain C. Training runs at native speed, no interpreter in the hot loop.",
  },
  {
    title: "Zero dependencies",
    body: "No NumPy, no PyTorch. A wheel is a few kilobytes and the Python side is one small file you can read in minutes.",
  },
  {
    title: "Seven methods",
    body: "Network, add_dense, set_loss, fit, forward, backward, export and load. The whole API fits in your head.",
  },
  {
    title: "Runs in the browser",
    body: "Ships a WebAssembly wheel. Pyodide installs it with micropip, so you can train a network without leaving this site.",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Header />
      <main>
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 h-7 pl-1.5 pr-3 rounded-full border border-line-strong text-xs text-muted">
              <LogoMark size={16} />
              v0.1.1 · MIT licensed
            </div>
            <h1 className="mt-6 text-5xl sm:text-[3.4rem] font-semibold tracking-[-0.04em] leading-[1.04]">
              Neural networks in a few lines of Python.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted leading-relaxed">
              pymlkit is a dependency-free multi-layer perceptron library. A C core for speed, a
              thin Python wrapper for comfort.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Install />
              <Link
                href="/try/"
                className="inline-flex items-center h-11 px-5 rounded-lg bg-brand text-white text-sm font-medium hover:brightness-110 transition"
              >
                Try it in the browser
              </Link>
              <Link
                href="/docs/introduction/"
                className="inline-flex items-center h-11 px-3 text-sm text-muted hover:text-fg transition-colors"
              >
                Read the docs →
              </Link>
            </div>
          </div>
          <HeroTerminal />
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Define, fit, predict.</h2>
            <p className="mt-4 text-muted leading-relaxed max-w-md">
              Stack dense layers, pick a loss, call <code className="font-mono text-fg">fit</code>.
              Flat Python lists in, flat Python lists out. Save weights to a compact binary file and
              load them back later.
            </p>
            <Link
              href="/docs/quickstart/"
              className="mt-6 inline-block text-sm text-brand hover:underline underline-offset-4"
            >
              Quickstart →
            </Link>
          </div>
          <Code code={sample} bare />
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-line rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-line">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-surface/50">
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between text-xs text-dim">
            <span>pymlkit · MIT</span>
            <a
              href="https://pypi.org/project/pymlkit/"
              className="hover:text-fg transition-colors"
            >
              PyPI
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
