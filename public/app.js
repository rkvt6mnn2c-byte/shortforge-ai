const FREE_LIMIT = 25;
const PRO_LIMIT = 999999;

let lastGenerated = "";
let savedScriptsCache = [];
let currentWorkspaceId = localStorage.getItem("sf_current_workspace") || "default";
let competitorCache = [];
let currentTheme = localStorage.getItem("sf_theme") || "dark";

const STATUS_OPTIONS = [
  "Idea",
  "Script Ready",
  "Needs Editing",
  "Ready to Post",
  "Posted"
];
window.applyOnboarding = () => {
  const creatorType = document.getElementById("creatorType")?.value;
  const creatorNiche = document.getElementById("creatorNiche")?.value.trim();
  const creatorGoal = document.getElementById("creatorGoal")?.value;

  if (!creatorNiche) {
    showToast("Enter your niche first");
    return;
  }

  document.getElementById("topic").value =
    `Create a viral ${creatorType} short-form video idea for the ${creatorNiche} niche.`;

  document.getElementById("goal").value = creatorGoal;

  if (creatorType === "faceless") {
    document.getElementById("mode").value = "viral";
  }

  if (creatorType === "story") {
    document.getElementById("mode").value = "story";
  }

  if (creatorType === "fitness") {
    document.getElementById("mode").value = "fitness";
  }

  if (creatorType === "money") {
    document.getElementById("mode").value = "money";
  }

  if (creatorType === "animal") {
    document.getElementById("mode").value = "animal";
  }

  showToast("Creator setup applied!");
};
const promptPresets = {
  faceless: {
    mode: "viral",
    goal: "faceless",
    topic: "A faceless documentary-style short about a shocking hidden truth most people do not know."
  },
  animalStory: {
    mode: "animal",
    goal: "animal",
    topic: "A cinematic AI animal short where a tiny animal survives something impossible."
  },
  gym: {
    mode: "fitness",
    goal: "gym",
    topic: "A powerful gym transformation story with intense motivation."
  },
  money: {
    mode: "money",
    goal: "money",
    topic: "A side hustle idea almost nobody is taking advantage of."
  },
  mrbeast: {
    mode: "mrbeast",
    goal: "views",
    topic: "A crazy 24 hour challenge with high stakes."
  },
  brainrot: {
    mode: "brainrot",
    goal: "views",
    topic: "A chaotic meme-style short that gets more absurd every second."
  },
  controversial: {
    mode: "controversial",
    goal: "views",
    topic: "A controversial opinion that instantly sparks debate."
  },
  story: {
    mode: "story",
    goal: "story",
    topic: "An emotional comeback story with a huge payoff."
  }
};

const TEMPLATE_GALLERY = [
  {
    id: "ai-animal-rescue",
    name: "AI Animal Rescue",
    category: "Animal",
    mode: "animal",
    goal: "animal",
    topic: "A cinematic AI animal rescue short where a tiny injured animal is saved from danger and the ending is emotional."
  },
  {
    id: "faceless-mystery",
    name: "Faceless Mystery",
    category: "Faceless",
    mode: "viral",
    goal: "faceless",
    topic: "A faceless mystery short about a strange real-world secret that sounds fake but is actually true."
  },
  {
    id: "gym-transformation",
    name: "Gym Transformation",
    category: "Fitness",
    mode: "fitness",
    goal: "gym",
    topic: "A gym transformation short about someone being underestimated, training in silence, and proving everyone wrong."
  },
  {
    id: "side-hustle-explainer",
    name: "Side Hustle Explainer",
    category: "Money",
    mode: "money",
    goal: "money",
    topic: "A beginner-friendly side hustle short about a simple online method most people overlook."
  },
  {
    id: "controversial-hot-take",
    name: "Controversial Hot Take",
    category: "Debate",
    mode: "controversial",
    goal: "views",
    topic: "A bold but safe controversial take about a common habit that may be quietly holding people back."
  },
  {
    id: "mrbeast-challenge",
    name: "MrBeast Challenge",
    category: "Challenge",
    mode: "mrbeast",
    goal: "views",
    topic: "A high-stakes challenge where someone has 24 hours to complete an impossible task for a huge reward."
  },
  {
    id: "brainrot-story",
    name: "Brainrot Story",
    category: "Brainrot",
    mode: "brainrot",
    goal: "views",
    topic: "A chaotic brainrot story where a normal situation gets more absurd every second until the final twist."
  },
  {
    id: "product-promo",
    name: "Product Promo",
    category: "Product",
    mode: "viral",
    goal: "product",
    topic: "A short viral product promo that makes a simple product feel unexpectedly useful, satisfying, and shareable."
  }
];

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return alert(message);

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function getFavoriteTemplates() {
  return JSON.parse(localStorage.getItem("sf_favorite_templates") || "[]");
}

function saveFavoriteTemplates(favorites) {
  localStorage.setItem("sf_favorite_templates", JSON.stringify(favorites));
}

window.loadTemplate = (templateId) => {
  const template = TEMPLATE_GALLERY.find(t => t.id === templateId);
  if (!template) return;

  document.getElementById("topic").value = template.topic;
  document.getElementById("mode").value = template.mode;
  document.getElementById("goal").value = template.goal;

  showToast("Template loaded!");
};

window.toggleTemplateFavorite = (templateId) => {
  let favorites = getFavoriteTemplates();

  if (favorites.includes(templateId)) {
    favorites = favorites.filter(id => id !== templateId);
    showToast("Removed from favorites");
  } else {
    favorites.push(templateId);
    showToast("Added to favorites");
  }

  saveFavoriteTemplates(favorites);
  renderTemplateGallery();
};

