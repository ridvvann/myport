import { useEffect, useState } from "react";
import {
  getToken, login, clearToken, uploadMultipleMedia, createProject, deleteProject, listProjects,
} from "../adminApi.js";
import { getMediaKind, getMediaLabel } from "../lib/media.js";

const CATEGORIES = ["marketing", "development", "ai", "video", "graphic", "brand", "event"];

export default function Admin() {
  const [authed, setAuthed] = useState(!!getToken());
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  if (!authed) {
    return (
      <section className="section section-narrow" style={{ borderBottom: "none" }}>
        <div className="container">
          <p className="mono-label center-label">admin</p>
          <h2>Sign in</h2>
          <form
            className="admin-login"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoginError("");
              try {
                await login(password);
                setAuthed(true);
              } catch (err) {
                setLoginError(err.message);
              }
            }}
          >
            <div className="form-field">
              <label htmlFor="pw">Password</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit">Enter</button>
            {loginError && <p className="form-status" data-state="error">{loginError}</p>}
          </form>
        </div>
      </section>
    );
  }

  return <Dashboard onSignOut={() => { clearToken(); setAuthed(false); }} />;
}

function Dashboard({ onSignOut }) {
  const [projects, setProjects] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [files, setFiles] = useState([]); // one project, one or many files (Behance/Adobe-Portfolio-style grid)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [blurb, setBlurb] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok'|'error', text }

  async function refresh() {
    setLoadingList(true);
    try {
      setProjects(await listProjects());
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      let media_urls = [];
      if (files.length) {
        const { urls } = await uploadMultipleMedia(files);
        media_urls = urls;
      }
      await createProject({
        title, category, blurb,
        media_url: media_urls[0] || null,
        media_urls,
        link_url: linkUrl || undefined,
      });
      setTitle(""); setBlurb(""); setLinkUrl(""); setFiles([]);
      setStatus({ type: "ok", text: "Saved." });
      refresh();
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      refresh();
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    }
  }

  return (
    <section className="section section-admin" style={{ borderBottom: "none" }}>
      <div className="container">
        <div className="admin-head">
          <div>
            <p className="mono-label">admin</p>
            <h2>Upload media & manage work</h2>
          </div>
          <button className="btn btn-ghost" onClick={onSignOut}>Sign out</button>
        </div>

        <form className="admin-grid" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-field admin-span-2">
            <label htmlFor="blurb">Description</label>
            <textarea id="blurb" rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} required />
          </div>
          <div className="form-field admin-span-2">
            <label htmlFor="file">
              Media files — pick several to make one project a grid, like a Behance/Adobe Portfolio case study
              (image, video, PPTX, PDF, doc, or any file)
            </label>
            <input
              id="file"
              type="file"
              multiple
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])}
            />
            {files.length > 0 && (
              <ul className="file-picked-list">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="mono-label file-picked">
                    {f.name}
                    <button
                      type="button"
                      className="file-picked-remove"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="link">External link (optional)</label>
            <input id="link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="admin-span-2">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add to work"}
            </button>
            {status && <p className="form-status" data-state={status.type}>{status.text}</p>}
          </div>
        </form>

        <h3 className="admin-list-title">Current work ({projects.length})</h3>
        {loadingList ? (
          <p className="mono-label">Loading...</p>
        ) : (
          <div className="admin-list">
            {projects.map((p) => (
              <div className="admin-row" key={p.id}>
                {p.media_url && (
                  <span className="admin-thumb-wrap">
                    {getMediaKind(p.media_url) === "video" ? (
                      <video className="admin-thumb" src={p.media_url} muted />
                    ) : getMediaKind(p.media_url) === "image" ? (
                      <img className="admin-thumb" src={p.media_url} alt="" />
                    ) : (
                      <a className="admin-thumb admin-thumb-file" href={p.media_url} target="_blank" rel="noreferrer">
                        {getMediaLabel(p.media_url)}
                      </a>
                    )}
                    {p.media_urls?.length > 1 && (
                      <span className="admin-thumb-count">+{p.media_urls.length - 1}</span>
                    )}
                  </span>
                )}
                <div className="admin-row-info">
                  <span className="work-tag">{p.category}</span>
                  <strong>{p.title}</strong>
                  <span className="mono-label">{p.blurb}</span>
                </div>
                <button className="btn btn-ghost admin-delete" onClick={() => onDelete(p.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
