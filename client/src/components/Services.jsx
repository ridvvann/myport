const icon = {
  marketing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M16 9.5c.9.8 1.4 1.8 1.4 2.9s-.5 2.1-1.4 2.9" />
      <path d="M18.7 6.8c1.6 1.4 2.5 3.2 2.5 5.2s-.9 3.8-2.5 5.2" />
    </svg>
  ),
  dev: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
      <path d="m13 5-2 14" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="6" width="13" height="12" rx="2" />
      <path d="m21.5 9-6 3 6 3Z" />
    </svg>
  ),
  brand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 3 7v6c0 5 3.8 7.7 9 9 5.2-1.3 9-4 9-9V7Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h2M8 17h2M14 14h2M14 17h2" />
    </svg>
  ),
};

const services = [
  { n: "01", icon: icon.marketing, title: "Marketing", body: "Campaign strategy, paid social, and funnels that turn attention into customers." },
  { n: "02", icon: icon.dev, title: "Full-stack dev", body: "React, Node, and Supabase products, from prototype to production." },
  { n: "03", icon: icon.ai, title: "AI engineering", body: "LLM-backed tools and agents built into real workflows." },
  { n: "04", icon: icon.video, title: "Video editing", body: "Narrative cuts, color grading, and motion graphics." },
  { n: "05", icon: icon.brand, title: "Graphic & brand design", body: "Identity systems, logotypes, and the guidelines that keep them consistent." },
  { n: "06", icon: icon.event, title: "Event design", body: "Signage, run-of-show, and on-site experience." },
];

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-head section-head-center">
          <p className="mono-label">what i do</p>
          <h2>Services</h2>
        </div>
        <div className="discipline-grid">
          {services.map((d) => (
            <div className="discipline" key={d.n}>
              <div className="discipline-top">
                <span className="discipline-icon">{d.icon}</span>
                <span className="discipline-index">{d.n}</span>
              </div>
              <div className="discipline-body">
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
