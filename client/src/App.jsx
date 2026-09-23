import { Routes, Route } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import SiteDecor from "./components/SiteDecor.jsx";
import PeekPhoto from "./components/PeekPhoto.jsx";
import Home from "./pages/Home.jsx";
import Plans from "./pages/Plans.jsx";
import Experience from "./pages/Experience.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <>
      <SiteDecor />
      <PeekPhoto />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
