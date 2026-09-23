import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape, and if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    function onResize() { if (window.innerWidth >= 720) setOpen(false); }
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav-row">
        <Link to="/" className="nav-id" onClick={close}>
          <span className="mark" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          Saki
        </Link>
        <div className="nav-right">
          <nav className="nav-links" aria-label="Section navigation">
            <a href="/#about">About</a>
            <a href="/#services">Services</a>
            <a href="/#work">Work</a>
            <Link to="/plans">Plans</Link>
            <Link to="/experience">Experience</Link>
          </nav>
          <a className="nav-cta" href="/Saki-Abdikani-Resume.pdf" download>
            Résumé
          </a>
          <ThemeToggle />
          <button
            type="button"
            className={`nav-burger${open ? " nav-burger-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <div
        className={`nav-backdrop${open ? " nav-backdrop-open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        className={`nav-mobile${open ? " nav-mobile-open" : ""}`}
        aria-hidden={!open}
      >
        <nav className="nav-mobile-links" aria-label="Mobile navigation" onClick={close}>
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/#work">Work</a>
          <Link to="/plans">Plans</Link>
          <Link to="/experience">Experience</Link>
          <a className="nav-mobile-cta" href="/Saki-Abdikani-Resume.pdf" download>
            Résumé →
          </a>
        </nav>
      </div>
    </header>
  );
}
