// Optional: the frontend talks to Supabase only if you want direct,
// client-side reads of the projects table (using the public anon key,
// which is safe to expose). By default this app fetches projects through
// the Express API instead (see api.js), so this file is here if you'd
// rather skip the backend for reads.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