window.renderTemplateGallery = () => {
  const container = document.getElementById("templateGallery");
  if (!container) return;

  const favorites = getFavoriteTemplates();

  container.innerHTML = TEMPLATE_GALLERY.map(template => {
    const isFavorite = favorites.includes(template.id);

    return `
      <div class="template-card">
        <div class="meta">${template.category}</div>

        <strong>${template.name}</strong>

        <p>${template.topic}</p>

        <div class="template-actions">
          <button class="copy-btn" onclick="loadTemplate('${template.id}')">
            Load
          </button>

          <button class="copy-btn" onclick="toggleTemplateFavorite('${template.id}')">
            ${isFavorite ? "★ Favorited" : "☆ Favorite"}
          </button>
        </div>
      </div>
    `;
  }).join("");
};

window.renderFavoriteTemplates = () => {
  const container = document.getElementById("favoriteTemplates");
  if (!container) return;

  const favorites = getFavoriteTemplates();
  const templates = TEMPLATE_GALLERY.filter(template => favorites.includes(template.id));

  if (templates.length === 0) {
    container.innerHTML = `<div class="planner-empty">No favorite templates yet.</div>`;
    return;
  }

  container.innerHTML = templates.map(template => `
    <div class="template-card">
      <div class="meta">${template.category}</div>
      <strong>${template.name}</strong>

      <div class="template-actions">
        <button class="copy-btn" onclick="loadTemplate('${template.id}')">
          Load
        </button>
      </div>
    </div>
  `).join("");
};

function getWorkspaces() {
  return JSON.parse(localStorage.getItem("sf_workspaces") || "[]");
}

function saveWorkspaces(workspaces) {
  localStorage.setItem("sf_workspaces", JSON.stringify(workspaces));
}

function ensureDefaultWorkspace() {
  let workspaces = getWorkspaces();

  if (workspaces.length === 0) {
    workspaces = [{ id: "default", name: "Main Workspace", createdAt: Date.now() }];
    saveWorkspaces(workspaces);
  }

  if (!workspaces.find(w => w.id === currentWorkspaceId)) {
    currentWorkspaceId = "default";
    localStorage.setItem("sf_current_workspace", currentWorkspaceId);
  }
}

function renderWorkspaces() {
  const select = document.getElementById("workspaceSelect");
  if (!select) return;

  select.innerHTML = getWorkspaces().map(w => `
    <option value="${w.id}" ${w.id === currentWorkspaceId ? "selected" : ""}>
      ${w.name}
    </option>
  `).join("");
}

window.createWorkspace = () => {
  const name = prompt("Workspace name:");
  if (!name) return;

  const workspaces = getWorkspaces();

  const workspace = {
    id: `workspace-${Date.now()}`,
    name,
    createdAt: Date.now()
  };

  workspaces.push(workspace);
  saveWorkspaces(workspaces);

  currentWorkspaceId = workspace.id;
  localStorage.setItem("sf_current_workspace", currentWorkspaceId);

  renderWorkspaces();
  loadScripts();
  showToast("Workspace created!");
};

window.switchWorkspace = () => {
  const select = document.getElementById("workspaceSelect");
  if (!select) return;

  currentWorkspaceId = select.value;
  localStorage.setItem("sf_current_workspace", currentWorkspaceId);

  loadScripts();
  showToast("Workspace switched!");
};

window.deleteWorkspace = () => {
  if (currentWorkspaceId === "default") {
    showToast("Main Workspace cannot be deleted");
    return;
  }

  let workspaces = getWorkspaces().filter(w => w.id !== currentWorkspaceId);
  saveWorkspaces(workspaces);

  localStorage.removeItem(`sf_saved_scripts_${currentWorkspaceId}`);

  currentWorkspaceId = "default";
  localStorage.setItem("sf_current_workspace", currentWorkspaceId);

  renderWorkspaces();
  loadScripts();
  showToast("Workspace deleted");
};
function getCompetitorKey() {
  return `sf_competitors_${currentWorkspaceId}`;
}

window.loadCompetitors = () => {
  competitorCache = JSON.parse(localStorage.getItem(getCompetitorKey()) || "[]");
  renderCompetitors();
};

window.addCompetitor = () => {
  const name = document.getElementById("competitorName")?.value.trim();
  const platform = document.getElementById("competitorPlatform")?.value.trim();
  const niche = document.getElementById("competitorNiche")?.value.trim();
  const notes = document.getElementById("competitorNotes")?.value.trim();

  if (!name) {
    showToast("Enter a competitor/channel name");
    return;
  }

  competitorCache.unshift({
    id: `competitor-${Date.now()}`,
    name,
    platform,
    niche,
    notes,
    createdAt: Date.now()
  });

  localStorage.setItem(getCompetitorKey(), JSON.stringify(competitorCache));

  document.getElementById("competitorName").value = "";
  document.getElementById("competitorPlatform").value = "";
  document.getElementById("competitorNiche").value = "";
  document.getElementById("competitorNotes").value = "";

  showToast("Competitor added");
  renderCompetitors();
};

window.renderCompetitors = () => {
  const container = document.getElementById("competitorTracker");
  if (!container) return;

  if (competitorCache.length === 0) {
    container.innerHTML = `<div class="planner-empty">No competitors tracked yet.</div>`;
    return;
  }

  container.innerHTML = competitorCache.map(item => `
    <div class="template-card">
      <div class="meta">
        ${item.platform || "Platform unknown"} • ${item.niche || "No niche"}
      </div>

      <strong>${item.name}</strong>

      <p>${item.notes || "No notes yet."}</p>

      <div class="template-actions">
        <button class="delete-btn" onclick="deleteCompetitor('${item.id}')">
          Delete
        </button>
      </div>
    </div>
  `).join("");
};

