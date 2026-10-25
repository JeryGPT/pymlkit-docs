import bar from "../../pymlkitbar.png";

// The official logo has a near-black background. `mix-blend-lighten` lets the page
// background win wherever the image is darker, so no transparent copy is needed.
const blend = "mix-blend-lighten select-none";

/** Full logo: node-cluster icon + wordmark. */
export function Logo({ height = 36 }: { height?: number }) {
  return (
    // biome-ignore lint/performance/noImgElement: static export, unoptimized images
    <img
      src={bar.src}
      alt="pymlkit"
      draggable={false}
      className={`w-auto ${blend}`}
      style={{ height }}
    />
  );
}

// Where the icon sits inside pymlkitbar.png (source pixels).
const ICON = { x: 45, width: 270, centerY: 178 };

/** Just the node-cluster icon, cropped from the official logo. */
export function LogoMark({ size = 24 }: { size?: number }) {
  const k = size / ICON.width;
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* biome-ignore lint/performance/noImgElement: static export, unoptimized images */}
      <img
        src={bar.src}
        alt=""
        draggable={false}
        className={`absolute max-w-none ${blend}`}
        style={{
          width: bar.width * k,
          height: bar.height * k,
          left: -ICON.x * k,
          top: size / 2 - ICON.centerY * k,
        }}
      />
    </span>
  );
}
