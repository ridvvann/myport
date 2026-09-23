const titles = ["Marketing Agent", "Full-Stack Web Developer", "Certified AI Engineer"];

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <span className="mark mark-lg" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>

        <h1 className="hero-headline">
          {titles.map((t) => (
            <span className="hero-headline-line" key={t}>{t}</span>
          ))}
        </h1>

        <div className="name-badge" id="about">
          <span className="mark mark-sm" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          Saki Abdikani
        </div>

        <p className="hero-about">
          I started in marketing, picked up design to make my own campaigns
          look better, then learned to build the products and AI tools those
          campaigns needed — so now I carry a project from strategy to the
          finished screen or clip, alone.
        </p>

        <div className="hero-actions">
          <a className="btn btn-primary" href="#work">View the work</a>
          <a className="btn btn-ghost" href="#services">What I do</a>
          <a className="btn btn-ghost" href="/Saki-Abdikani-Resume.pdf" download>
            Download CV
          </a>
        </div>
      </div>
    </section>
  );
}
