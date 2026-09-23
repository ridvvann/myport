const EXPERIENCE = [
  {
    role: "Founder & Senior Media Engineer",
    org: "GEESSI TECH",
    period: "March 2026 – June 2026",
    place: "Borama",
    points: [
      "Directed end-to-end media engineering, branding suites, and dynamic video production using Adobe Premiere Pro, After Effects, and Illustrator.",
      "Architected and deployed custom full-stack web applications and enterprise ERP/POS platforms (Odoo and QuickBooks integration).",
      "Led technical training sessions teaching upcoming developers AI software integration and automated content generation.",
    ],
  },
  {
    role: "Senior Graphic Designer & Systems Lead",
    org: "Prime Jet",
    period: "June 2025 – June 2026",
    place: "Borama",
    points: [
      "Produced high-definition digital marketing media, motion graphics, and UI layouts using Adobe XD, Photoshop, and InDesign.",
      "Managed corporate IT infrastructure — custom purchasing systems, POS tracking, and Microsoft 365 team collaboration workflows.",
    ],
  },
  {
    role: "Digital Media & Systems Support Agent",
    org: "Borama Local Municipality",
    period: "January 2026 – June 2026",
    place: "Borama",
    points: [
      "Designed official civic communication materials and vector graphics.",
      "Streamlined internal document flow using Microsoft 365 and cloud tools.",
    ],
  },
];

const SKILL_GROUPS = [
  {
    title: "Adobe Creative Suite",
    skills: [
      "Premiere Pro", "After Effects", "Photoshop", "InDesign", "Adobe XD",
      "Illustrator", "Audition", "Lightroom", "Acrobat Pro", "Character Animator",
    ],
  },
  {
    title: "Developer & AI",
    skills: [
      "PHP", "React", "TypeScript", "Node.js", "Python", "Tailwind CSS",
      "Supabase", "MySQL", "Prompt Engineering", "LLM Integration",
    ],
  },
  {
    title: "Enterprise IT, ERP & POS",
    skills: [
      "Odoo ERP", "QuickBooks POS", "Database Architecture",
      "Business Process Automation", "System Administration",
    ],
  },
  {
    title: "Microsoft 365",
    skills: [
      "Word", "Excel", "PowerPoint", "Teams", "SharePoint",
      "Outlook", "OneDrive", "Power Automate", "Exchange Administration",
    ],
  },
];

const CERTIFICATIONS = [
  {
    title: "Google Certified AI Engineer",
    blurb: "Certified in artificial intelligence model deployment, machine learning integration, and automated media processing.",
  },
  {
    title: "AI & Software Development Instructor",
    blurb: "Mentoring and training developers and content creators on building modern AI-powered applications.",
  },
];

const REFERENCES = [
  { name: "Hassan Jibriil Moalim", title: "Dean, Faculty of ICT — Eelo University" },
  { name: "Farhan Ahmed Habane", title: "Head Secretary — Borama Local Municipality" },
  { name: "Mahmoud Hussein Ege", title: "President — Eelo University" },
];

export default function Experience() {
  return (
    <>
      <section className="section section-narrow" id="background" style={{ borderBottom: "none" }}>
        <div className="container">
          <p className="mono-label center-label">background</p>
          <h2 className="about-name">Education &amp; experience</h2>
          <p className="about-line">
            Senior Media Engineer, Google Certified AI Engineer, and full-stack
            web developer, working across enterprise media production, digital
            asset creation, and custom software systems — from Adobe Creative
            Cloud suites to Odoo ERP, QuickBooks POS, and full Microsoft 365
            environments.
          </p>
          <a className="btn btn-primary exp-cv-btn" href="/Saki-Abdikani-Resume.pdf" download>
            Download full CV (PDF)
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="mono-label">experience</p>
            <h2>Professional experience</h2>
          </div>
          <div className="timeline">
            {EXPERIENCE.map((job) => (
              <div className="timeline-item" key={job.role + job.org}>
                <p className="mono-label">{job.period} — {job.place}</p>
                <h3 className="timeline-role">{job.role}</h3>
                <p className="timeline-org">{job.org}</p>
                <ul className="timeline-points">
                  {job.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="mono-label">skillset</p>
            <h2>Technical &amp; creative skills</h2>
          </div>
          <div className="skill-groups">
            {SKILL_GROUPS.map((group) => (
              <div className="skill-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="skill-chips">
                  {group.skills.map((skill) => (
                    <span className="skill-chip" key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="mono-label">certifications</p>
            <h2>Certifications &amp; mentorship</h2>
          </div>
          <div className="discipline-grid cert-grid">
            {CERTIFICATIONS.map((cert, i) => (
              <div className="discipline" key={cert.title}>
                <span className="discipline-index">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{cert.title}</h3>
                  <p>{cert.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="container">
          <div className="section-head">
            <p className="mono-label">education &amp; references</p>
            <h2>Education</h2>
          </div>
          <div className="timeline-item edu-item">
            <p className="mono-label">2023 – 2026</p>
            <h3 className="timeline-role">Bachelor of Science in Computer Science (BSCS)</h3>
            <p className="timeline-org">Eelo University — Somaliland</p>
          </div>

          <div className="section-head" style={{ marginTop: "2.6rem" }}>
            <h2>References</h2>
            <p>Full contact details available on request.</p>
          </div>
          <div className="reference-grid">
            {REFERENCES.map((ref) => (
              <div className="reference-card" key={ref.name}>
                <strong>{ref.name}</strong>
                <span>{ref.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
