// Classifies a media_url by extension so the work grid can render the
// right preview — images and clips inline, everything else (slide decks,
// PDFs, docs, sheets, archives...) as an open/download tile with a label.

const KIND_BY_EXT = {
  // images
  jpg: "image", jpeg: "image", png: "image", gif: "image", webp: "image",
  avif: "image", svg: "image", bmp: "image", heic: "image",
  // video
  mp4: "video", webm: "video", mov: "video", m4v: "video", avi: "video", mkv: "video",
  // slides
  ppt: "slides", pptx: "slides", key: "slides", odp: "slides",
  // documents
  pdf: "pdf", doc: "doc", docx: "doc", rtf: "doc", odt: "doc", pages: "doc", txt: "doc", md: "doc",
  // spreadsheets
  xls: "sheet", xlsx: "sheet", csv: "sheet", numbers: "sheet",
  // archives
  zip: "archive", rar: "archive", "7z": "archive",
  // design source files
  ai: "design", psd: "design", fig: "design", sketch: "design", indd: "design",
};

const LABEL_BY_KIND = {
  image: "Image",
  video: "Video",
  slides: "Slides",
  pdf: "PDF",
  doc: "Doc",
  sheet: "Sheet",
  archive: "Archive",
  design: "Design file",
  file: "File",
};

export function getExt(url) {
  if (!url) return "";
  const clean = url.split("?")[0].split("#")[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

export function getMediaKind(url) {
  const ext = getExt(url);
  return KIND_BY_EXT[ext] || (ext ? "file" : "file");
}

export function getMediaLabel(url) {
  const kind = getMediaKind(url);
  const ext = getExt(url);
  if (kind === "file" && ext) return ext.toUpperCase();
  return LABEL_BY_KIND[kind] || (ext ? ext.toUpperCase() : "File");
}
