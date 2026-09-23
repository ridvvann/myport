import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { supabase } from "../supabaseClient.js";
import { issueToken, requireAdmin } from "../middleware/adminAuth.js";

const router = Router();
// No fileFilter: any file type is accepted (images, video clips, PPTX/PDF
// decks, docs, zips, design source files...). The work grid on the client
// picks the right preview based on the uploaded file's extension.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 300 * 1024 * 1024 } });

// POST /api/admin/login  { password }
router.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password." });
  }
  return res.json({ token: issueToken() });
});

// Phone-camera and export-tool images routinely come in at 4000px+ and
// several MB each — way more than a browser ever needs at any on-screen
// size on this site. Every photo upload gets resized to a sane max
// dimension and re-encoded as WebP before it ever reaches storage, which
// is usually a 70-90% size cut with no visible quality loss, so every
// project loads and scrolls faster without anyone having to think about
// it again. GIFs are left alone (animation), and anything that isn't an
// image (video, PDF, PPTX, zip, design files...) passes through as-is.
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 78;

async function compressIfImage(file) {
  const isCompressible = file.mimetype.startsWith("image/") && file.mimetype !== "image/gif";
  if (!isCompressible) return { buffer: file.buffer, mimetype: file.mimetype, ext: file.originalname.split(".").pop() };

  try {
    const buffer = await sharp(file.buffer)
      .rotate() // respects EXIF orientation before resizing
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { buffer, mimetype: "image/webp", ext: "webp" };
  } catch (err) {
    // If sharp can't read a given file (corrupt upload, unsupported
    // variant...) fall back to the original rather than blocking the
    // whole upload.
    console.warn("[admin/upload] compression skipped:", err.message);
    return { buffer: file.buffer, mimetype: file.mimetype, ext: file.originalname.split(".").pop() };
  }
}

async function uploadOne(file) {
  const { buffer, mimetype, ext } = await compressIfImage(file);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, buffer, { contentType: mimetype });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

// POST /api/admin/upload  (multipart, field name "file") -> { url }
// Single-file upload, kept for backwards compatibility.
router.post("/upload", requireAdmin, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided." });
  try {
    const url = await uploadOne(req.file);
    return res.json({ url });
  } catch (err) {
    console.error("[admin/upload] failed:", err.message);
    return res.status(500).json({ error: "Upload failed. Check the 'media' bucket exists and is public." });
  }
});

// POST /api/admin/upload-multiple  (multipart, field name "files", up to 20)
// -> { urls: [...] }. Used for a single project with several images/files,
// e.g. a Behance/Adobe-Portfolio-style case study grid.
router.post("/upload-multiple", requireAdmin, upload.array("files", 20), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: "No files provided." });
  try {
    const urls = [];
    for (const file of req.files) {
      urls.push(await uploadOne(file)); // sequential: keeps Supabase Storage happy under load
    }
    return res.json({ urls });
  } catch (err) {
    console.error("[admin/upload-multiple] failed:", err.message);
    return res.status(500).json({ error: "Upload failed. Check the 'media' bucket exists and is public." });
  }
});

// POST /api/admin/projects  { title, category, blurb, media_url, media_urls, link_url }
// media_urls (optional array) holds every file in the project; media_url
// stays as the single cover image for older clients/back-compat.
router.post("/projects", requireAdmin, async (req, res) => {
  const { title, category, blurb, media_url, media_urls, link_url } = req.body || {};
  if (!title?.trim() || !category || !blurb?.trim()) {
    return res.status(400).json({ error: "Title, category, and blurb are required." });
  }

  const urls = Array.isArray(media_urls) ? media_urls.filter(Boolean) : [];
  const cover = media_url || urls[0] || null;

  const { data, error } = await supabase
    .from("projects")
    .insert([{ title: title.trim(), category, blurb: blurb.trim(), media_url: cover, media_urls: urls, link_url }])
    .select()
    .single();

  if (error) {
    console.error("[admin/projects] insert failed:", error.message);
    return res.status(500).json({ error: "Couldn't save the project." });
  }
  return res.status(201).json(data);
});

// DELETE /api/admin/projects/:id
router.delete("/projects/:id", requireAdmin, async (req, res) => {
  const { error } = await supabase.from("projects").delete().eq("id", req.params.id);
  if (error) {
    console.error("[admin/projects] delete failed:", error.message);
    return res.status(500).json({ error: "Couldn't delete the project." });
  }
  return res.json({ ok: true });
});

export default router;
