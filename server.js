require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
const requestCounts = new Map();

function rateLimit(req, res, next) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown";

  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const current = requestCounts.get(ip) || {
    count: 0,
    startTime: now
  };

  if (now - current.startTime > windowMs) {
    current.count = 0;
    current.startTime = now;
  }

  current.count += 1;
  requestCounts.set(ip, current);

  if (current.count > maxRequests) {
    return res.status(429).json({
      error: "Too many requests. Please wait a minute and try again."
    });
  }

  next();
}

app.use(rateLimit);
// THIS FIXES Cannot GET /dashboard.html
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY

});

async function runPrompt(systemPrompt, userPrompt) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.9,
    max_tokens: 2200
  });

  return completion.choices[0].message.content;
}

// redirects
app.get("/", (req, res) => {
  res.redirect("/dashboard.html");
});

app.get("/dashboard", (req, res) => {
  res.redirect("/dashboard.html");
});

app.get("/home", (req, res) => {
  res.redirect("/dashboard.html");
});

app.post("/generate", async (req, res) => {
  try {
    const { topic, mode, goal } = req.body;

    const result = await runPrompt(
      "You are a world-class viral short-form content strategist.",
      `
Create a viral short-form script.

TOPIC: ${topic}
MODE: ${mode}
GOAL: ${goal}

Include:
VIDEO_TITLE:
THUMBNAIL_TEXT:
THUMBNAIL_IDEA:
HOOK:
BODY:
SCENE_BREAKDOWN:
IMAGE_PROMPTS:
EDITING_NOTES:
CTA:
VIRAL_SCORE:
IMPROVEMENT_TIP:
`
    );

    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Generation failed" });
  }
});

app.post("/ideas", async (req, res) => {
  try {
    const { mode, goal } = req.body;

    const result = await runPrompt(
      "You are an elite viral content idea generator.",
      `Generate 15 viral short-form ideas for mode ${mode} and goal ${goal}.`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Ideas failed" });
  }
});

app.post("/analyze-hook", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await runPrompt(
      "You are an expert viral hook analyst.",
      `Analyze this hook/content:\n\n${content}`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Hook analysis failed" });
  }
});

app.post("/trend-dashboard", async (req, res) => {
  try {
    const { topic, mode, goal } = req.body;

    const result = await runPrompt(
      "You are an elite social media trend strategist.",
      `Create a trend dashboard for ${topic}, mode ${mode}, goal ${goal}.`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Trend dashboard failed" });
  }
});

app.post("/analytics-dashboard", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await runPrompt(
      "You are a social media analytics AI.",
      `Create an analytics dashboard for this content:\n\n${content}`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Analytics failed" });
  }
});

app.post("/video-scene-generator", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await runPrompt(
      "You are a cinematic AI video production director.",
      `Create a video scene breakdown for:\n\n${content}`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Scene generator failed" });
  }
});

app.post("/thumbnail-studio", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await runPrompt(
      "You are a YouTube thumbnail psychology expert.",
      `Create a thumbnail strategy for:\n\n${content}`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Thumbnail studio failed" });
  }
});

app.post("/branding-suite", async (req, res) => {
  try {
    const { topic, mode, goal } = req.body;

    const result = await runPrompt(
      "You are a world-class creator branding strategist.",
      `Create a branding suite for topic ${topic}, mode ${mode}, goal ${goal}.`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Branding suite failed" });
  }
});

app.post("/capcut-export", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await runPrompt(
      "You are an elite short-form video editor.",
      `Create a CapCut export package for:\n\n${content}`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "CapCut export failed" });
  }
});

app.post("/channel-intelligence", async (req, res) => {
  try {
    const { topic, mode, goal } = req.body;

    const result = await runPrompt(
      "You are an elite creator business strategist.",
      `Create a channel intelligence report for topic ${topic}, mode ${mode}, goal ${goal}.`
    );

    res.json({ result });
  } catch {
    res.status(500).json({ error: "Channel intelligence failed" });
  }
});

