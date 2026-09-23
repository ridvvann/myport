export default function Footer() {
  return (
    <footer className="footer container">
      <span>© {new Date().getFullYear()} Saki Abdikani</span>
      <a href="/Saki-Abdikani-Resume.pdf" download>
        Download résumé
      </a>
    </footer>
  );
}
