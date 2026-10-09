import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import contactRoute from "./routes/contact.js";
import projectsRoute from "./routes/projects.js";
import adminRoute from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// CLIENT_ORIGIN can hold several sites, comma-separated, e.g.
//   https://yoursite.com,https://www.yoursite.com,https://yourproject.vercel.app
// A browser only talks to this API from an origin listed here (or localhost);
// anything else shows up as "Failed to fetch" on the site.
const allowedOrigins = CLIENT_ORIGIN.split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl, server-to-server, health checks
      const o = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(o) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) {
        return cb(null, true);
      }
      console.warn(`[cors] blocked origin: ${o} — add it to CLIENT_ORIGIN`);
      return cb(null, false);
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/projects", projectsRoute);
app.use("/api/contact", contactRoute);
app.use("/api/admin", adminRoute);

app.listen(PORT, () => {
  console.log(`Saki portfolio API running on http://localhost:${PORT}`);
  // Shows in the Render logs, so you can confirm which version is deployed.
  console.log(`[cors] allowed origins: ${allowedOrigins.join(", ")} (+ localhost/127.0.0.1 on any port)`);
});