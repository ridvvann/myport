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

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/projects", projectsRoute);
app.use("/api/contact", contactRoute);
app.use("/api/admin", adminRoute);

app.listen(PORT, () => {
  console.log(`Saki portfolio API running on http://localhost:${PORT}`);
});
