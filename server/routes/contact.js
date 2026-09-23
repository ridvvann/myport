import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const { error } = await supabase
    .from("messages")
    .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }]);

  if (error) {
    console.error("[contact] insert failed:", error.message);
    return res.status(500).json({ error: "Couldn't save your message. Try again shortly." });
  }

  return res.status(201).json({ ok: true });
});

export default router;
