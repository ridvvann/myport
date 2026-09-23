export default function About() {
  const titles = ["Marketing Agent", "Full-Stack Web Developer", "Certified AI Engineer"];

  return (
    <section className="section section-narrow" id="about">
      <div className="container">
        <p className="mono-label center-label">about</p>
        <h2 className="about-name">Saki Abdikani</h2>
        <div className="hero-titles about-titles">
          {titles.map((t, i) => (
            <span className="title-pill" key={t}>
              {t}
              {i < titles.length - 1 && <span className="title-dot" aria-hidden="true" />}
            </span>
          ))}
        </div>
        <p className="about-line">
          I started in marketing, picked up design to make my own campaigns
          look better, then learned to build the products and AI tools those
          campaigns needed — so now I carry a project from strategy to the
          finished screen or clip, alone.
        </p>
      </div>
    </section>
  );
}
