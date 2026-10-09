import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tiktokHandle } from "../data/projects.js";
import { getMediaKind } from "../lib/media.js";

/* The last two screens of the home page:
   1. "Outplayed" — a full-bleed, always-dark cinema reel of the clips
      uploaded under the Video category. A coverflow: the clip in the
      middle plays, the rest tilt away and pause. Pointer-tilt + glare on
      the active clip, HUD brackets, REC badge, live progress bar.
   2. The TikTok profile, borderless.
   If there are no clips yet, only the TikTok screen shows. */
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

  return (
    <>
      {clips.length > 0 && <ClipReel clips={clips} />}
      <TikTokScreen id={clips.length > 0 ? "tiktok" : "video"} />
    </>
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
    <section className="screen reel" id="video" data-screen="Video">
      <div className="reel-glow" aria-hidden="true" />
      <div className="reel-scan" aria-hidden="true" />

      <div className="container reel-head">
        <p className="mono-label reel-label" data-r="up">
          <span className="reel-rec-dot" aria-hidden="true" /> video
        </p>
        <h2 className="reel-title" aria-label="Outplayed">
          {"Outplayed".split("").map((ch, i) => (
            <span key={i} className="reel-letter" data-r="up" style={{ "--i": i + 1 }} aria-hidden="true">{ch}</span>
          ))}
        </h2>
        <p className="reel-sub" data-r="up" style={{ "--i": 10 }}>
          Clips from my own gameplay — cut, graded and captured with Outplayed.
        </p>
      </div>

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
              <span className="reel-badge"><span className="reel-rec-dot" aria-hidden="true" />REC · {String(i + 1).padStart(2, "0")}</span>
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

function TikTokScreen({ id }) {
  const ref = useRef(null);

  useEffect(() => {
    const existing = document.getElementById("tiktok-embed-script");
    if (existing) {
      if (window.tiktokEmbed?.lib?.render) window.tiktokEmbed.lib.render([ref.current]);
      return;
    }
    const script = document.createElement("script");
    script.id = "tiktok-embed-script";
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="section screen tiktok-screen" id={id} data-screen="TikTok">
      <div className="container">
        <div className="section-head section-head-center">
          <p className="mono-label" data-r="up">short-form</p>
          <h2 data-r="blur" style={{ "--i": 1 }}>On TikTok</h2>
          <p data-r="up" style={{ "--i": 2 }}>Recent edits and clips — the full profile is embedded below.</p>
        </div>
        <div className="tiktok-open" data-r="zoom" style={{ "--i": 3 }}>
          <div className="tiktok-embed-wrap" ref={ref}>
            <blockquote
              className="tiktok-embed"
              cite={`https://www.tiktok.com/@${tiktokHandle}`}
              data-unique-id={tiktokHandle}
              data-embed-type="creator"
              style={{ maxWidth: "780px", minWidth: "288px" }}
            >
              <section>
                <a target="_blank" rel="noreferrer" href={`https://www.tiktok.com/@${tiktokHandle}?refer=creator_embed`}>
                  @{tiktokHandle}
                </a>
              </section>
            </blockquote>
          </div>
          <a className="btn btn-ghost tiktok-fallback-link" href={`https://www.tiktok.com/@${tiktokHandle}`} target="_blank" rel="noreferrer">
            View full profile on TikTok →
          </a>
        </div>
      </div>
    </section>
  );
}
