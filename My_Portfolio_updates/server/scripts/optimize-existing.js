// One-off: shrinks the images you uploaded BEFORE the compression existed.
// For every PNG/JPG/WebP in your projects it makes the two small WebP sizes
// (-hq and -sm), uploads them, and points the project at the new files.
// The old files are NOT deleted, so you can roll back by hand.
//
//   cd server
//   node scripts/optimize-existing.js --dry    # just shows what it would do
//   node scripts/optimize-existing.js          # does it
import "dotenv/config";
import { supabase } from "../supabaseClient.js";
import { makeVariants } from "../imageTools.js";

const dry = process.argv.includes("--dry");
const IS_IMAGE = /\.(png|jpe?g|webp)(\?.*)?$/i;
const ALREADY_DONE = /-hq\.webp/;
const seen = new Map(); // old url -> new url (a cover is usually repeated in media_urls)

async function put(path, buffer) {
  const { error } = await supabase.storage
    .from("media")
    .upload(path, buffer, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

async function convert(url) {
  if (seen.has(url)) return seen.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${res.status})`);
  const { full, thumb } = await makeVariants(Buffer.from(await res.arrayBuffer()));
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await put(`${id}-sm.webp`, thumb);
  const next = await put(`${id}-hq.webp`, full);
  seen.set(url, next);
  return next;
}

const needsWork = (u) => u && IS_IMAGE.test(u) && !ALREADY_DONE.test(u);

const { data: projects, error } = await supabase.from("projects").select("id,title,media_url,media_urls");
if (error) { console.error("Couldn't read projects:", error.message); process.exit(1); }

let changed = 0;
for (const p of projects) {
  const urls = p.media_urls?.length ? p.media_urls : [p.media_url].filter(Boolean);
  const todo = urls.filter(needsWork).length;
  if (!todo) continue;
  console.log(`${p.title}: ${todo} image(s)${dry ? " (dry run)" : ""}`);
  if (dry) continue;
  try {
    const nextUrls = [];
    for (const u of urls) nextUrls.push(needsWork(u) ? await convert(u) : u);
    const nextCover = needsWork(p.media_url) ? seen.get(p.media_url) : p.media_url;
    const { error: upErr } = await supabase
      .from("projects")
      .update({ media_url: nextCover, media_urls: nextUrls })
      .eq("id", p.id);
    if (upErr) throw upErr;
    changed++;
  } catch (err) {
    console.error(`  skipped "${p.title}":`, err.message);
  }
}
console.log(dry ? "Dry run done." : `Done. Updated ${changed} project(s).`);
