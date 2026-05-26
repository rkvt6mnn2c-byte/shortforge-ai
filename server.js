require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3001;

app.use(cors());
app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    const sig =
      req.headers["stripe-signature"];

    let event;

    try {

      event =
        stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );

    } catch (err) {

      console.error(err);

      return res
        .status(400)
        .send(`Webhook Error: ${err.message}`);
    }

    if (
      event.type ===
      "checkout.session.completed"
    ) {

      const session =
        event.data.object;

      const userId =
        session.metadata.userId;

      if (userId) {

        const { error } =
          await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true
            })
            .eq("id", userId);

        if (error) {
          console.error(error);
        } else {
          console.log(
            `Upgraded user ${userId} to Pro`
          );
        }
      }
    }
if (
  event.type ===
  "customer.subscription.deleted"
) {
  const subscription = event.data.object;

  const customerId = subscription.customer;

  if (customerId) {
    const { error } =
      await supabaseAdmin
        .from("profiles")
        .update({
          is_pro: false
        })
        .eq("stripe_customer_id", customerId);

    if (error) {
      console.error("Subscription downgrade failed:", error);
    } else {
      console.log(
        `Downgraded customer ${customerId} after subscription cancellation`
      );
    }
  }
}
    res.json({ received: true });
  }
);

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


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY

});

async function runPrompt(systemPrompt, userPrompt) {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
  {
    role: "system",
    content: `
${systemPrompt}

IMPORTANT RULES:
- Never ask follow-up questions
- Never say "Would you like me to proceed?"
- Never say "Let me know if you want more"
- Never speak conversationally
- Never explain what you are doing
- Output ONLY the requested creator content
- Be direct and structured
- Finish completely without asking anything
`
  },

  {
    role: "user",
    content: userPrompt
  }
],
    temperature: 0.9,
    max_tokens: 2200
  });

  return completion.choices[0].message.content;
}

