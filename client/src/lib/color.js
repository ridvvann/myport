// Extracts an average color from a project's own uploaded images, so a
// multi-image project (an event photo set, a poster series...) can get a
// grid box and case-study lightbox themed with its own colors instead of
// a flat neutral background.

const cache = new Map(); // url -> {r,g,b} | null, avoids re-sampling on re-render

function sampleImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // needed to read pixels back from canvas
    img.onload = () => {
      try {
        const size = 24; // tiny canvas — we only need an average, not detail
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 16) continue; // skip transparent pixels
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
        resolve(n ? { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) } : null);
      } catch {
        resolve(null); // storage host didn't allow CORS pixel reads — theming just falls back
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function getAverageColor(url) {
  if (!url) return null;
  if (cache.has(url)) return cache.get(url);
  const result = await sampleImage(url);
  cache.set(url, result);
  return result;
}

// Samples up to `limit` images from a project and averages them into one
// theme color, returned as ready-to-use CSS pieces.
export async function getProjectTheme(urls, limit = 4) {
  const picks = (urls || []).filter(Boolean).slice(0, limit);
  const colors = (await Promise.all(picks.map(getAverageColor))).filter(Boolean);
  if (!colors.length) return null;

  const r = Math.round(colors.reduce((s, c) => s + c.r, 0) / colors.length);
  const g = Math.round(colors.reduce((s, c) => s + c.g, 0) / colors.length);
  const b = Math.round(colors.reduce((s, c) => s + c.b, 0) / colors.length);
  return `${r}, ${g}, ${b}`; // CSS-ready "r, g, b" for use inside rgba(var(--theme-rgb), a)
}
