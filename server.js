console.log("🔥 SERVER STARTING");

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 3001;

// fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---------------- FORCE SINGLE DASHBOARD ----------------

// ANY root visit goes to dashboard
app.get("/", (req, res) => {
  res.redirect("/dashboard.html");
});

// kill any accidental routes
app.get("/index.html", (req, res) => {
  res.redirect("/dashboard.html");
});

app.get("/home", (req, res) => {
  res.redirect("/dashboard.html");
});

app.get("/dashboard", (req, res) => {
  res.redirect("/dashboard.html");
});

// ---------------- PAGES ----------------

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ---------------- GENERATE ----------------

app.post("/generate", async (req, res) => {
  const { topic, mode } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Missing topic" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a viral TikTok script generator.

Format EXACTLY:

HOOK:
(1–3 strong lines)

BODY:
(8–15 engaging sentences)

CTA:
(1–2 strong CTA)

VIRAL_SCORE:
(0–100)

IMPROVEMENT_TIP:
(one short tip)
          `
        },
        {
          role: "user",
          content: `Mode: ${mode}\nTopic: ${topic}`
        }
      ]
    });

    const result = completion.choices?.[0]?.message?.content;

    res.json({ result });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------- START ----------------

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});