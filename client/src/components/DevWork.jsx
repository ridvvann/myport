export default function DevWork() {
  return (
    <section className="section screen dev-work" id="dev-work" data-screen="Dev">
      <div className="container">
        <div className="section-head section-head-center">
          <p className="mono-label" data-r="up">development work</p>
          <h2 data-r="blur" style={{ "--i": 1 }}>Dev work</h2>
          <p data-r="up" style={{ "--i": 2 }}>
            Full-stack builds, dashboards and AI tools — a proper write-up of each
            project is on its way.
          </p>
        </div>
        <div className="dev-work-card" data-r="zoom" style={{ "--i": 3 }}>
          <div className="dev-term" aria-hidden="true">
            <p><span className="dev-prompt">$</span> git commit -m "ship it"</p>
            <p><span className="dev-prompt">$</span> npm run build</p>
            <p className="dev-dim">compiling case studies…</p>
            <p><span className="dev-prompt">$</span> <span className="dev-caret" /></p>
          </div>
          <span className="soon-badge">Coming soon</span>
        </div>
      </div>
    </section>
  );
}
