import { useEffect, useRef, useState } from "react";

/* Every one of these is a real, safe spot in the page margin — outside
   the 1180px content column — so the photo never sits on top of text or
   a tap target. One is picked at random on every page load, so where
   "it's me" shows up is different (and totally random) each visit. */
const SPOTS = [
  { anchor: "#top", side: "right", v: "top", rotate: -7, caption: "hey — it's me" },
  { anchor: "#about", side: "left", v: "middle", rotate: 5, caption: "hi 👋" },
  { anchor: "#services", side: "right", v: "middle", rotate: -6, caption: "also me" },
  { anchor: "#work", side: "left", v: "top", rotate: 8, caption: "still me" },
  { anchor: "#work", side: "right", v: "bottom", rotate: -4, caption: "not a stock photo" },
];

export default function PeekPhoto() {
  const [spot] = useState(() => SPOTS[Math.floor(Math.random() * SPOTS.length)]);
  const [visible, setVisible] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const target = document.querySelector(spot.anchor);
    if (!target) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [spot]);

  return (
    <div
      ref={wrapRef}
      className={`peek-photo peek-${spot.side} peek-${spot.v}${visible ? " peek-visible" : ""}`}
      style={{ "--peek-rotate": `${spot.rotate}deg` }}
      aria-hidden="true"
    >
      <div className="peek-frame">
        {!imgFailed && (
          <img
            src="/peek.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        )}
        {imgFailed && <span className="peek-fallback">SA</span>}
      </div>
      <span className="peek-caption">{spot.caption}</span>
    </div>
  );
}
