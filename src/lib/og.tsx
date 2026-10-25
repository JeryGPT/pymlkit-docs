import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${SITE.name}: ${SITE.tagline}`;

/** 1200x630 share card: the official logo, the pitch and the install command. */
export async function renderOg() {
  const png = await readFile(path.join(process.cwd(), "pymlkitbar.png"));
  const logo = `data:image/png;base64,${png.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        background: "#050506", // matches the logo file's own near-black background
        color: "#ececf1",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: rendered by ImageResponse, not the DOM */}
      <img src={logo} alt="" width={560} height={158} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2 }}>
          Neural networks in a few lines of Python.
        </div>
        <div style={{ marginTop: 22, fontSize: 30, color: "#8b8b98" }}>
          Dependency-free. C core. Runs in your browser.
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            padding: "14px 26px",
            border: "2px solid #2b2b36",
            borderRadius: 14,
            fontSize: 32,
            color: "#ececf1",
            background: "#0f0f13",
          }}
        >
          <span style={{ color: "#5c5c69", marginRight: 16 }}>$</span>pip install pymlkit
        </div>
      </div>
    </div>,
    ogSize,
  );
}
