import { useEffect, useMemo, useRef, useState } from "react";
import { getMediaKind, getMediaLabel, thumbUrl } from "../lib/media.js";
import { getProjectTheme } from "../lib/color.js";

const CATEGORY_LABEL = {
  marketing: "Marketing", development: "Development", ai: "AI",
  brand: "Brand", event: "Event", graphic: "Graphic design", video: "Video",
};

// Development / AI work lives in the "Dev work" section (coming soon), and
// video is the TikTok embed, so neither is pooled into the design gallery.
const NON_DESIGN = new Set(["development", "ai", "video"]);
const ROWS = 3;

export default function Work({ projects = [] }) {
  // Every design image from every project, flattened into one pool.
  // Each tile remembers the project it came from so a tap can open that
  // project's full set in the lightbox.
  const pool = useMemo(
    () =>
      projects
        .filter((p) => !NON_DESIGN.has(p.category))
        .flatMap((p) => {
          const urls = (p.media_urls?.length ? p.media_urls : [p.media_url]).filter(Boolean);
          return urls
            .filter((url) => getMediaKind(url) === "image")
            .map((url) => ({ url, project: p }));
        }),
    [projects]
  );

  return (
    <section className="screen work-screen" id="work" data-screen="Design">
      <div className="container">
        <div className="section-head section-head-center">
          <p className="mono-label" data-r="up">design work</p>
          <h2 data-r="blur" style={{ "--i": 1 }}>Design gallery</h2>
          <p data-r="up" style={{ "--i": 2 }}>Posters, brands, events and more — hover to pause, tap any piece to open the full project.</p>
        </div>
      </div>

      {pool.length === 0 ? (
        <div className="container">
          <p className="work-empty">Nothing here yet — check back soon.</p>
        </div>
      ) : (
        <DesignMarquee pool={pool} />
      )}
    </section>
  );
}

/* ---------- Four self-moving rows. Row 1 drifts right→left, row 2
   left→right, and so on. Tiles share a row height but keep their own
   natural width, so every design is shown whole (never cropped) and the
   mix of portrait / landscape pieces gives the bento rhythm. The track is
   rendered twice and slid by exactly half its width, which makes the loop
   seamless. ---------- */