window.deleteCompetitor = (id) => {
  competitorCache = competitorCache.filter(item => item.id !== id);
  localStorage.setItem(getCompetitorKey(), JSON.stringify(competitorCache));
  showToast("Competitor deleted");
  renderCompetitors();
};
function isProUser() {
  return localStorage.getItem("sf_pro") === "true";
}
function requirePro(featureName = "This feature") {
  if (isProUser()) return true;

  showToast(`${featureName} is a Pro feature`);

  const wantsUpgrade = confirm(
    `${featureName} is included with ShortForge Pro.\n\nPro unlocks:\n- Unlimited generations\n- Premium creator tools\n- Advanced dashboards\n- Future AI image tools\n\nStripe checkout coming soon.`
  );

  if (wantsUpgrade) {
    showUpgradeMessage();
  }

  return false;
}
function getGenerationLimit() {
  return isProUser() ? PRO_LIMIT : FREE_LIMIT;
}
function getUsageCount() {
  return parseInt(localStorage.getItem("sf_usage_count") || "0");
}

function incrementUsage() {
  localStorage.setItem("sf_usage_count", getUsageCount() + 1);
  updateUsageUI();
}

function updateUsageUI() {
  const usageText = document.getElementById("usageText");
  const usageBadge = document.getElementById("usageBadge");

  if (!usageText || !usageBadge) return;

  const used = getUsageCount();
  const remaining = Math.max(0, getGenerationLimit() - used);

  usageText.innerText = isProUser()
  ? `Pro Plan Active • ${used} generations used`
  : `${used} / ${FREE_LIMIT} generations used`;
  usageBadge.innerText = isProUser()
  ? "Unlimited"
  : `${remaining} left`;

  usageBadge.style.background =
    remaining <= 5
      ? "linear-gradient(135deg, #ef4444, #dc2626)"
      : "linear-gradient(135deg, #22c55e, #16a34a)";
}

function canGenerate() {
  return getUsageCount() < getGenerationLimit();
}
window.applyTheme = () => {
  document.body.classList.remove("theme-dark", "theme-neon", "theme-midnight");
  document.body.classList.add(`theme-${currentTheme}`);
};

window.toggleTheme = () => {
  const themes = ["dark", "neon", "midnight"];
  const currentIndex = themes.indexOf(currentTheme);

  currentTheme = themes[(currentIndex + 1) % themes.length];

  localStorage.setItem("sf_theme", currentTheme);
  applyTheme();

  showToast(`Theme changed to ${currentTheme}`);
};
window.showUpgradeMessage = async () => {

  try {
    showToast("Opening Stripe checkout...");

    const res = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      throw new Error(data.error || "Checkout failed");
    }

    window.location.href = data.url;

  } catch (error) {
    console.error(error);

    const wantsDemo = confirm(
      "Stripe checkout is not fully connected yet.\n\nUse demo Pro mode for testing?"
    );

    if (!wantsDemo) return;

    localStorage.setItem("sf_pro", "true");
    updateUsageUI();
    showToast("🚀 Demo Pro Mode Activated");
  }
};

window.usePromptPreset = (presetName) => {
  const preset = promptPresets[presetName];
  if (!preset) return;

  document.getElementById("topic").value = preset.topic;
  document.getElementById("mode").value = preset.mode;
  document.getElementById("goal").value = preset.goal;

  showToast("Prompt loaded!");
};

function renderViralScore(text) {
  const scoreMatch = text.match(/VIRAL_SCORE:\s*(\d{1,3})/i);

  if (!scoreMatch) return text;

  const score = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));

  let label = "Needs Work";
  let className = "score-low";

  if (score >= 80) {
    label = "Viral Potential";
    className = "score-high";
  } else if (score >= 60) {
    label = "Strong";
    className = "score-mid";
  }

  const scoreHTML = `
    <div class="viral-score-card">
      <div class="viral-score-top">
        <span>Viral Score</span>
        <strong>${score}/100</strong>
      </div>

      <div class="viral-score-bar">
        <div class="viral-score-fill ${className}" style="width:${score}%"></div>
      </div>

      <div class="viral-score-label">${label}</div>
    </div>
  `;

  return text.replace(/VIRAL_SCORE:\s*\d{1,3}(\/100)?/i, scoreHTML);
}

