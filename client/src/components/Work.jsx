import { useEffect, useRef, useState } from "react";
import { fetchProjects } from "../api.js";
import { fallbackProjects, tiktokHandle } from "../data/projects.js";
import { getMediaKind, getMediaLabel } from "../lib/media.js";
import { getProjectTheme } from "../lib/color.js";
import { useAutoplayInView } from "../lib/useAutoplayInView.js";

const CATEGORY_LABEL = {
  marketing: "Marketing", development: "Development", ai: "AI",
  brand: "Brand", event: "Event", graphic: "Graphic design", video: "Video",
};

export default function Work() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchProjects()
      .then((data) => { if (data?.length) setProjects(data); })
      .catch(() => { /* keep fallback data */ });
  }, []);

  // Only "event" work is ever pooled into a collective gallery — every
  // other category (including graphic design) sits in one shared,
  // borderless bento gallery. Video keeps its own static embed box.
  const eventItems = projects.filter((p) => p.category === "event");
  const galleryItems = projects.filter((p) => p.category !== "event" && p.category !== "video");

  // Tabs are built from whatever categories actually have work in them,
  // in the same order as CATEGORY_LABEL, so an empty category never
  // shows up as a dead tab. Video is a standing tab since that box is
  // static content, not data-driven.
  const galleryCategories = Object.keys(CATEGORY_LABEL).filter(
    (c) => c !== "event" && c !== "video" && galleryItems.some((p) => p.category === c)
  );
  const tabs = [
    { key: "all", label: "All" },
    ...galleryCategories.map((c) => ({ key: c, label: CATEGORY_LABEL[c] })),
    ...(eventItems.length > 0 ? [{ key: "event", label: "Event" }] : []),
    { key: "video", label: "Video" },
  ];

  // Reset to "All" if the active tab's category disappears (e.g. data refetch).
  useEffect(() => {
    if (activeTab !== "all" && !tabs.some((t) => t.key === activeTab)) setActiveTab("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  // A tab only ever surfaces work that actually belongs to it — "all"
  // is the single exception that shows every section together.
  const shownGallery = activeTab === "all" ? galleryItems : galleryItems.filter((p) => p.category === activeTab);
  const showEvents = activeTab === "all" || activeTab === "event";
  const showVideo = activeTab === "all" || activeTab === "video";

  return (
    <section className="section" id="work" style={{ borderBottom: "none" }}>
      <div className="container">
        <div className="section-head section-head-center">
          <p className="mono-label">selected work</p>
          <h2>My work</h2>
        </div>
      </div>

      {tabs.length > 2 && (
        <div className="work-tabs" role="tablist" aria-label="Filter work by category">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={activeTab === t.key}
              className={`work-tab${activeTab === t.key ? " work-tab-active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="container">
        {shownGallery.length === 0 && !(showEvents && eventItems.length > 0) && !showVideo ? (
          <p className="work-empty">Nothing here yet — check back soon.</p>
        ) : (
          <div className="work-feed">
            {shownGallery.length > 0 && <BentoGallery items={shownGallery} />}
            {showEvents && eventItems.length > 0 && <EventsBox items={eventItems} />}
            {showVideo && <VideoBox />}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- A media preview that works for any file type: image and
   video render inline; anything else (pptx, pdf, docx, zip, ai...)
   renders as a labelled "open file" tile that links out to it. ---------- */
function MediaPreview({ url, title }) {
  const kind = getMediaKind(url);
  const videoRef = useRef(null);
  // Called unconditionally (rules of hooks) — the ref only ever attaches
  // to the <video> branch below, so this is a no-op for images/files.
  useAutoplayInView(videoRef);

  if (!url) {
    return <span className="work-box-fallback" aria-hidden="true">{title.charAt(0)}</span>;
  }
  if (kind === "image") return <FadeImg src={url} alt="" />;
  if (kind === "video") {
    return <video ref={videoRef} src={url} muted loop playsInline preload="metadata" />;
  }

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

/* ---------- Open, borderless gallery for every category except events
   and video. One bento cell per project — no card border, no dark
   pitch-box treatment, just the image with a small caption on hover —
   laid out in a varied bento grid instead of a uniform grid. Tapping a
   cell opens that project's full gallery. ---------- */
function BentoGallery({ items }) {
  return (
    <div className="bento-grid">
      {items.map((p, i) => <BentoItem key={p.id} project={p} index={i} />)}
    </div>
  );
}

function BentoItem({ project, index }) {
  const [open, setOpen] = useState(false);
  const gallery = (project.media_urls || []).filter(Boolean);
  const cover = project.media_url || gallery[0];

  return (
    <>
      <figure
        className="bento-item"
        style={{ animationDelay: `${index * 40}ms` }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}
      >
        <MediaPreview url={cover} title={project.title} />
        <figcaption className="bento-caption">
          <span className="bento-caption-cat">{CATEGORY_LABEL[project.category] || project.category}</span>
          <strong>{project.title}</strong>
        </figcaption>
      </figure>
      {open && <ProjectLightbox project={project} onClose={() => setOpen(false)} />}
    </>
  );
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

/* ---------- Events: the one category allowed a collective gallery —
   every photo from every event project pooled into a single open,
   borderless bento wall. Tapping any photo opens the lightbox for the
   specific event it came from, so the full set and details are still
   one tap away. ---------- */
function EventsBox({ items }) {
  const pooled = items.flatMap((p) => {
    const urls = (p.media_urls && p.media_urls.length ? p.media_urls : [p.media_url]).filter(Boolean);
    return urls.map((url) => ({ url, project: p }));
  });
  const theme = useProjectTheme(pooled.map((item) => item.url));

  return (
    <div className="work-box work-box-content" style={{ "--theme-rgb": theme || "90, 90, 90" }}>
      <div className="work-box-content-head">
        <div className="work-box-eyebrow"><span>Event</span></div>
        <h3 className="work-box-title">Events</h3>
        <p className="work-box-desc">A collected wall of moments from recent events — tap any photo to open its full set.</p>
      </div>
      <div className="work-box-content-body">
        {pooled.length === 0 ? (
          <p className="work-empty">Nothing here yet — check back soon.</p>
        ) : (
          <div className="bento-grid">
            {pooled.map((item, i) => <EventTile key={item.url + i} item={item} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function EventTile({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <figure
        className="bento-item"
        style={{ animationDelay: `${index * 35}ms` }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}
      >
        <MediaPreview url={item.url} title={item.project.title} />
        <figcaption className="bento-caption">
          <strong>{item.project.title}</strong>
        </figcaption>
      </figure>
      {open && <ProjectLightbox project={item.project} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ---------- An <img> that fades in once it's actually decoded, instead
   of popping in abruptly — makes a still-loading image feel like it's
   arriving smoothly rather than making you wait for a blank box. ---------- */
function FadeImg({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${className || ""} fade-img${loaded ? " fade-img-in" : ""}`.trim()}
      onLoad={() => setLoaded(true)}
    />
  );
}

/* ---------- Videos: one full-page box embedding the TikTok profile. ---------- */
function VideoBox() {
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
    <div className="work-box work-box-content">
      <div className="work-box-content-head">
        <div className="work-box-eyebrow"><span>Video</span></div>
        <h3 className="work-box-title">Short-form video</h3>
        <p className="work-box-desc">Recent edits and clips — the full profile is embedded below.</p>
      </div>
      <div className="work-box-content-body">
        <div className="tiktok-panel">
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
          <a
            className="btn btn-ghost tiktok-fallback-link"
            href={`https://www.tiktok.com/@${tiktokHandle}`}
            target="_blank"
            rel="noreferrer"
          >
            View full profile on TikTok →
          </a>
        </div>
      </div>
    </div>
  );
}
