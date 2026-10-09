import sharp from "sharp";

// One place that decides how images are shrunk, shared by the upload route
// and the one-off optimize script.
//   full  — what the lightbox shows (max 1920px)
//   thumb — what the scrolling gallery shows (max 1000px, much smaller file)
const FULL = { size: 1920, quality: 78 };
const THUMB = { size: 1000, quality: 74 };

export async function makeVariants(input) {
  const base = sharp(input).rotate(); // respect EXIF orientation first
  const shrink = ({ size, quality }) =>
    base
      .clone()
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  const [full, thumb] = await Promise.all([shrink(FULL), shrink(THUMB)]);
  return { full, thumb };
}
