import { useEffect } from "react";

/* Muted background videos are cheap one at a time, but this site can
   have several stacked in the feed at once — decoding all of them
   simultaneously is exactly what causes scroll jank. This pauses a
   video the moment it leaves the viewport and resumes it the moment it
   re-enters, so only what's actually visible is ever being decoded. */
export function useAutoplayInView(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play?.().catch(() => {});
        } else {
          el.pause?.();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