function formatOutput(text) {
  const scoredText = renderViralScore(text || "");

  return scoredText
    .replace(/\n/g, "<br>")
    .replace(/VIDEO_TITLE:/g, `<div class="section-title">VIDEO TITLE</div>`)
    .replace(/THUMBNAIL_TEXT:/g, `<div class="section-title">THUMBNAIL TEXT</div>`)
    .replace(/THUMBNAIL_IDEA:/g, `<div class="section-title">THUMBNAIL IDEA</div>`)
    .replace(/HOOK:/g, `<div class="section-title hook">HOOK</div>`)
    .replace(/BODY:/g, `<div class="section-title">BODY</div>`)
    .replace(/SCENE_BREAKDOWN:/g, `<div class="section-title">SCENE BREAKDOWN</div>`)
    .replace(/IMAGE_PROMPTS:/g, `<div class="section-title">IMAGE PROMPTS</div>`)
    .replace(/EDITING_NOTES:/g, `<div class="section-title">EDITING NOTES</div>`)
    .replace(/CTA:/g, `<div class="section-title">CTA</div>`)
    .replace(/IMPROVEMENT_TIP:/g, `<div class="section-title">IMPROVEMENT TIP</div>`)
    .replace(/TREND_DASHBOARD:/g, `<div class="section-title">TREND DASHBOARD</div>`)
    .replace(/ANALYTICS_DASHBOARD:/g, `<div class="section-title">ANALYTICS DASHBOARD</div>`)
    .replace(/CHANNEL_INTELLIGENCE:/g, `<div class="section-title">CHANNEL INTELLIGENCE</div>`)
    .replace(/VIDEO_SCENE_GENERATOR:/g, `<div class="section-title">VIDEO SCENE GENERATOR</div>`)
    .replace(/THUMBNAIL_STUDIO:/g, `<div class="section-title">THUMBNAIL STUDIO</div>`)
    .replace(/BRANDING_SUITE:/g, `<div class="section-title">BRANDING SUITE</div>`)
    .replace(/CAPCUT_EXPORT:/g, `<div class="section-title">CAPCUT EXPORT</div>`)
    .replace(/SERIES_TITLE:/g, `<div class="section-title">SERIES TITLE</div>`)
    .replace(/SERIES_CONCEPT:/g, `<div class="section-title">SERIES CONCEPT</div>`)
    .replace(/TARGET_AUDIENCE:/g, `<div class="section-title">TARGET AUDIENCE</div>`)
    .replace(/WHY_THIS_SERIES_COULD_GO_VIRAL:/g, `<div class="section-title">WHY THIS SERIES COULD GO VIRAL</div>`)
    .replace(/RECURRING_HOOK_STYLE:/g, `<div class="section-title">RECURRING HOOK STYLE</div>`)
    .replace(/VISUAL_STYLE:/g, `<div class="section-title">VISUAL STYLE</div>`)
    .replace(/POSTING_ORDER:/g, `<div class="section-title">POSTING ORDER</div>`)
    .replace(/RETENTION_STRATEGY:/g, `<div class="section-title">RETENTION STRATEGY</div>`)
    .replace(/HOOK_NUMBER:/g, `<div class="section-title">HOOK NUMBER</div>`)
    .replace(/WHY_IT_WORKS:/g, `<div class="section-title">WHY IT WORKS</div>`)
    .replace(/RETENTION_TRIGGER:/g, `<div class="section-title">RETENTION TRIGGER</div>`)
    .replace(/BEST_VIDEO_STYLE:/g, `<div class="section-title">BEST VIDEO STYLE</div>`)
    .replace(/PLATFORM_FORMATTER:/g, `<div class="section-title">PLATFORM FORMATTER</div>`)
.replace(/YOUTUBE_SHORTS_TITLE:/g, `<div class="section-title">YOUTUBE SHORTS TITLE</div>`)
.replace(/TIKTOK_CAPTION:/g, `<div class="section-title">TIKTOK CAPTION</div>`)
.replace(/INSTAGRAM_REELS_CAPTION:/g, `<div class="section-title">INSTAGRAM REELS CAPTION</div>`)
.replace(/YOUTUBE_DESCRIPTION:/g, `<div class="section-title">YOUTUBE DESCRIPTION</div>`)
.replace(/HASHTAGS:/g, `<div class="section-title">HASHTAGS</div>`)
.replace(/PINNED_COMMENT:/g, `<div class="section-title">PINNED COMMENT</div>`)
.replace(/UPLOAD_CHECKLIST:/g, `<div class="section-title">UPLOAD CHECKLIST</div>`)
.replace(/BEST_POSTING_ANGLE:/g, `<div class="section-title">BEST POSTING ANGLE</div>`)
.replace(/SEO_KEYWORDS:/g, `<div class="section-title">SEO KEYWORDS</div>`)
.replace(/ENGAGEMENT_QUESTION:/g, `<div class="section-title">ENGAGEMENT QUESTION</div>`)
.replace(/NICHE_NAME:/g, `<div class="section-title">NICHE NAME</div>`)
.replace(/WHY_IT_WORKS:/g, `<div class="section-title">WHY IT WORKS</div>`)
.replace(/TARGET_AUDIENCE:/g, `<div class="section-title">TARGET AUDIENCE</div>`)
.replace(/MONETIZATION_POTENTIAL:/g, `<div class="section-title">MONETIZATION POTENTIAL</div>`)
.replace(/VIRAL_POTENTIAL:/g, `<div class="section-title">VIRAL POTENTIAL</div>`)
.replace(/COMPETITION_LEVEL:/g, `<div class="section-title">COMPETITION LEVEL</div>`)
.replace(/BEST_PLATFORM:/g, `<div class="section-title">BEST PLATFORM</div>`)
.replace(/CONTENT_EXAMPLES:/g, `<div class="section-title">CONTENT EXAMPLES</div>`)
.replace(/CHANNEL_IDEA:/g, `<div class="section-title">CHANNEL IDEA</div>`)
.replace(/POSTING_FREQUENCY:/g, `<div class="section-title">POSTING FREQUENCY</div>`)
.replace(/FACILESS_OR_PERSONALITY:/g, `<div class="section-title">FACELESS OR PERSONALITY</div>`)
.replace(/LONG_TERM_POTENTIAL:/g, `<div class="section-title">LONG TERM POTENTIAL</div>`)
.replace(/BEST_STARTING_NICHE:/g, `<div class="section-title">BEST STARTING NICHE</div>`)
.replace(/FASTEST_TO_GROW:/g, `<div class="section-title">FASTEST TO GROW</div>`)
.replace(/BEST_FOR_MONEY:/g, `<div class="section-title">BEST FOR MONEY</div>`)
.replace(/BEST_FOR_FACILESS:/g, `<div class="section-title">BEST FOR FACELESS</div>`)
.replace(/BEST_FOR_BRAND_DEALS:/g, `<div class="section-title">BEST FOR BRAND DEALS</div>`)
.replace(/MONETIZATION_DASHBOARD:/g, `<div class="section-title">MONETIZATION DASHBOARD</div>`)
.replace(/BEST_REVENUE_MODEL:/g, `<div class="section-title">BEST REVENUE MODEL</div>`)
.replace(/FASTEST_WAY_TO_MAKE_MONEY:/g, `<div class="section-title">FASTEST WAY TO MAKE MONEY</div>`)
.replace(/LONG_TERM_BUSINESS_MODEL:/g, `<div class="section-title">LONG TERM BUSINESS MODEL</div>`)
.replace(/BEST_AFFILIATE_PRODUCTS:/g, `<div class="section-title">BEST AFFILIATE PRODUCTS</div>`)
.replace(/DIGITAL_PRODUCT_IDEAS:/g, `<div class="section-title">DIGITAL PRODUCT IDEAS</div>`)
.replace(/COURSE_IDEAS:/g, `<div class="section-title">COURSE IDEAS</div>`)
.replace(/SPONSORSHIP_CATEGORIES:/g, `<div class="section-title">SPONSORSHIP CATEGORIES</div>`)
.replace(/BRAND_DEAL_POTENTIAL:/g, `<div class="section-title">BRAND DEAL POTENTIAL</div>`)
.replace(/EMAIL_LIST_IDEA:/g, `<div class="section-title">EMAIL LIST IDEA</div>`)
.replace(/LEAD_MAGNET_IDEA:/g, `<div class="section-title">LEAD MAGNET IDEA</div>`)
.replace(/COMMUNITY_IDEA:/g, `<div class="section-title">COMMUNITY IDEA</div>`)
.replace(/MERCH_IDEA:/g, `<div class="section-title">MERCH IDEA</div>`)
.replace(/BEST_PLATFORM_FOR_MONEY:/g, `<div class="section-title">BEST PLATFORM FOR MONEY</div>`)
.replace(/MONTH_1_STRATEGY:/g, `<div class="section-title">MONTH 1 STRATEGY</div>`)
.replace(/MONTH_3_STRATEGY:/g, `<div class="section-title">MONTH 3 STRATEGY</div>`)
.replace(/MONTH_6_STRATEGY:/g, `<div class="section-title">MONTH 6 STRATEGY</div>`)
.replace(/ESTIMATED_FIRST_INCOME_TIMELINE:/g, `<div class="section-title">ESTIMATED FIRST INCOME TIMELINE</div>`)
.replace(/MONETIZATION_DIFFICULTY:/g, `<div class="section-title">MONETIZATION DIFFICULTY</div>`)
.replace(/MOST_REALISTIC_INCOME_SOURCE:/g, `<div class="section-title">MOST REALISTIC INCOME SOURCE</div>`)
.replace(/BIGGEST_MISTAKE_TO_AVOID:/g, `<div class="section-title">BIGGEST MISTAKE TO AVOID</div>`)
.replace(/THUMBNAIL_STYLES:/g, `<div class="section-title">THUMBNAIL STYLES</div>`)
.replace(/BEST_THUMBNAIL_CONCEPT:/g, `<div class="section-title">BEST THUMBNAIL CONCEPT</div>`)
.replace(/BEST_EMOTION:/g, `<div class="section-title">BEST EMOTION</div>`)
.replace(/BEST_COLORS:/g, `<div class="section-title">BEST COLORS</div>`)
.replace(/BEST_TEXT:/g, `<div class="section-title">BEST TEXT</div>`)
.replace(/CLICKABILITY_SCORE:/g, `<div class="section-title">CLICKABILITY SCORE</div>`)
.replace(/THUMBNAIL_WARNINGS:/g, `<div class="section-title">THUMBNAIL WARNINGS</div>`)
.replace(/YOUTUBE_THUMBNAIL_PROMPT:/g, `<div class="section-title">YOUTUBE THUMBNAIL PROMPT</div>`)
.replace(/TIKTOK_COVER_PROMPT:/g, `<div class="section-title">TIKTOK COVER PROMPT</div>`)
.replace(/INSTAGRAM_COVER_PROMPT:/g, `<div class="section-title">INSTAGRAM COVER PROMPT</div>`)
.replace(/CINEMATIC_AI_IMAGE_PROMPTS:/g, `<div class="section-title">CINEMATIC AI IMAGE PROMPTS</div>`)
.replace(/BACKGROUND_IDEAS:/g, `<div class="section-title">BACKGROUND IDEAS</div>`)
.replace(/FACIAL_EXPRESSION_IDEAS:/g, `<div class="section-title">FACIAL EXPRESSION IDEAS</div>`)
.replace(/LIGHTING_STYLE:/g, `<div class="section-title">LIGHTING STYLE</div>`)
.replace(/BEST_COMPOSITION:/g, `<div class="section-title">BEST COMPOSITION</div>`)
.replace(/BEST_FONT_STYLE:/g, `<div class="section-title">BEST FONT STYLE</div>`)
.replace(/THUMBNAIL_VARIATIONS:/g, `<div class="section-title">THUMBNAIL VARIATIONS</div>`)
.replace(/VOICEOVER_SCRIPT:/g, `<div class="section-title">VOICEOVER SCRIPT</div>`)
.replace(/BEST_VOICE_STYLE:/g, `<div class="section-title">BEST VOICE STYLE</div>`)
.replace(/20_SECOND_VERSION:/g, `<div class="section-title">20 SECOND VERSION</div>`)
.replace(/30_SECOND_VERSION:/g, `<div class="section-title">30 SECOND VERSION</div>`)
.replace(/60_SECOND_VERSION:/g, `<div class="section-title">60 SECOND VERSION</div>`)
.replace(/VOICEOVER_PACING:/g, `<div class="section-title">VOICEOVER PACING</div>`)
.replace(/EMPHASIS_NOTES:/g, `<div class="section-title">EMPHASIS NOTES</div>`)
.replace(/PAUSE_NOTES:/g, `<div class="section-title">PAUSE NOTES</div>`)
.replace(/EMOTION_DIRECTION:/g, `<div class="section-title">EMOTION DIRECTION</div>`)
.replace(/CAPCUT_VOICEOVER_TEXT:/g, `<div class="section-title">CAPCUT VOICEOVER TEXT</div>`)
.replace(/ELEVENLABS_PROMPT:/g, `<div class="section-title">ELEVENLABS PROMPT</div>`)
.replace(/BACKGROUND_MUSIC_STYLE:/g, `<div class="section-title">BACKGROUND MUSIC STYLE</div>`)
.replace(/SOUND_EFFECT_CUES:/g, `<div class="section-title">SOUND EFFECT CUES</div>`)
.replace(/RETENTION_VOICEOVER_TIPS:/g, `<div class="section-title">RETENTION VOICEOVER TIPS</div>`);
}

