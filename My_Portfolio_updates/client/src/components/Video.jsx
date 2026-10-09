import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMediaKind } from "../lib/media.js";

/* The "My Work" clips screen of the home page: a full-bleed, always-dark,
   black & white reel of the clips uploaded under the Video category
   (marketing, promotional, advertising, content creation). A coverflow: the clip in the
      middle plays, the rest tilt away and pause. Pointer-tilt + glare on
      the active clip, HUD brackets, REC badge, live progress bar.
   If there are no clips yet, a short "coming soon" screen shows instead. */
export default function Video({ projects = [] }) {
  const clips = useMemo(
    () =>
      projects
        .filter((p) => p.category === "video")
        .flatMap((p) => {
          const urls = (p.media_urls?.length ? p.media_urls : [p.media_url]).filter(Boolean);
          return urls.filter((u) => getMediaKind(u) === "video").map((url) => ({ url, project: p }));
        }),
    [projects]
  );

  return clips.length > 0 ? <ClipReel clips={clips} /> : <ClipsEmpty />;
}

const WORDS = ["Marketing", "Promotional", "Advertising", "Content creation"];

// Black & white backdrop: drifting white glow, scanlines, a vignette, and two
// rows of giant outlined words sliding in opposite directions.
function ReelBackdrop() {
  const row = (cls) => (
    <div className={`reel-words-row ${cls}`}>
      {[0, 1].map((c) => (
        <div className="reel-words-group" key={c}>
          {WORDS.map((w) => <span key={w}>{w}</span>)}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <div className="reel-glow" aria-hidden="true" />
      <div className="reel-words" aria-hidden="true">{row("reel-words-l")}{row("reel-words-r")}</div>
      <div className="reel-scan" aria-hidden="true" />
      <div className="reel-vignette" aria-hidden="true" />
    </>
  );
}

function ReelHead() {
  return (
    <div className="container reel-head">
      <p className="mono-label reel-label" data-r="up">
        <span className="reel-rec-dot" aria-hidden="true" /> my work
      </p>
      <h2 className="reel-title" aria-label="My Work">
        {"My Work".split("").map((ch, i) => (
          <span key={i} className="reel-letter" data-r="up" style={{ "--i": i + 1 }} aria-hidden="true">
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </h2>
      <p className="reel-sub" data-r="up" style={{ "--i": 9 }}>
        Short-form video made for brands — built to get attention and drive results.
      </p>
      <ul className="reel-tags" data-r="up" style={{ "--i": 10 }}>
        {WORDS.map((w) => <li key={w}>{w}</li>)}
      </ul>
    </div>
  );
}

function ClipsEmpty() {
  return (
    <section className="screen reel reel-empty" id="video" data-screen="Clips">
      <ReelBackdrop />
      <ReelHead />
      <p className="reel-soon" data-r="up" style={{ "--i": 11 }}>Clips are on the way — check back soon.</p>
    </section>
  );
}

function ClipReel({ clips }) {
  const stripRef = useRef(null);
  const cardRefs = useRef([]);
  const videoRefs = useRef([]);
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);

  // Coverflow maths: every card gets --d (-1…1 distance from the strip's
  // centre) and --a (|--d|); the CSS turns that into rotation/scale/fade.
  const layout = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const rect = strip.getBoundingClientRect();
    const centre = rect.left + rect.width / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dist = r.left + r.width / 2 - centre;
      const d = Math.max(-1, Math.min(1, dist / (r.width * 1.1)));
      el.style.setProperty("--d", d.toFixed(3));
      el.style.setProperty("--a", Math.abs(d).toFixed(3));
      if (Math.abs(dist) < bestDist) { bestDist = Math.abs(dist); best = i; }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    layout();
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; layout(); }); };
    const strip = stripRef.current;
    strip.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      strip.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [layout]);

  // Only the centred clip plays; sound only on that one, and only if asked.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      v.muted = !(sound && i === active);
      if (i === active) v.play().catch(() => { v.muted = true; setSound(false); });
      else v.pause();
    });
  }, [active, sound]);

  const go = (i) => {
    const el = cardRefs.current[Math.max(0, Math.min(clips.length - 1, i))];
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const tilt = (e, el) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((x - 0.5) * 14).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  };
  const untilt = (el) => {
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };

  return (
    <section className="screen reel" id="video" data-screen="Clips">
      <ReelBackdrop />
      <ReelHead />

      <div className="reel-stage" data-r="wipe" style={{ "--i": 3 }}>
        <div className="reel-strip" ref={stripRef} tabIndex={0} aria-label="Clips"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
          }}>
          {clips.map((c, i) => (
            <figure
              key={c.url + i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`reel-card${i === active ? " reel-card-on" : ""}`}
              onPointerMove={(e) => i === active && tilt(e, e.currentTarget)}
              onPointerLeave={(e) => untilt(e.currentTarget)}
              onClick={() => (i === active ? setSound((s) => !s) : go(i))}
            >
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={`${c.url}#t=0.1`}
                muted loop playsInline preload="metadata"
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  const bar = v.parentElement.querySelector(".reel-progress i");
                  if (bar && v.duration) bar.style.transform = `scaleX(${v.currentTime / v.duration})`;
                }}
              />
              <span className="reel-glare" aria-hidden="true" />
              <span className="reel-hud reel-hud-tl" aria-hidden="true" />
              <span className="reel-hud reel-hud-tr" aria-hidden="true" />
              <span className="reel-hud reel-hud-bl" aria-hidden="true" />
              <span className="reel-hud reel-hud-br" aria-hidden="true" />
              <span className="reel-badge"><span className="reel-rec-dot" aria-hidden="true" />CLIP · {String(i + 1).padStart(2, "0")}</span>
              <figcaption className="reel-caption">
                <strong>{c.project.title}</strong>
                {i === active && (
                  <span className="reel-sound">{sound ? "🔊 tap to mute" : "🔇 tap for sound"}</span>
                )}
              </figcaption>
              <span className="reel-progress" aria-hidden="true"><i /></span>
            </figure>
          ))}
        </div>

        {clips.length > 1 && (
          <div className="reel-controls">
            <button type="button" className="reel-arrow" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous clip">←</button>
            <div className="reel-dots">
              {clips.map((_, i) => (
                <button key={i} type="button" className={`reel-pip${i === active ? " reel-pip-on" : ""}`} onClick={() => go(i)} aria-label={`Clip ${i + 1}`} />
              ))}
            </div>
            <button type="button" className="reel-arrow" onClick={() => go(active + 1)} disabled={active === clips.length - 1} aria-label="Next clip">→</button>
          </div>
        )}
      </div>
    </section>
  );
}
