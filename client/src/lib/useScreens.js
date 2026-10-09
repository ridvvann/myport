import { useEffect, useState } from "react";

/* Drives the "one screen at a time" feel of the home page.
   - every `.screen` gets `.screen-in` while it is on screen, so its
     [data-r] children play their entrance (and replay when you come back)
   - every `.screen` gets --sp (-1…1, where it sits relative to the
     viewport centre) and --sa (|--sp|) for scroll-linked parallax
   - sections marked [data-screen] feed the side dots (active index)
   Everything is skipped for visitors who prefer reduced motion. */
export default function useScreens(dep) {
  const [active, setActive] = useState(0);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const screens = [...document.querySelectorAll(".screen")];
    const named = [...document.querySelectorAll("[data-screen]")];

    setItems(named.map((el) => ({ id: el.id, label: el.dataset.screen })));
    root.classList.add("snap-y");
    if (!reduce) root.classList.add("js-reveal");

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("screen-in", e.isIntersecting)),
      { rootMargin: "-12% 0px -12% 0px", threshold: 0 }
    );
    screens.forEach((s) => io.observe(s));

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (!reduce) {
        screens.forEach((s) => {
          const r = s.getBoundingClientRect();
          const c = r.top + r.height / 2;
          const sp = Math.max(-1, Math.min(1, (c - vh / 2) / (vh * 0.75)));
          s.style.setProperty("--sp", sp.toFixed(3));
          s.style.setProperty("--sa", Math.abs(sp).toFixed(3));
        });
      }
      let best = 0;
      let bestVisible = -1;
      named.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (visible > bestVisible) { bestVisible = visible; best = i; }
      });
      setActive(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.classList.remove("snap-y", "js-reveal");
    };
  }, [dep]);

  return { active, items };
}
