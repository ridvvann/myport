import Hero from "../components/Hero.jsx";
import Services from "../components/Services.jsx";
import Work from "../components/Work.jsx";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <Hero />
      <Services />
      <Work />
    </>
  );
}