app.post("/series-generator", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal
    } = req.body;

    const prompt = `
Create an AI CONTENT SERIES GENERATOR package.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

Create a bingeable 10-video short-form content series.

For the series include:

SERIES_TITLE:
SERIES_CONCEPT:
TARGET_AUDIENCE:
WHY_THIS_SERIES_COULD_GO_VIRAL:
RECURRING_HOOK_STYLE:
VISUAL_STYLE:
POSTING_ORDER:
RETENTION_STRATEGY:

For EACH of the 10 episodes include:
- episode number
- video title
- 1-sentence concept
- opening hook
- main story beat
- cliffhanger ending
- thumbnail text
- AI image prompt
- AI video prompt
- CTA
- why viewers would watch the next episode

Make the series feel bingeable, emotional, high-retention, and optimized for TikTok, Reels, and YouTube Shorts.
`;

    const result = await runPrompt(
      "You are an elite short-form content series strategist who creates bingeable viral video series.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Series generator failed"
    });
  }
});
app.post("/hook-generator", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal
    } = req.body;

    const prompt = `
Create a VIRAL HOOK GENERATOR package.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

Generate 20 ultra-viral short-form video hooks.

Mix:
- curiosity hooks
- emotional hooks
- shocking hooks
- controversial hooks
- storytelling hooks
- MrBeast-style hooks
- cliffhanger hooks
- faceless documentary hooks

For EACH hook include:

HOOK_NUMBER:
HOOK:
WHY_IT_WORKS:
RETENTION_TRIGGER:
BEST_VIDEO_STYLE:
THUMBNAIL_TEXT:

Make them optimized for:
- TikTok
- YouTube Shorts
- Instagram Reels

Hooks should feel modern, high-retention, and extremely clickable.
`;

    const result = await runPrompt(
      "You are an elite viral hook strategist for short-form content creators.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Hook generator failed"
    });
  }
});
app.post("/platform-formatter", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal,
      content
    } = req.body;

    const prompt = `
Create a PLATFORM FORMATTER package for this short-form content.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

CONTENT:
${content || "No script provided. Build from topic."}

Include:

PLATFORM_FORMATTER:
YOUTUBE_SHORTS_TITLE:
TIKTOK_CAPTION:
INSTAGRAM_REELS_CAPTION:
YOUTUBE_DESCRIPTION:
HASHTAGS:
PINNED_COMMENT:
UPLOAD_CHECKLIST:
BEST_POSTING_ANGLE:
SEO_KEYWORDS:
ENGAGEMENT_QUESTION:

Make it optimized for TikTok, YouTube Shorts, and Instagram Reels.
Keep it practical, copy-ready, and creator-friendly.
`;

    const result = await runPrompt(
      "You are an expert short-form platform packaging strategist.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Platform formatter failed"
    });
  }
});
app.post("/niche-finder", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal
    } = req.body;

    const prompt = `
Create an AI NICHE FINDER report.

USER INTEREST:
${topic}

MODE:
${mode}

GOAL:
${goal}

Generate 10 profitable short-form content niches.

For EACH niche include:

NICHE_NAME:
WHY_IT_WORKS:
TARGET_AUDIENCE:
MONETIZATION_POTENTIAL:
VIRAL_POTENTIAL:
COMPETITION_LEVEL:
BEST_PLATFORM:
CONTENT_EXAMPLES:
CHANNEL_IDEA:
POSTING_FREQUENCY:
FACILESS_OR_PERSONALITY:
LONG_TERM_POTENTIAL:

At the end include:

BEST_STARTING_NICHE:
FASTEST_TO_GROW:
BEST_FOR_MONEY:
BEST_FOR_FACILESS:
BEST_FOR_BRAND_DEALS:

Make it modern, realistic, and optimized for TikTok, YouTube Shorts, and Instagram Reels.
`;

    const result = await runPrompt(
      "You are an elite creator economy strategist and niche analyst.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Niche finder failed"
    });
  }
});
app.post("/monetization-dashboard", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal,
      content
    } = req.body;

    const prompt = `
Create a MONETIZATION DASHBOARD for this creator/content niche.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

CONTENT:
${content || "No script provided"}

Include:

MONETIZATION_DASHBOARD:
BEST_REVENUE_MODEL:
FASTEST_WAY_TO_MAKE_MONEY:
LONG_TERM_BUSINESS_MODEL:
BEST_AFFILIATE_PRODUCTS:
DIGITAL_PRODUCT_IDEAS:
COURSE_IDEAS:
SPONSORSHIP_CATEGORIES:
BRAND_DEAL_POTENTIAL:
EMAIL_LIST_IDEA:
LEAD_MAGNET_IDEA:
COMMUNITY_IDEA:
MERCH_IDEA:
BEST_PLATFORM_FOR_MONEY:
MONTH_1_STRATEGY:
MONTH_3_STRATEGY:
MONTH_6_STRATEGY:
ESTIMATED_FIRST_INCOME_TIMELINE:
MONETIZATION_DIFFICULTY:
MOST_REALISTIC_INCOME_SOURCE:
BIGGEST_MISTAKE_TO_AVOID:

Make it realistic, creator-focused, and optimized for modern short-form creators.
`;

    const result = await runPrompt(
      "You are an elite creator monetization strategist.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Monetization dashboard failed"
    });
  }
});
app.post("/thumbnail-generator", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal,
      content
    } = req.body;

    const prompt = `
Create a THUMBNAIL GENERATOR report.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

CONTENT:
${content || "No script provided"}

Include:

THUMBNAIL_STYLES:
BEST_THUMBNAIL_CONCEPT:
BEST_EMOTION:
BEST_COLORS:
BEST_TEXT:
CLICKABILITY_SCORE:
THUMBNAIL_WARNINGS:
YOUTUBE_THUMBNAIL_PROMPT:
TIKTOK_COVER_PROMPT:
INSTAGRAM_COVER_PROMPT:
CINEMATIC_AI_IMAGE_PROMPTS:
BACKGROUND_IDEAS:
FACIAL_EXPRESSION_IDEAS:
LIGHTING_STYLE:
BEST_COMPOSITION:
BEST_FONT_STYLE:
THUMBNAIL_VARIATIONS:

Make everything optimized for maximum CTR and modern viral thumbnails.
`;

    const result = await runPrompt(
      "You are an elite viral thumbnail strategist.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Thumbnail generator failed"
    });
  }
});
app.post("/voiceover-script", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal,
      content
    } = req.body;

    const prompt = `
Create an AI VOICEOVER SCRIPT package.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

CONTENT:
${content || "No script provided. Build from topic."}

Include:

VOICEOVER_SCRIPT:
BEST_VOICE_STYLE:
20_SECOND_VERSION:
30_SECOND_VERSION:
60_SECOND_VERSION:
VOICEOVER_PACING:
EMPHASIS_NOTES:
PAUSE_NOTES:
EMOTION_DIRECTION:
CAPCUT_VOICEOVER_TEXT:
ELEVENLABS_PROMPT:
BACKGROUND_MUSIC_STYLE:
SOUND_EFFECT_CUES:
RETENTION_VOICEOVER_TIPS:

Make it natural, high-retention, dramatic when needed, and ready for TikTok, YouTube Shorts, Reels, CapCut, and ElevenLabs.
`;

    const result = await runPrompt(
      "You are an elite short-form voiceover writer and retention editor.",
      prompt
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Voiceover script failed"
    });
  }
});
app.post("/create-checkout-session", async (req, res) => {
  try {

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      mode: "subscription",

      line_items: [
        {
          price_data: {
            currency: "usd",

            product_data: {
              name: "ShortForge AI Pro"
            },

            unit_amount: 1900,

            recurring: {
              interval: "month"
            }
          },

          quantity: 1
        }
      ],

      success_url:
        `${req.headers.origin}/dashboard.html?pro=true`,

      cancel_url:
        `${req.headers.origin}/pricing.html`

    });

    res.json({
      url: session.url
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Stripe checkout failed"
    });
  }
});
app.listen(PORT, () => {
  console.log(`🚀 ShortForge AI running at http://localhost:${PORT}/dashboard.html`);
});