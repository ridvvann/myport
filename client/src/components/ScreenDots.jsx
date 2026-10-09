/* Side dots: one per screen, the current one stretches. Click to jump. */
export default function ScreenDots({ items, active }) {
  if (items.length < 2) return null;
  return (
    <nav className="screen-dots" aria-label="Sections">
      {items.map((it, i) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={`screen-dot${i === active ? " screen-dot-on" : ""}`}
          aria-label={it.label}
          aria-current={i === active ? "true" : undefined}
        >
          <span className="screen-dot-label">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
