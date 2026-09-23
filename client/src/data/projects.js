// Fallback data — shown until your Supabase `projects` table has rows,
// or if the API request fails. Covers every category the admin panel
// can create, so nothing added there is ever hidden on the live grid.
export const fallbackProjects = [
  { id: "m1", title: "Launch campaign — Nomad Coffee", category: "marketing", blurb: "Paid social + email funnel that took a new roaster from 0 to 4k followers in 6 weeks." },
  { id: "d1", title: "Client dashboard rebuild", category: "development", blurb: "React + Node + Postgres rebuild of a booking dashboard, cut load time by 70%." },
  { id: "a1", title: "Support ticket triage bot", category: "ai", blurb: "LLM-backed classifier and auto-responder wired into an existing helpdesk." },
  { id: "b1", title: "Rebrand — Aden Bakery", category: "brand", blurb: "Full identity: logotype, packaging, and a 40-page brand guideline." },
  { id: "e1", title: "Tech meetup — 300 attendees", category: "event", blurb: "End-to-end production: venue, run-of-show, signage, and livestream." },
  { id: "g1", title: "Rebrand — Aden Bakery", category: "graphic", blurb: "Full identity: logotype, packaging, and a 40-page brand guideline." },
  { id: "g2", title: "Product launch poster series", category: "graphic", blurb: "A 6-poster series for a tech launch, print and social formats." },
  { id: "g3", title: "Event signage system", category: "graphic", blurb: "Wayfinding, stage backdrop, and badge design for a 300-person event." },
  { id: "g4", title: "Social template kit", category: "graphic", blurb: "A reusable template system so a client's team could post without a designer." },
  { id: "v1", title: "Wedding highlight reel", category: "video", blurb: "3-minute cut from 6 hours of raw footage, color graded and scored." },
  { id: "v2", title: "Product launch teaser", category: "video", blurb: "15-second vertical cut for paid social, hooked in the first 2 seconds." },
  { id: "v3", title: "Brand documentary — Aden Bakery", category: "video", blurb: "4-minute founder story shot and edited for the rebrand launch." },
  { id: "v4", title: "Event recap — Tech meetup", category: "video", blurb: "Same-week highlight reel from a 300-person conference." },
];

// Order controls the tab row. "graphic" renders as a collective poster
// wall and "video" renders as an embedded TikTok profile — see Work.jsx.
export const categories = [
  { key: "marketing", label: "Marketing" },
  { key: "development", label: "Development" },
  { key: "ai", label: "AI" },
  { key: "brand", label: "Brand" },
  { key: "event", label: "Events" },
  { key: "graphic", label: "Posters" },
  { key: "video", label: "Videos" },
];

// Set this to your handle (no @) so the Videos tab can embed your profile.
export const tiktokHandle = "ridw4nabdi";
