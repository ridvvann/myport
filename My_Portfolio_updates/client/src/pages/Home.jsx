import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/Hero.jsx";
import Services from "../components/Services.jsx";
import Work from "../components/Work.jsx";
import DevWork from "../components/DevWork.jsx";
import Video from "../components/Video.jsx";
import ScreenDots from "../components/ScreenDots.jsx";
import { fetchProjects } from "../api.js";
import { fallbackProjects } from "../data/projects.js";
import useScreens from "../lib/useScreens.js";

// The last project list is kept in the browser, so a returning visitor sees
// the real work instantly instead of waiting for the server to wake up.
const CACHE_KEY = "saki-projects-v1";
function readCache() {
  try {
    const data = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(data) && data.length ? data : null;
  } catch { return null; }
}

export default function Home() {
  const { hash } = useLocation();
  const [projects, setProjects] = useState(() => readCache() || fallbackProjects);

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        if (!data?.length) return;
        setProjects(data);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* storage full/blocked */ }
      })
      .catch(() => { /* keep fallback data */ });
  }, []);

  // Re-scan the screens whenever the data changes (the video section only
  // renders its clips screen when there are clips).
  const { active, items } = useScreens(projects);

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash, projects]);

  return (
    <>
      <Hero />
      <Services />
      <Work projects={projects} />
      <DevWork />
      <Video projects={projects} />
      <ScreenDots items={items} active={active} />
    </>
  );
}
