import { useEffect } from "react";

/* ---------- Sets --scroll (0 → 1, page progress) on <html> once, via a
   single rAF-throttled passive scroll listener shared by every effect
   that reacts to scrolling (this layer's grid/blobs/lines, the peek
   photo's drift). Only a CSS custom property is written each frame —
   no layout reads/writes in the loop — so it stays smooth even on long
   pages full of media. ---------- */
function useScrollProgress() {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty("--scroll", progress.toFixed(4));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

/* ---------- Fixed, pointer-events-none background layer: a faint grid,
   two soft blurred shadow blobs, and three curved lines that drift as
   you scroll. Everything here only ever animates `transform`/`opacity`
   (GPU-composited, no reflow), so it never competes with scrolling or
   media decoding for the main thread. ---------- */
export default function SiteDecor() {
  useScrollProgress();

  return (
    <div className="site-decor" aria-hidden="true">
      <div className="decor-grid" />
      <div className="decor-blob decor-blob-a" />
      <div className="decor-blob decor-blob-b" />
      <svg
        className="decor-lines"
        viewBox="0 0 1440 1600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="decor-line decor-line-1"
          d="M -100 220 C 280 40, 620 380, 980 160 S 1680 260, 1920 90"
        />
        <path
          className="decor-line decor-line-2"
          d="M -100 880 C 260 680, 700 1040, 1040 830 S 1660 940, 1920 720"
        />
        <path
          className="decor-line decor-line-3"
          d="M -100 1440 C 300 1260, 660 1600, 1040 1380 S 1660 1500, 1920 1280"
        />
      </svg>
    </div>
  );
}