async function postTool(endpoint, body, loadingMessage, successMessage, failMessage) {
  const output = document.getElementById("output");
  output.innerHTML = `
  <div class="loading-state">
    <div class="spinner"></div>
    <div class="loading-text">${loadingMessage}</div>
  </div>
`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
  output.innerHTML = `
    <div class="error-box">
      <div class="error-title">
        ⚠️ Something went wrong
      </div>

      <div class="error-message">
        ${data.error || failMessage}
      </div>
    </div>
  `;

  showToast(failMessage);
  return false;
}

    lastGenerated = data.result || "";
    output.innerHTML = formatOutput(lastGenerated);
    showToast(successMessage);
    return true;

  } catch (err) {
  console.error(err);

  output.innerHTML = `
    <div class="error-box">
      <div class="error-title">
        ⚠️ Connection Error
      </div>

      <div class="error-message">
        ${err.message}
      </div>
    </div>
  `;

  showToast(failMessage);
  return false;
}
}

window.generate = async () => {
  if (!canGenerate()) {
    showToast("❌ Free plan limit reached");
    return;
  }

  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  if (!topic) {
    showToast("Enter a topic first");
    return;
  }

  const ok = await postTool(
    "/generate",
    { topic, mode, goal },
    "⏳ Generating viral content...",
    "Generated!",
    "Generation failed"
  );

  if (ok) incrementUsage();
};