// redirects
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/home", (req, res) => {
  res.redirect("/dashboard.html");
});
app.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No auth token"
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Invalid user"
      });
    }

    const { data: profile, error } =
      await supabaseAdmin
        .from("profiles")
        .select("usage_count, usage_limit, is_pro, stripe_customer_id")
        .eq("id", user.id)
        .single();

    if (error || !profile) {
      return res.status(404).json({
        error: "Profile not found"
      });
    }

    res.json(profile);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to load profile"
    });
  }
});
app.post("/generate", async (req, res) => {
  try {
    try {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No auth token"
    });
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error: authError
  } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({
      error: "Invalid user"
    });
  }

  const { data: profile, error: profileError } =
    await supabaseAdmin
  .from("profiles")
      .select("usage_count, usage_limit, is_pro")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    return res.status(400).json({
      error: "Profile not found"
    });
  }

  if (
    !profile.is_pro &&
    profile.usage_count >= profile.usage_limit
  ) {
    return res.status(403).json({
      error: "Free limit reached"
    });
  }

  req.userProfile = profile;
  req.userId = user.id;

} catch (err) {

  console.error(err);

  return res.status(500).json({
    error: "Server auth error"
  });
}
    const {
  topic,
  mode,
  goal,
  creatorMemory
} = req.body;

    const result = await runPrompt(
      "You are a world-class viral short-form content strategist.",
      `
Create a viral short-form script.

TOPIC: ${topic}
MODE: ${mode}
GOAL: ${goal}
Creator Memory:
${creatorMemory || "No creator memory provided."}

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

    if (!req.userProfile.is_pro) {

  await supabaseAdmin
  .from("profiles")
    .update({
      usage_count:
        req.userProfile.usage_count + 1
    })
    .eq("id", req.userId);
}

res.json({
  result,

  usage_count:
    req.userProfile.is_pro
      ? req.userProfile.usage_count
      : req.userProfile.usage_count + 1,

  usage_limit:
    req.userProfile.usage_limit,

  is_pro:
    req.userProfile.is_pro
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Generation failed" });
  }
});
app.post("/assistant", async (req, res) => {
  try {

    const { question, content } = req.body;

    const completion =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              `
              You are ShortForge AI,
              an elite viral short-form content strategist.

              Help creators grow on:
              - TikTok
              - YouTube Shorts
              - Instagram Reels

              Give:
              - concise advice
              - viral strategies
              - hook rewrites
              - thumbnail ideas
              - retention tips
              - monetization advice
              - growth tactics

              Keep responses actionable and creator-focused.
              `
          },

          {
            role: "user",
            content:
              `
              Current generated content:
              ${content || "None"}

              User question:
              ${question}
              `
          }
        ]
      });

    res.json({
      result:
        completion.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Assistant failed"
    });
    }
});

app.post("/voiceover-rewrite", async (req, res) => {
  try {

    const { content } = req.body;

    const completion =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              `
              You are an elite short-form video voiceover writer.

              Rewrite the user's generated content into actual spoken narration.

              Rules:
              - Do NOT write scene directions.
              - Do NOT write "show this" or "clip of this".
              - Write words the creator would actually say out loud.
              - Make it sound natural, viral, energetic, and human.
              - Use short punchy lines.
              - Keep it optimized for TikTok, YouTube Shorts, and Reels.
              - Break it into voiceover segments.
              - Include pacing notes.
              `
          },

          {
            role: "user",
            content:
              `
              Turn this into a spoken short-form voiceover script:

              ${content}
              `
          }
        ]
      });
      
    res.json({
      result:
        completion.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Voiceover rewrite failed"
    });
  }
});
app.post("/full-content-package", async (req, res) => {
  try {
    const { content } = req.body;

    const result = await runPrompt(
      "You are an elite creator operating system that builds full short-form content packages.",
      `
Create a complete ONE-CLICK CONTENT PACKAGE from this script:

${content}

Include:

FULL_CONTENT_PACKAGE:
VIDEO_TITLE:
HOOK:
SPOKEN_VOICEOVER_SCRIPT:
SCENE_BREAKDOWN:
AI_VIDEO_PROMPTS:
AI_IMAGE_PROMPTS:
THUMBNAIL_IDEAS:
CAPTIONS:
HASHTAGS:
UPLOAD_CHECKLIST:
BEST_POSTING_ANGLE:
RETENTION_STRATEGY:
CTA:
MONETIZATION_ANGLE:
REPURPOSING_IDEAS:
QUALITY_CONTROL_CHECKLIST:

Make it complete, copy-ready, and optimized for TikTok, YouTube Shorts, and Instagram Reels.
`
    );

    res.json({ result });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Full content package failed"
    });
  }
});
app.post("/subtitle-studio", async (req, res) => {
  try {

    const { content } = req.body;

    const result = await runPrompt(
      "You are an elite short-form subtitle editor for TikTok, Reels, and YouTube Shorts.",
`
Create an AI SUBTITLE STUDIO package from this script:

${content}

Include:

SUBTITLE_STUDIO:

PREVIEW_SUBTITLES:
Write 8 clean subtitle lines ONLY.
Each line must be something the viewer would actually read on screen.
Each line should be 6-12 words.
Do NOT include editing notes.
Do NOT include style notes.
Do NOT include timing.
Do NOT include emojis.
Do NOT include instructions.

HOOK_SUBTITLES:
MAIN_SUBTITLES:
EMOTION_WORD_HIGHLIGHTS:
CAPCUT_SUBTITLE_STYLE:
BEST_SUBTITLE_COLORS:
BEST_SUBTITLE_ANIMATIONS:
TIMING_BREAKDOWN:
WORD_EMPHASIS:
VIRAL_TEXT_OVERLAYS:
SOUND_EFFECT_TEXT:
RETENTION_TEXT_STRATEGY:
FINAL_SUBTITLE_EXPORT_NOTES:

Make the PREVIEW_SUBTITLES section clean and usable as real subtitles.
`
    );

    res.json({
      result
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Subtitle Studio failed"
    });
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
    console.log("CHECKOUT BODY:", req.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: req.body.email,

      metadata: {
        userId: req.body.userId
      },

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
        `${req.headers.origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${req.headers.origin}/pricing.html`
    });

    console.log("CHECKOUT SESSION CREATED:", session.id);

    res.json({
      url: session.url
    });

  } catch (error) {
    console.error("STRIPE CHECKOUT ERROR:", error);

    res.status(500).json({
      error: "Stripe checkout failed"
    });
  }
});

app.get("/checkout-success", async (req, res) => {
  try {
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.redirect("/dashboard.html?checkout=missing");
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = session.metadata?.userId;

if (userId) {
      await supabaseAdmin
        .from("profiles")
        .update({
  is_pro: true,
updated_at: new Date().toISOString(),
  stripe_customer_id: session.customer
})
        .eq("id", userId);

      console.log(`Checkout success upgraded user ${userId} to Pro`);
    }

    res.redirect("/dashboard.html?checkout=success");

  } catch (error) {
    console.error("CHECKOUT SUCCESS ERROR:", error);
    res.redirect("/dashboard.html?checkout=error");
  }
});
app.post("/create-customer-portal-session", async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        error: "Missing customer ID"
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://shortforgeai.com/dashboard.html"
    });

    return res.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error("Stripe portal error:", error);
    return res.status(500).json({
      error: error.message
    });
  }
});

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Image prompt is required"
      });
    }

    const image = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    res.json({
      image: image.data[0].b64_json
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Image generation failed"
    });
  }
});
app.post("/ai-video-pack", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        error: "Content is required"
      });
    }

    const result = await runPrompt(
      "You are an elite AI video director for TikTok, Reels, and YouTube Shorts.",

`
Create a premium AI VIDEO PRODUCTION PACK from this script:

${content}

Make this feel like a professional short-form video production blueprint for AI video tools.

Include:

AI_VIDEO_PACK:
VIDEO_TITLE:
CORE_CONCEPT:
BEST_PLATFORM:
TOTAL_DURATION:
ASPECT_RATIO:
VISUAL_STYLE:
VIRAL_ANGLE:
TARGET_VIEWER:
EMOTIONAL_HOOK:
RETENTION_STRATEGY:

SCENE_BY_SCENE_PLAN:
For each scene include:
SCENE_NUMBER:
DURATION:
ON_SCREEN_ACTION:
VISUAL_DESCRIPTION:
CAMERA_MOVEMENT:
SUBJECT_MOVEMENT:
BACKGROUND:
LIGHTING:
MOOD:
TRANSITION_IN:
TRANSITION_OUT:
TEXT_OVERLAY:
VOICEOVER_LINE:
SOUND_EFFECT:
MUSIC_CUE:

AI_VIDEO_PROMPTS:
For each scene include:
VEO_PROMPT:
RUNWAY_PROMPT:
KLING_PROMPT:
PIKA_PROMPT:

Each AI video prompt should be:
- cinematic
- vertical 9:16
- detailed
- motion-focused
- realistic unless the script clearly needs fantasy
- ready to paste into AI video tools

CAPCUT_EDITING_PLAN:
OPENING_3_SECONDS:
CUT_PATTERN:
SUBTITLE_STYLE:
ZOOM_EFFECTS:
SOUND_DESIGN:
B_ROLL_NOTES:
PACING_NOTES:
RETENTION_CUTS:
FINAL_EXPORT_SETTINGS:

THUMBNAIL_AND_COVER:
COVER_FRAME:
THUMBNAIL_TEXT:
THUMBNAIL_IMAGE_PROMPT:

FINAL_CREATOR_CHECKLIST:
`
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "AI video pack failed"
    });
  }
});
app.post("/content-calendar-generator", async (req, res) => {
  try {
    const {
      niche,
      goal,
      days
    } = req.body;

    if (!niche) {
      return res.status(400).json({
        error: "Niche is required"
      });
    }

    const result = await runPrompt(
      "You are an elite content calendar strategist for TikTok, YouTube Shorts, and Instagram Reels.",
      `
Create a complete short-form content calendar.

NICHE:
${niche}

GOAL:
${goal || "growth"}

DAYS:
${days || 30}

For each day include:

DAY_NUMBER:
VIDEO_TITLE:
VIDEO_CONCEPT:
HOOK:
CONTENT_TYPE:
PLATFORM:
THUMBNAIL_IDEA:
AI_IMAGE_PROMPT:
AI_VIDEO_PROMPT:
CAPTION:
HASHTAGS:
CTA:
POSTING_TIME:
WHY_THIS_WORKS:

Also include:

CONTENT_CALENDAR_STRATEGY:
BEST_SERIES_IDEAS:
REPEATING_FORMATS:
MONETIZATION_ANGLES:
WEEKLY_CONTENT_THEMES:
`
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Content calendar generation failed"
    });
  }
});
app.post("/export-studio", async (req, res) => {
  try {
    const {
      topic,
      mode,
      goal,
      content
    } = req.body;

    const result = await runPrompt(
      "You are an elite creator operations strategist who creates professional creator deliverables.",
      `
Create a complete EXPORT STUDIO package.

TOPIC:
${topic}

MODE:
${mode}

GOAL:
${goal}

CONTENT:
${content || "No content provided"}

Include:

EXPORT_STUDIO:
CREATOR_BRIEF:
PRODUCTION_BRIEF:
UPLOAD_CHECKLIST:
THUMBNAIL_BRIEF:
VIDEO_EDITING_BRIEF:
CAPTION_PACK:
HASHTAG_PACK:
SPONSOR_PITCH_ANGLE:
CLIENT_READY_SUMMARY:
CONTENT_REPURPOSING_PLAN:
DAILY_EXECUTION_STEPS:
TOOLS_NEEDED:
FINAL_DELIVERABLES:
QUALITY_CONTROL_CHECKLIST:

Make it professional, structured, copy-ready, and useful for creators, agencies, editors, and clients.
`
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Export Studio failed"
    });
  }
});
app.get("/download-pdf", (req, res) => {
  const PDFDocument = require("pdfkit");

  const title =
    req.query.title || "ShortForge Creator Export";

  const content =
    req.query.content || "No content provided.";

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="shortforge-export.pdf"`
  );

  const doc = new PDFDocument({
    margin: 50
  });

  doc.pipe(res);

  doc
    .fontSize(24)
    .text("ShortForge AI", {
      align: "center"
    });

  doc.moveDown();

  doc
    .fontSize(16)
    .text(title, {
      align: "center"
    });

  doc.moveDown(2);

  doc
    .fontSize(11)
    .text(content, {
      align: "left"
    });

  doc.end();
});

app.listen(PORT, () => {
  console.log(`🚀 ShortForge AI running at http://localhost:${PORT}/dashboard.html`);
});