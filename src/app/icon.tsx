import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

// Source pixels of pymlkitbar.png (1254x354): the node-cluster icon.
const SRC = { width: 1254, height: 354, iconCenterX: 180, iconCenterY: 178, iconWidth: 270 };

/** App icon / favicon, cropped from the official logo at build time. */
export default async function Icon() {
  const png = await readFile(path.join(process.cwd(), "pymlkitbar.png"));
  const src = `data:image/png;base64,${png.toString("base64")}`;
  const k = 204 / SRC.iconWidth;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#050506",
        borderRadius: 56,
        overflow: "hidden",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: rendered by ImageResponse, not the DOM */}
      <img
        src={src}
        alt=""
        width={SRC.width * k}
        height={SRC.height * k}
        style={{
          position: "absolute",
          left: size.width / 2 - SRC.iconCenterX * k,
          top: size.height / 2 - SRC.iconCenterY * k,
        }}
      />
    </div>,
    size,
  );
}
