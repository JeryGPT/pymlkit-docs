# pymlkit docs site — design

Approved in chat 2026-10-25.

- Next.js 15 static export, Tailwind 4, Geist. Content as typed TSX, no MDX.
- Palette: near-black, hairline borders, brand blue from the logo, Python blue/yellow as sparing accents.
- Logo: SVG perceptron-graph mark (3 inputs -> 1 output) + `pyml`/`kit` wordmark; also the favicon.
- `/` landing: hero + install copy + code sample + feature row + CTA.
- `/docs/[slug]` sidebar docs: introduction, installation, quickstart, network, activations, losses, training, saving-loading, custom-loops, notes. Per-page TOC, mobile drawer.
- `/try`: flush Monaco editor + console, no padding blocks. Pyodide 314.0.7 in a Web Worker, `micropip.install("pymlkit")` (PyPI wasm wheel `pyemscripten_2026_0_wasm32`, verified in Node). Run / Stop / examples.
- Console filters the C progress bar (carriage-return spam).
- Verify: `next build` + browser run of /try.
