import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[projects] fetch failed:", error.message);
    return res.status(500).json({ error: "Couldn't load projects." });
  }

  return res.json(data);
});

export default router;
