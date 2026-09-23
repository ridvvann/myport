export default function ComingSoon({ label, title, blurb }) {
  return (
    <section className="section section-narrow coming-soon" style={{ borderBottom: "none" }}>
      <div className="container">
        <p className="mono-label center-label">{label}</p>
        <h2>{title}</h2>
        <p className="about-line">{blurb}</p>
        <span className="soon-badge">Coming soon</span>
      </div>
    </section>
  );
}