window.trendDashboard = async () => {
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/trend-dashboard",
    { topic, mode, goal },
    "📈 Analyzing viral trend opportunities...",
    "Trend Dashboard ready!",
    "Trend Dashboard failed"
  );
};

window.generateIdeas = async () => {
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/ideas",
    { mode, goal },
    "🔥 Generating trending ideas...",
    "Trending ideas ready!",
    "Ideas failed"
  );
};

window.analyzeHook = async () => {
  if (!lastGenerated) return showToast("Generate content first");

  await postTool(
    "/analyze-hook",
    { content: lastGenerated },
    "🧠 Analyzing hook...",
    "Hook analysis ready!",
    "Hook analysis failed"
  );
};

window.thumbnailStudio = async () => {
  if (!lastGenerated) return showToast("Generate content first");

  await postTool(
    "/thumbnail-studio",
    { content: lastGenerated },
    "🖼️ Building thumbnail strategy...",
    "Thumbnail Studio ready!",
    "Thumbnail Studio failed"
  );
};

window.brandingSuite = async () => {
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  if (!topic) return showToast("Enter a niche/topic first");

  await postTool(
    "/branding-suite",
    { topic, mode, goal },
    "🎨 Building creator brand...",
    "Branding Suite ready!",
    "Branding Suite failed"
  );
};

window.analyticsDashboard = async () => {
  if (!lastGenerated) return showToast("Generate content first");

  await postTool(
    "/analytics-dashboard",
    { content: lastGenerated },
    "📊 Predicting content performance...",
    "Analytics ready!",
    "Analytics failed"
  );
};

window.channelIntelligence = async () => {
    if (!requirePro("Channel Intelligence")) return;
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  if (!topic) return showToast("Enter a niche/topic first");

  await postTool(
    "/channel-intelligence",
    { topic, mode, goal },
    "🧠 Building creator intelligence report...",
    "Channel Intelligence ready!",
    "Channel intelligence failed"
  );
};
window.seriesGenerator = async () => {
    if (!requirePro("Feature Name")) return;
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  if (!topic) {
    showToast("Enter a niche/topic first");
    return;
  }

  await postTool(
    "/series-generator",
    { topic, mode, goal },
    "📺 Building bingeable content series...",
    "Series Generator ready!",
    "Series generator failed"
  );
};
window.hookGenerator = async () => {
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  if (!topic) {
    showToast("Enter a niche/topic first");
    return;
  }

  await postTool(
    "/hook-generator",
    { topic, mode, goal },
    "🪝 Generating viral hooks...",
    "Hook Generator ready!",
    "Hook generator failed"
  );
};

window.platformFormatter = async () => {
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/platform-formatter",
    {
      topic,
      mode,
      goal,
      content: lastGenerated
    },
    "📱 Formatting for all platforms...",
    "Platform Formatter ready!",
    "Platform formatter failed"
  );
};
window.nicheFinder = async () => {
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/niche-finder",
    {
      topic,
      mode,
      goal
    },
    "🧠 Finding profitable niches...",
    "Niche Finder ready!",
    "Niche finder failed"
  );
};
window.monetizationDashboard = async () => {
    if (!requirePro("Feature Name")) return;
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/monetization-dashboard",
    {
      topic,
      mode,
      goal,
      content: lastGenerated
    },
    "💰 Building monetization strategy...",
    "Monetization Dashboard ready!",
    "Monetization dashboard failed"
  );
};
window.thumbnailGenerator = async () => {
    if (!requirePro("Feature Name")) return;
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/thumbnail-generator",
    {
      topic,
      mode,
      goal,
      content: lastGenerated
    },
    "🖼️ Generating thumbnail prompts...",
    "Thumbnail Generator ready!",
    "Thumbnail generator failed"
  );
};
window.voiceoverScript = async () => {
    if (!requirePro("Feature Name")) return;
  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  await postTool(
    "/voiceover-script",
    {
      topic,
      mode,
      goal,
      content: lastGenerated
    },
    "🎙️ Building AI voiceover scripts...",
    "Voiceover Script ready!",
    "Voiceover script failed"
  );
};
window.videoSceneGenerator = async () => {
  if (!lastGenerated) return showToast("Generate content first");

  await postTool(
    "/video-scene-generator",
    { content: lastGenerated },
    "🎬 Building cinematic production plan...",
    "Video scenes ready!",
    "Scene generation failed"
  );
};

