// Module worker. Runs Pyodide off the main thread and installs pymlkit from PyPI with micropip.
const PYODIDE_VERSION = "314.0.7";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let booted = false;
self.postImage = (b64) => self.postMessage({ type: "image", src: `data:image/png;base64,${b64}` });

// Matplotlib runs headless (Agg). plt.show() and any figure still open at the end of a run
// are sent to the console as PNGs, styled to match the site.
const MPL_SETUP = `import os, sys, io, base64, types
os.environ["MPLBACKEND"] = "Agg"
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import warnings, js

# Matplotlib 3.10 warns about its own float image offsets; not actionable for users.
warnings.filterwarnings("ignore", category=matplotlib.MatplotlibDeprecationWarning)

matplotlib.rcParams.update({
    "figure.facecolor": "#0f0f13", "axes.facecolor": "#0f0f13", "savefig.facecolor": "#0f0f13",
    "axes.edgecolor": "#2b2b36", "axes.labelcolor": "#b4b4c0", "text.color": "#d6d6e0",
    "xtick.color": "#8b8b98", "ytick.color": "#8b8b98", "grid.color": "#1f1f27",
    "axes.grid": True, "axes.spines.top": False, "axes.spines.right": False,
    "axes.titlesize": 11, "axes.labelsize": 10, "font.size": 10, "legend.frameon": False,
    "figure.figsize": (6.4, 3.4), "figure.dpi": 100, "savefig.dpi": 160,
    "axes.prop_cycle": matplotlib.cycler(color=["#5b6bff", "#ffd43b", "#4b8bbe", "#4ade80", "#f87171"]),
})

def emit():
    sys.stdout.flush()
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", bbox_inches="tight", pad_inches=0.15)
        js.postImage(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")

plt.show = lambda *args, **kwargs: emit()
mod = types.ModuleType("_pg_mpl")
mod.emit = emit
sys.modules["_pg_mpl"] = mod
`;


const post = (type, data) => self.postMessage({ type, ...data });

// Terminal semantics for the raw stdout stream. The C core redraws its progress bar
// with a carriage return and flushes after every update, but Pyodide's `stdout:`
// option only fires at a newline. Read raw bytes instead: "\r" restarts the current
// line, "\n" commits it, and the line in progress is streamed to the console live.
const decoder = new TextDecoder();
const PROGRESS = /(\d+)% Epoch: (\d+)\/(\d+)/;
let cur = [];
let lastLive = 0;

const current = () => decoder.decode(new Uint8Array(cur));

function showLive(force) {
  const now = performance.now();
  if (!force && now - lastLive < 40) return;
  const text = current();
  if (!text) return;
  lastLive = now;
  post("live", { text });
  const m = PROGRESS.exec(text);
  if (m) {
    const [pct, epoch, total] = [Number(m[1]), Number(m[2]), Number(m[3])];
    post("progress", { frac: (epoch + pct / 100) / total, epoch: epoch + 1, total });
  }
}

function commitLine() {
  const text = current().trimEnd();
  post("out", { text });
  post("live", { text: "" });
  cur = [];
}

function onByte(b) {
  if (!booted) return; // hide Pyodide/micropip loading chatter
  if (b === 10) commitLine();
  else if (b === 13) {
    showLive(false);
    cur = [];
  } else cur.push(b);
}

async function init() {
  try {
    post("status", { state: "loading", text: "Loading Python" });
    const { loadPyodide } = await import(`${INDEX_URL}pyodide.mjs`);
    pyodide = await loadPyodide({
      indexURL: INDEX_URL,
      stderr: (s) => post("err", { text: s }),
    });
    pyodide.setStdout({ raw: onByte });
    post("status", { state: "installing", text: "Installing pymlkit" });
    await pyodide.loadPackage("micropip");
    await pyodide.runPythonAsync(`
import micropip
await micropip.install("pymlkit")
import pymlkit
`);
    booted = true;
    const version = pyodide.runPython("import sys, pymlkit; f'Python {sys.version.split()[0]} · pymlkit {pymlkit.__version__}'");
    post("ready", { version });
  } catch (e) {
    post("fatal", { text: String(e && e.message ? e.message : e) });
  }
}

self.onmessage = async (ev) => {
  if (ev.data.type !== "run" || !pyodide) return;
  post("status", { state: "running", text: "Running" });
  const ns = pyodide.globals.get("dict")();
  try {
    const usesMpl = /matplotlib/.test(ev.data.code);
    if (usesMpl) post("status", { state: "running", text: "Loading matplotlib" });
    await pyodide.loadPackagesFromImports(ev.data.code);
    if (usesMpl) {
      await pyodide.runPythonAsync(MPL_SETUP);
      post("status", { state: "running", text: "Running" });
    }
    const t0 = performance.now();
    await pyodide.runPythonAsync(ev.data.code, { globals: ns });
    pyodide.runPython(`
import sys
sys.stdout.flush()
m = sys.modules.get("_pg_mpl")
if m:
    m.emit()
`);
    if (cur.length) commitLine();
    post("done", { ms: Math.round(performance.now() - t0) });
  } catch (e) {
    // Drop Pyodide's internal frames, keep the user's traceback.
    const msg = String(e && e.message ? e.message : e);
    const i = msg.indexOf('File "<exec>"');
    post("error", {
      text: (i >= 0 ? `Traceback (most recent call last):\n  ${msg.slice(i)}` : msg).trim(),
    });
  } finally {
    if (cur.length) commitLine();
    ns.destroy();
  }
};

init();