function DesignMarquee({ pool }) {
  const [active, setActive] = useState(null); // project shown in lightbox
  const [settled, setSettled] = useState(0);  // images finished (loaded or failed)

  // Round-robin the pool across the rows so each row gets a varied mix.
  const base = useMemo(() => {
    const buckets = Array.from({ length: ROWS }, () => []);
    pool.forEach((item, i) => buckets[i % ROWS].push(item));
    // A row left empty (fewer images than rows) borrows from the pool.
    return buckets.map((b, r) => (b.length ? b : [pool[r % pool.length]]));
  }, [pool]);

  // How many times each row repeats its images. Starts as a guess, then is
  // raised once real widths are known so a row can never run out of images
  // before the screen's right edge.
  const [mult, setMult] = useState(() => base.map((b) => Math.max(1, Math.ceil(7 / b.length))));
  useEffect(() => { setMult(base.map((b) => Math.max(1, Math.ceil(7 / b.length)))); }, [base]);
  const rows = useMemo(
    () => base.map((b, r) => Array.from({ length: mult[r] || 1 }, () => b).flat()),
    [base, mult]
  );

  const total = rows.reduce((n, r) => n + r.length * 2, 0);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 2000);
    return () => clearTimeout(t);
  }, []);
  // Hold the animation until sizes are known (or 2s passes), otherwise
  // tiles growing as their images arrive would make the loop jump. Once
  // released it stays released.
  const [latched, setLatched] = useState(false);
  const allSettled = settled >= total;
  useEffect(() => { if (allSettled || timedOut) setLatched(true); }, [allSettled, timedOut]);
  const ready = latched;
  const onSettle = () => setSettled((n) => n + 1);

  const trackRefs = useRef([]);
  useEffect(() => {
    if (!allSettled && !timedOut) return;
    const fit = () => {
      const vw = window.innerWidth;
      let grow = null;
      trackRefs.current.forEach((el, r) => {
        const group = el?.firstElementChild;
        if (!group) return;
        const w = group.scrollWidth;
        if (w > 0 && w < vw * 1.25) {
          grow = grow || mult.slice();
          grow[r] = Math.ceil((mult[r] * vw * 1.25) / w);
        }
      });
      if (grow) { setMult(grow); return; }
      // Widths are known and sufficient: pick each row's duration so every
      // row drifts at a steady, slightly different pace.
      trackRefs.current.forEach((el, r) => {
        if (!el) return;
        el.style.setProperty("--dur", `${Math.max(20, el.scrollWidth / 2 / ROW_SPEEDS[r])}s`);
      });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [allSettled, timedOut, mult, rows]);

  return (
    <>
      <div
        className={`marquee${ready ? " marquee-ready" : ""}`}
        style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}
        aria-label="Design gallery"
        data-r="wipe"
      >
        {rows.map((items, r) => (
          <div className="marquee-row" key={r}>
            <div
              ref={(el) => { trackRefs.current[r] = el; }}
              className={`marquee-track ${r % 2 === 0 ? "marquee-left" : "marquee-right"}`}
            >
              {[0, 1].map((copy) => (
                <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
                  {items.map((item, i) => (
                    <MarqueeTile
                      key={`${item.url}-${i}`}
                      item={item}
                      focusable={copy === 0}
                      onSettle={onSettle}
                      onOpen={() => setActive(item.project)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {active && <ProjectLightbox project={active} onClose={() => setActive(null)} />}
    </>
  );
}

// Drift speed per row, in px/second.
const ROW_SPEEDS = [38, 30, 42, 34];

function MarqueeTile({ item, onOpen, onSettle, focusable }) {
  const [state, setState] = useState("loading"); // loading | loaded | error
  // Tiles use the small "-sm" version when one exists; if it is missing the
  // tile quietly falls back to the full image.
  const [src, setSrc] = useState(() => thumbUrl(item.url));
  const settle = (s) => { setState(s); onSettle(); };

  return (
    <figure
      className={`marquee-item marquee-item-${state}`}
      onClick={onOpen}
      role="button"
      tabIndex={focusable ? 0 : -1}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(); }}
    >
      <img
        src={src}
        alt={focusable ? item.project.title : ""}
        decoding="async"
        draggable="false"
        onLoad={() => settle("loaded")}
        onError={() => (src !== item.url ? setSrc(item.url) : settle("error"))}
      />
      <figcaption className="bento-caption">
        <span className="bento-caption-cat">{CATEGORY_LABEL[item.project.category] || item.project.category}</span>
        <strong>{item.project.title}</strong>
      </figcaption>
    </figure>
  );
}

/* ---------- MediaPreview: image / video inline, other file types as an
   "open file" tile. Used by the lightbox. ---------- */
function MediaPreview({ url, title }) {
  const kind = getMediaKind(url);
  if (!url) {
    return <span className="work-box-fallback" aria-hidden="true">{title.charAt(0)}</span>;
  }
  if (kind === "image") return <img src={url} alt="" loading="lazy" decoding="async" />;
  if (kind === "video") return <video src={url} muted loop playsInline autoPlay preload="metadata" />;
  return (
    <a className="file-tile" href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
      <span className="file-tile-icon" aria-hidden="true">{getMediaLabel(url)}</span>
      <span className="file-tile-open">Open file →</span>
    </a>
  );
}

/* ---------- Samples a set of images into one theme color (see
   lib/color.js) so a lightbox is tinted with a background that
   actually matches what's inside it. ---------- */
function useProjectTheme(urls) {
  const [theme, setTheme] = useState(null);
  const key = urls.join("|");

  useEffect(() => {
    let cancelled = false;
    setTheme(null);
    getProjectTheme(urls).then((rgb) => { if (!cancelled) setTheme(rgb); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return theme;
}

/* ---------- Case-study lightbox: every file belonging to a project,
   laid out in a grid, tinted with a theme color sampled from that
   project's own images. Opens from either the bento gallery or the
   events wall. ---------- */
function ProjectLightbox({ project, onClose }) {
  const gallery = (project.media_urls || []).filter(Boolean);
  const shown = gallery.length ? gallery : [project.media_url].filter(Boolean);
  const theme = useProjectTheme(shown);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div
        className="lightbox-panel"
        style={{ "--theme-rgb": theme || "90, 90, 90" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lightbox-close" onClick={onClose} aria-label="Close">×</button>
        <div className="lightbox-head">
          <span className="work-tag">{CATEGORY_LABEL[project.category] || project.category}</span>
          <h3>{project.title}</h3>
          <p>{project.blurb}</p>
          {project.link_url && (
            <a className="work-link" href={project.link_url} target="_blank" rel="noreferrer">
              View project →
            </a>
          )}
        </div>
        <div className="lightbox-grid">
          {shown.map((url, i) => (
            <div className="lightbox-tile" key={url + i}>
              <MediaPreview url={url} title={project.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
