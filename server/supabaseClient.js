import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    "[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — set them in server/.env"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