window.exportCapCut = async () => {
  if (!lastGenerated) return showToast("Generate content first");

  await postTool(
    "/capcut-export",
    { content: lastGenerated },
    "🎬 Building CapCut export...",
    "CapCut export ready!",
    "CapCut export failed"
  );
};

window.improveScript = async () => {
  if (!lastGenerated) return showToast("Generate content first");

  const goal = document.getElementById("goal").value;

  await postTool(
    "/generate",
    {
      topic: "Improve virality:\n\n" + lastGenerated,
      mode: "viral-plus",
      goal
    },
    "🔥 Making it more viral...",
    "Made more viral!",
    "Improve failed"
  );
};

window.copyScript = async () => {
  if (!lastGenerated) return showToast("Nothing to copy");

  await navigator.clipboard.writeText(lastGenerated);
  showToast("Copied!");
};

window.downloadOutput = async () => {
  if (!lastGenerated) return showToast("Nothing to download");

  const blob = new Blob([lastGenerated], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `shortforge-export-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  showToast("Download started!");
};

window.saveScript = () => {
  if (!lastGenerated) return showToast("Generate content first");

  const topic = document.getElementById("topic").value.trim() || "Untitled";
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;

  const key = `sf_saved_scripts_${currentWorkspaceId}`;
  const scripts = JSON.parse(localStorage.getItem(key) || "[]");

  scripts.unshift({
    id: `script-${Date.now()}`,
    topic,
    mode,
    goal,
    status: "Idea",
    plannedAt: "",
    content: lastGenerated,
    createdAt: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(scripts));

  showToast("Saved to workspace!");
  loadScripts();
};

window.loadScripts = () => {
  const key = `sf_saved_scripts_${currentWorkspaceId}`;
  savedScriptsCache = JSON.parse(localStorage.getItem(key) || "[]");

  savedScriptsCache = savedScriptsCache.map(script => ({
    ...script,
    status: script.status || "Idea",
    plannedAt: script.plannedAt || ""
  }));

  localStorage.setItem(key, JSON.stringify(savedScriptsCache));

renderSavedScripts();
renderStatusBoard();
renderUploadPlanner();
renderContentCalendar();
loadCompetitors();
};

function formatPlannedDate(value) {
  if (!value) return "Not planned";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
}


window.renderStatusBoard = () => {
  const board = document.getElementById("statusBoard");
  if (!board) return;

  board.innerHTML = STATUS_OPTIONS.map(status => {
    const items = savedScriptsCache.filter(script => script.status === status);

    return `
      <div
        class="status-column"
        ondragover="allowStatusDrop(event)"
        ondrop="dropScriptIntoStatus(event, '${status}')"
      >

        <div class="status-heading">
          ${status}
          <span>${items.length}</span>
        </div>

        ${
          items.length === 0
            ? `<div class="status-empty">Drop scripts here</div>`
            : items.map(script => `

              <div
                class="status-card"
                draggable="true"
                ondragstart="dragScript(event, '${script.id}')"
              >

                <strong>${script.topic}</strong>

                <div class="meta">
                  ${script.mode.toUpperCase()} • ${script.goal.toUpperCase()}
                </div>

                <div class="meta">
                  ${
                    script.plannedAt
                      ? "Planned: " + formatPlannedDate(script.plannedAt)
                      : "No date planned"
                  }
                </div>

                <select onchange="updateScriptStatus('${script.id}', this.value)">
                  ${STATUS_OPTIONS.map(option => `
                    <option
                      value="${option}"
                      ${script.status === option ? "selected" : ""}
                    >
                      ${option}
                    </option>
                  `).join("")}
                </select>

              </div>

            `).join("")
        }

      </div>
    `;
  }).join("");
};
window.dragScript = (event, scriptId) => {
  event.dataTransfer.setData("text/plain", scriptId);
};

window.allowStatusDrop = (event) => {
  event.preventDefault();
};

window.dropScriptIntoStatus = (event, newStatus) => {
  event.preventDefault();

  const scriptId =
    event.dataTransfer.getData("text/plain");

  if (!scriptId) return;

  updateScriptStatus(scriptId, newStatus);

  showToast(`Moved to ${newStatus}`);
};
window.renderUploadPlanner = () => {
  const planner = document.getElementById("uploadPlanner");
  if (!planner) return;

  const planned = savedScriptsCache
    .filter(script => script.plannedAt)
    .sort((a, b) => new Date(a.plannedAt) - new Date(b.plannedAt));

  if (planned.length === 0) {
    planner.innerHTML = `<div class="planner-empty">No uploads planned yet. Add a date to a saved script below.</div>`;
    return;
  }

  planner.innerHTML = planned.map(script => `
    <div class="planner-card">
      <div>
        <strong>${script.topic}</strong>
        <div class="meta">${script.mode.toUpperCase()} • ${script.goal.toUpperCase()} • ${script.status}</div>
        <div class="planner-date">${formatPlannedDate(script.plannedAt)}</div>
      </div>

      <div class="planner-actions">
        <button class="secondary" onclick="markPosted('${script.id}')">Mark Posted</button>
        <button class="danger" onclick="clearPlannedDate('${script.id}')">Clear Date</button>
      </div>
    </div>
  `).join("");
};
window.renderContentCalendar = () => {
  const calendar = document.getElementById("contentCalendar");
  if (!calendar) return;

  const planned = savedScriptsCache
    .filter(script => script.plannedAt)
    .sort((a, b) => new Date(a.plannedAt) - new Date(b.plannedAt));

  if (planned.length === 0) {
    calendar.innerHTML = `
      <div class="planner-empty">
        No calendar posts yet. Schedule uploads from Saved Scripts.
      </div>
    `;
    return;
  }

  const today = new Date();
  const todayKey = today.toDateString();

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const todayUploads = planned.filter(script =>
    new Date(script.plannedAt).toDateString() === todayKey
  );

  const weekUploads = planned.filter(script => {
    const date = new Date(script.plannedAt);
    return date >= today && date <= sevenDaysFromNow;
  });

  const consistencyScore = Math.min(100, weekUploads.length * 15);

  const grouped = {};

  planned.forEach(script => {
    const key = new Date(script.plannedAt).toDateString();

    if (!grouped[key]) grouped[key] = [];

    grouped[key].push(script);
  });

  calendar.innerHTML = `
    <div class="calendar-stats">

      <div class="calendar-stat">
        <strong>${todayUploads.length}</strong>
        <span>Today</span>
      </div>

      <div class="calendar-stat">
        <strong>${weekUploads.length}</strong>
        <span>This Week</span>
      </div>

      <div class="calendar-stat">
        <strong>${consistencyScore}/100</strong>
        <span>Consistency Score</span>
      </div>

    </div>

    <div class="calendar-list">

      ${Object.keys(grouped).map(date => `

        <div class="calendar-day">

          <h3>${date}</h3>

          ${grouped[date].map(script => `

            <div class="calendar-item">

              <strong>${script.topic}</strong>

              <div class="meta">
                ${script.mode.toUpperCase()} •
                ${script.goal.toUpperCase()} •
                ${script.status}
              </div>

              <div class="planner-date">
                ${formatPlannedDate(script.plannedAt)}
              </div>

            </div>

          `).join("")}

        </div>

      `).join("")}

    </div>
  `;
};

window.renderSavedScripts = () => {
  const container = document.getElementById("saved");
  if (!container) return;

  const searchTerm = document.getElementById("savedSearch")?.value.toLowerCase().trim() || "";
  const selectedMode = document.getElementById("savedModeFilter")?.value || "all";
  const selectedStatus = document.getElementById("savedStatusFilter")?.value || "all";

  let filtered = savedScriptsCache;

  if (selectedMode !== "all") {
    filtered = filtered.filter(script => script.mode === selectedMode);
  }

  if (selectedStatus !== "all") {
    filtered = filtered.filter(script => script.status === selectedStatus);
  }

  if (searchTerm) {
    filtered = filtered.filter(script =>
      script.topic.toLowerCase().includes(searchTerm) ||
      script.content.toLowerCase().includes(searchTerm) ||
      script.mode.toLowerCase().includes(searchTerm) ||
      script.goal.toLowerCase().includes(searchTerm) ||
      script.status.toLowerCase().includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = "No saved scripts in this workspace.";
    return;
  }

  container.innerHTML = filtered.map(script => `
    <div class="saved-script">
      <div class="meta">
        ${script.mode.toUpperCase()} • ${script.goal.toUpperCase()} • ${script.status} • ${new Date(script.createdAt).toLocaleString()}
      </div>

      <strong>${script.topic}</strong>

      <div class="saved-actions">
        <select onchange="updateScriptStatus('${script.id}', this.value)">
          ${STATUS_OPTIONS.map(option => `
            <option value="${option}" ${script.status === option ? "selected" : ""}>
              ${option}
            </option>
          `).join("")}
        </select>

        <div class="meta">Schedule Upload</div>

        <input
          type="datetime-local"
          value="${script.plannedAt || ""}"
          onchange="updatePlannedDate('${script.id}', this.value)"
        />

        <button class="copy-btn" onclick="copySavedScript('${script.id}')">Copy</button>
        <button class="delete-btn" onclick="deleteScript('${script.id}')">Delete</button>
      </div>

      <div style="margin-top:10px;white-space:pre-wrap;">
        ${script.content}
      </div>
    </div>
  `).join("");
};

window.updateScriptStatus = (id, status) => {
  const key = `sf_saved_scripts_${currentWorkspaceId}`;

  const scripts = savedScriptsCache.map(script =>
    script.id === id ? { ...script, status } : script
  );

  localStorage.setItem(key, JSON.stringify(scripts));
  showToast("Status updated");
  loadScripts();
};

window.updatePlannedDate = (id, plannedAt) => {
  const key = `sf_saved_scripts_${currentWorkspaceId}`;

  const scripts = savedScriptsCache.map(script =>
    script.id === id ? { ...script, plannedAt } : script
  );

  localStorage.setItem(key, JSON.stringify(scripts));
  showToast(plannedAt ? "Upload planned" : "Date cleared");
  loadScripts();
};

window.clearPlannedDate = (id) => {
  updatePlannedDate(id, "");
};

window.markPosted = (id) => {
  const key = `sf_saved_scripts_${currentWorkspaceId}`;

  const scripts = savedScriptsCache.map(script =>
    script.id === id ? { ...script, status: "Posted" } : script
  );

  localStorage.setItem(key, JSON.stringify(scripts));
  showToast("Marked as posted");
  loadScripts();
};

window.copySavedScript = async (id) => {
  const script = savedScriptsCache.find(s => s.id === id);
  if (!script) return;

  await navigator.clipboard.writeText(script.content);
  showToast("Saved script copied!");
};

window.deleteScript = (id) => {
  const key = `sf_saved_scripts_${currentWorkspaceId}`;
  const scripts = savedScriptsCache.filter(s => s.id !== id);

  localStorage.setItem(key, JSON.stringify(scripts));
  showToast("Deleted");
  loadScripts();
};

window.logout = () => {
  showToast("Logout connected to auth later");
};

window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);

if (params.get("pro") === "true") {

  localStorage.setItem("sf_pro", "true");

  showToast("🚀 Pro Activated!");

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
}
  applyTheme();
    ensureDefaultWorkspace();
  renderWorkspaces();
  renderTemplateGallery();
  renderFavoriteTemplates();
  updateUsageUI();
  loadScripts();
});