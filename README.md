# pymlkit docs

Documentation site and in-browser playground for [pymlkit](https://github.com/JeryGPT/Multi-Layer-Perceptron-Kit), a small neural network library with a C core. Built with Next.js (static export), Tailwind 4, Monaco and Pyodide.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

## Before deploying: set the site URL

Canonical URLs, the sitemap, `robots.txt` and the Open Graph tags need the real origin. Set it when you build:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build
```

If it is unset, the build warns and falls back to `http://localhost:3000`, which you do not want in production.

Asset paths (`/py-worker.js`, `/mnist/...`) are absolute, so deploy at the root of a domain (Vercel, Netlify, Cloudflare Pages, a custom domain), not under a subpath.

## Layout

- `src/content/docs/pages.tsx`: the docs pages. `seo.ts` next to it holds each page's search title and description.
- `src/content/api.ts`: the pymlkit API as data. It drives the editor's autocomplete, hover and signature help; keep it in step with `network.py`.
- `src/content/examples.ts`: the playground examples.
- `public/py-worker.js`: the Pyodide worker (installs pymlkit with micropip, streams output, renders Matplotlib figures).
- `public/mnist/`: gzipped MNIST digits used by the MNIST example.
- `pymlkitbar.png`: the official logo. The app icon and share card are generated from it at build time.
