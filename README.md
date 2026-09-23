# Saki Abdikani Hussien — Portfolio

A monochrome, chat-thread-style portfolio. The page reads like an open
conversation: each line of work (marketing, full-stack dev, AI engineering,
video editing, graphic/brand/event design) appears as a prompt-and-response
exchange, and the contact form is styled as a chat composer.

Stack: **React (Vite)** frontend, **Express** backend, **Supabase**
(Postgres) for storing project/media entries and incoming contact messages.

```
saki-portfolio/
├── client/          React app (the site itself)
├── server/          Express API (contact form + projects endpoint)
└── supabase/        SQL schema to run in your Supabase project
```

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Grab your Project URL and anon/service keys from Settings → API.

## 2. Backend (`server/`)

```bash
cd server
cp .env.example .env      # fill in SUPABASE_URL + SUPABASE_SERVICE_KEY
npm install
npm run dev                # http://localhost:4000
```

Endpoints:
- `GET /api/projects` — list portfolio items (reads `projects` table)
- `POST /api/contact` — save a message (writes to `messages` table)

## 3. Frontend (`client/`)

```bash
cd client
cp .env.example .env      # set VITE_API_URL (defaults to localhost:4000)
npm install
npm run dev                 # http://localhost:5173
```

## 4. Admin panel

Visit `/admin` (linked quietly in the footer) to sign in and manage your
work without touching Supabase directly.

1. Set `ADMIN_PASSWORD` in `server/.env` to whatever you want your login to be.
2. In Supabase, go to **Storage → New bucket**, name it `media`, and mark it **public**.
3. Restart the server, sign in at `/admin` with your password.
4. Upload an image or video, fill in the title/category/description, and hit **Add to work** — it uploads to Supabase Storage and inserts a row into `projects`, which the public site reads live.

This is a lightweight single-password gate meant for one person (you) —
tokens live in the server's memory and reset if the server restarts. If you
ever want stronger auth, swap it for Supabase Auth.

## 5. Add your real work another way

You can also edit the `projects` table directly in Supabase's table editor
if you'd rather skip the admin UI — same effect, either path works.

## 6. Pages

- `/` — home (hero, about, services, work)
- `/plans` — "coming soon" placeholder for pricing
- `/experience` — "coming soon" placeholder for education/experience
- `/admin` — password-gated upload panel

## 7. Deploy

- Frontend: Vercel/Netlify (`client/`, build command `npm run build`, output `dist`).
- Backend: Render/Railway/Fly (`server/`), or convert `server/routes` into
  serverless functions on the same host as the frontend.
- Set the frontend's `VITE_API_URL` to your deployed backend URL.
