import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL =
  "https://swrzmuqnidomnpqxvjoj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cnptdXFuaWRvbW5wcXh2am9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MjAzMzUsImV4cCI6MjA5NDk5NjMzNX0.Cr9csw8f6eHwuVttve30tUbsuC0VMrmV6isZLDIyGmM";

const supabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
supabaseClient.auth.getSession().then(() => {
  window.updateAuthUI();
  checkRealProStatus();
});
const FREE_LIMIT = 25;
const PRO_LIMIT = 999999;

let lastGenerated = "";
let assistantMessages = [];
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





// =========================
// AUTH SYSTEM
// =========================

window.signUp = async () => {
  const email =
    document.getElementById("authEmail")?.value.trim();

  const password =
    document.getElementById("authPassword")?.value.trim();

  if (!email || !password) {
    showToast("Enter email and password");
    return;
  }

  const { error } =
    await supabaseClient.auth.signUp({
      email,
      password
    });

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  showToast("Account created!");
};
window.signIn = async () => {
  const email = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPassword")?.value.trim();

  if (!email || !password) {
    showToast("Enter email and password");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showToast(error.message);
    return;
  }

  showToast("Logged in!");

// force session refresh before UI update
await supabaseClient.auth.getSession();
await window.updateAuthUI();
await checkRealProStatus();
};

window.doLogin = window.signIn;

window.logout = async () => {
  await supabaseClient.auth.signOut();

  realProStatus = false;

  updateUsageUI();

  showToast("Logged out");
};

window.updateAuthUI = async () => {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  const authStatus = document.getElementById("authStatus");
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");
  const signUpBtn = document.getElementById("signUpBtn");
  const signInBtn = document.getElementById("signInBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!authStatus) return;

  if (!session?.user) {
    realProStatus = false;
    currentUsage = 0;

    authStatus.innerText = "Not logged in";

    if (emailInput) emailInput.style.display = "block";
    if (passwordInput) passwordInput.style.display = "block";
    if (signUpBtn) signUpBtn.style.display = "block";
    if (signInBtn) signInBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";

    updateUsageUI();
    renderSavedScripts?.();
renderAnalyticsCharts?.();
renderWorkspaces?.();
    return;
  }

  authStatus.innerText = `Logged in as ${session.user.email}`;

  if (emailInput) emailInput.style.display = "none";
  if (passwordInput) passwordInput.style.display = "none";
  if (signUpBtn) signUpBtn.style.display = "none";
  if (signInBtn) signInBtn.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "block";

  const response = await fetch("/me", {
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (!response.ok) {
  console.warn("Profile fetch failed — using Supabase fallback");

  const { data } = await supabaseClient.auth.getUser();

  realProStatus = false;
  currentUsage = 0;

  window.stripeCustomerId = null;

  updateUsageUI();
  return;
}
const profile = await response.json();

realProStatus = profile.is_pro === true;
window.stripeCustomerId =
  profile.stripe_customer_id || null;
  const planLabel =
  document.getElementById("planLabel");

if (planLabel) {
  planLabel.textContent =
    realProStatus ? "PRO" : "Free";
}
currentUsage = profile.usage_count || 0;

updateUsageUI();
};
  

// =========================
// AUTH LISTENER
// =========================

supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log("AUTH EVENT:", event);

  (async () => {
  await window.updateAuthUI();
  updateUsageUI();
  await loadScripts?.();
})();
});
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
  return realProStatus === true;
}
async function checkRealProStatus() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    realProStatus = false;
    updateUsageUI();
    return;
  }

  const { data, error } =
    await supabaseClient
      .from("profiles")
      .select("is_pro")
      .eq("id", session.user.id)
      .single();

  if (error) {
    console.error(error);
    realProStatus = false;
  } else {
    realProStatus = data?.is_pro === true;
  }
console.log("REAL PRO STATUS:", realProStatus);
  updateUsageUI();
}
function requirePro(featureName = "This feature") {
  if (isProUser()) return true;

  showToast(`${featureName} is a Pro feature`);

  const wantsUpgrade = confirm(
    `${featureName} is included with ShortForge Pro.\n\nPro unlocks:\n- Unlimited generations\n- Premium creator tools\n- Advanced dashboards\n- Future AI image tools\n\nClick OK to upgrade now.`
  );

  if (wantsUpgrade) {
    window.location.href = "/pricing.html";
  }

  return false;
}
function getGenerationLimit() {
  return isProUser() ? PRO_LIMIT : FREE_LIMIT;
}
let currentUsage = 0;
function getUsageCount() {
  return currentUsage || 0;
}

function incrementUsage() {
  currentUsage++;
  updateUsageUI();
}
function updateDashboardStats() {
  const totalScriptsStat =
    document.getElementById("totalScriptsStat");

  const generationCountStat =
    document.getElementById("generationCountStat");

  const uploadStreakStat =
    document.getElementById("uploadStreakStat");

  const viralAverageStat =
    document.getElementById("viralAverageStat");

  if (totalScriptsStat) {
    totalScriptsStat.innerText =
      savedScriptsCache.length;
  }

  if (generationCountStat) {
    generationCountStat.innerText =
      getUsageCount();
  }

  if (uploadStreakStat) {
    const plannedCount =
      savedScriptsCache.filter(
        script => script.plannedAt
      ).length;

    uploadStreakStat.innerText =
      plannedCount;
  }

  if (viralAverageStat) {
    const scores =
      savedScriptsCache
        .map(script => {
          const match =
            script.content?.match(
              /VIRAL_SCORE:\s*(\d{1,3})/i
            );

          return match
            ? parseInt(match[1], 10)
            : null;
        })
        .filter(score => score !== null);

    const average =
      scores.length
        ? Math.round(
            scores.reduce((a, b) => a + b, 0) /
            scores.length
          )
        : 0;

    viralAverageStat.innerText =
      `${average}%`;
  }
}
function updateUsageUI() {
  const usageText = document.getElementById("usageText");
  const usageBadge = document.getElementById("usageBadge");

  if (!usageText || !usageBadge) return;

  const used = getUsageCount();
  const remaining = isProUser()
  ? PRO_LIMIT
  : Math.max(0, FREE_LIMIT - used);

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
window.manageSubscription = async () => {

  if (!window.stripeCustomerId) {
    showToast("No subscription found");
    return;
  }

  try {
    const response = await fetch(
      "/create-customer-portal-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerId: window.stripeCustomerId
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.url) {
      showToast(data.error || "Portal failed");
      return;
    }

    window.location.href = data.url;

  } catch (error) {
    console.error(error);
    showToast("Subscription error");
  }
};
window.showUpgradeMessage = () => {

  const modal =
    document.getElementById("upgradeModal");

  if (modal) {
    modal.style.display = "flex";
  }
};

window.closeUpgradeModal = () => {

  const modal =
    document.getElementById("upgradeModal");

  if (modal) {
    modal.style.display = "none";
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
  const match = text.match(/VIRAL_SCORE:\s*(\d+(\.\d+)?)(\s*\/\s*(10|100))?/i);

  if (!match) return text;

  const raw = parseFloat(match[1]);
  const scale = match[4] ? parseInt(match[4], 10) : 100;

  const percent =
    scale === 10 && raw <= 10
      ? raw * 10
      : raw;

  const display =
    scale === 10 && raw <= 10
      ? `${raw}/10`
      : `${Math.round(percent)}/100`;

  const label =
    percent >= 80 ? "Viral Potential" :
    percent >= 60 ? "Strong" :
    "Needs Work";

  const color =
    percent >= 80 ? "#22c55e" :
    percent >= 60 ? "#f59e0b" :
    "#ef4444";

  const cleanPercent =
    Math.min(100, Math.max(0, percent));

  return text.replace(match[0], `
    <div class="viral-score-card">
      <div class="viral-score-top">
        <span>Viral Score</span>
        <strong>${display}</strong>
      </div>

      <div style="width:100%;height:18px;background:linear-gradient(90deg, ${color} 0% ${cleanPercent}%, #1e293b ${cleanPercent}% 100%);border-radius:999px;margin:18px 0;"></div>

      <div class="viral-score-label">${label}</div>
    </div>
  `);
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
    autoSaveGeneration("Tool Export");
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
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showToast("Please log in first");
    return;
  }

  if (!canGenerate()) {
    showToast("❌ Free plan limit reached");
    return;
  }

  const topic = document.getElementById("topic").value.trim();
  const mode = document.getElementById("mode").value;
  const goal = document.getElementById("goal").value;
  const creatorMemory =
    localStorage.getItem("sf_creator_memory") || "";

  if (!topic) {
    showToast("Enter a topic first");
    return;
  }

  const output = document.getElementById("output");

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">⏳ Generating viral content...</div>
    </div>
  `;

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        topic,
        mode,
        goal,
        creatorMemory
      })
    });

    const data = await res.json();

    if (!res.ok) {
      output.innerHTML = `
        <div class="error-box">
          <div class="error-title">⚠️ Something went wrong</div>
          <div class="error-message">${data.error || "Generation failed"}</div>
        </div>
      `;

      showToast(data.error || "Generation failed");
      return;
    }

    lastGenerated = data.result || "";
    autoSaveGeneration("Script");
    output.innerHTML = formatOutput(lastGenerated);

    realProStatus = data.is_pro === true;
    localStorage.setItem("shortforge_pro", realProStatus ? "true" : "false");
    currentUsage = data.usage_count || 0;

    incrementUsage();
updateUsageUI();
updateDashboardStats();

    showToast("Generated!");

  } catch (err) {
    console.error(err);
    showToast("Generation failed");
  }
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

  if (!requirePro("Thumbnail Studio")) return;
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

  if (!requirePro("Analytics Dashboard")) return;
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
    if (!requirePro("Series Generator")) return;
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
    if (!requirePro("Monetization Dashboard")) return;
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
function getImageHistory() {
  return JSON.parse(
    localStorage.getItem("sf_image_history") || "[]"
  );
}

function saveImageToHistory(base64Image, prompt) {
  const history = getImageHistory();

  history.unshift({
    id: `image-${Date.now()}`,
    image: base64Image,
    prompt,
    createdAt: Date.now()
  });

  localStorage.setItem(
    "sf_image_history",
    JSON.stringify(history.slice(0, 30))
  );

  renderImageHistory();
}

window.renderImageHistory = () => {
  const container = document.getElementById("imageHistory");
  if (!container) return;

  const history = getImageHistory();

  if (history.length === 0) {
    container.innerHTML =
      `<div class="planner-empty">No AI images generated yet.</div>`;
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="template-card">
      <img
        src="data:image/png;base64,${item.image}"
        style="width:100%;border-radius:14px;margin-bottom:12px;"
      />

      <div class="meta">
        ${new Date(item.createdAt).toLocaleString()}
      </div>

      <button
        class="copy-btn"
        onclick="downloadGeneratedImage('${item.image}')"
      >
        Download
      </button>
    </div>
  `).join("");
};
window.generateAIImage = async () => {

  if (!requirePro("AI Thumbnail Image")) return;

  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  if (!requirePro("AI Image Generator")) return;

  const output = document.getElementById("output");

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        🎨 Generating AI thumbnail image...
      </div>
    </div>
  `;

  const prompt =
    `Create a high-click YouTube Shorts thumbnail image for this video.
    Make it cinematic, dramatic, bold, colorful, high contrast, vertical creator content style.
    No text in the image.
    
    Video concept:
    ${lastGenerated}`;

  try {
    const res = await fetch("/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
saveImageToHistory(data.image, prompt);
    if (!res.ok || !data.image) {
      throw new Error(data.error || "Image failed");
    }

    output.innerHTML = `
      <div class="section-title">
        AI THUMBNAIL IMAGE
      </div>

      <div class="image-result-card">
        <img
          src="data:image/png;base64,${data.image}"
          alt="AI generated thumbnail"
          class="generated-image"
        />

        <button
          class="copy-btn"
          onclick="downloadGeneratedImage('${data.image}')"
        >
          Download Image
        </button>
      </div>
    `;

    showToast("AI image generated!");

  } catch (error) {
    console.error(error);
    showToast("Image generation failed");

    output.innerHTML = `
      <div class="error-box">
        <div class="error-title">
          ⚠️ Image Generation Failed
        </div>

        <div class="error-message">
          ${error.message}
        </div>
      </div>
    `;
  }
};

window.downloadGeneratedImage = (base64Image) => {
  const a = document.createElement("a");

  a.href = `data:image/png;base64,${base64Image}`;
  a.download = `shortforge-thumbnail-${Date.now()}.png`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
window.thumbnailGenerator = async () => {
    if (!requirePro("Thumbnail Generator")) return;
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
    if (!requirePro("Voiceover Script")) return;
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
window.exportStudio = async () => {

  if (!requirePro("Export Studio")) return;

  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  

  const topic =
    document.getElementById("topic")?.value.trim();

  const mode =
    document.getElementById("mode")?.value;

  const goal =
    document.getElementById("goal")?.value;

  await postTool(
    "/export-studio",
    {
      topic,
      mode,
      goal,
      content: lastGenerated
    },
    "📦 Building creator export package...",
    "Export Studio ready!",
    "Export Studio failed"
  );
};
window.contentCalendarGenerator = async () => {
  if (!requirePro("Content Calendar Generator")) return;

  const niche =
    document.getElementById("creatorNiche")?.value.trim() ||
    document.getElementById("topic")?.value.trim();

  const goal =
    document.getElementById("creatorGoal")?.value ||
    document.getElementById("goal")?.value;

  if (!niche) {
    showToast("Enter a niche or topic first");
    return;
  }

  await postTool(
    "/content-calendar-generator",
    {
      niche,
      goal,
      days: 30
    },
    "📅 Building your 30-day content calendar...",
    "Content calendar ready!",
    "Content calendar failed"
  );
};
window.aiVideoPack = async () => {

  if (!requirePro("AI Video Pack")) return;

  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  

  await postTool(
    "/ai-video-pack",
    {
      content: lastGenerated
    },
    "🎞️ Building AI video production pack...",
    "AI Video Pack ready!",
    "AI video pack failed"
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
window.downloadPDF = () => {
  if (!lastGenerated) {
    showToast("Nothing to export");
    return;
  }

  const title =
    document.getElementById("topic")?.value.trim() ||
    "ShortForge Creator Export";

  const url =
    `/download-pdf?title=${encodeURIComponent(title)}&content=${encodeURIComponent(lastGenerated)}`;

  window.open(url, "_blank");

  showToast("PDF export started");
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
async function autoSaveGeneration(type = "Auto Saved") {
  if (!lastGenerated) return;

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) return;

  const title =
    document.getElementById("topic")?.value.trim() ||
    "Untitled Auto Save";

  await supabaseClient
    .from("saved_exports")
    .insert([
      {
        user_id: session.user.id,
        title,
        type,
        content: lastGenerated
      }
    ]);

  loadSavedExports();
}
window.saveExport = async (type = "General Export") => {
  if (!lastGenerated) {
    showToast("Nothing to save");
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    showToast("Log in to save exports");
    return;
  }

  const title =
    document.getElementById("topic")?.value.trim() ||
    "Untitled Export";

  const { error } =
    await supabaseClient
      .from("saved_exports")
      .insert([
        {
          user_id: session.user.id,
          title,
          type,
          content: lastGenerated
        }
      ]);

  if (error) {
    console.error(error);
    showToast("Export save failed");
    return;
  }

  showToast("Export saved!");
};
window.openSavedExport = async (id) => {

  const { data, error } =
    await supabaseClient
      .from("saved_exports")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !data) {
    showToast("Failed to open export");
    return;
  }

  lastGenerated = data.content;

  const output =
    document.getElementById("output");

  if (output) {
    output.innerHTML =
      data.content.replace(/\n/g, "<br>");
  }

  showToast("Export opened!");
};

window.copySavedExport = async (id) => {

  const { data, error } =
    await supabaseClient
      .from("saved_exports")
      .select("*")
      .eq("id", id)
      .single();

  if (error || !data) {
    showToast("Copy failed");
    return;
  }

  navigator.clipboard.writeText(
    data.content
  );

  showToast("Copied export!");
};

window.deleteSavedExport = async (id) => {

  const confirmed =
    confirm(
      "Delete this saved export?"
    );

  if (!confirmed) return;

  const { error } =
    await supabaseClient
      .from("saved_exports")
      .delete()
      .eq("id", id);

  if (error) {
    showToast("Delete failed");
    return;
  }

  showToast("Export deleted!");

  loadSavedExports();
};
window.saveScript = async () => {

  if (!lastGenerated)
    return showToast("Generate content first");

  const topic =
    document.getElementById("topic").value.trim() ||
    "Untitled";

  const mode =
    document.getElementById("mode").value;

  const goal =
    document.getElementById("goal").value;

  const scriptData = {
    id: `script-${Date.now()}`,
    topic,
    mode,
    goal,
    status: "Idea",
    plannedAt: "",
    content: lastGenerated,
    createdAt: Date.now()
  };

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {

    const { error } =
      await supabaseClient
        .from("scripts")
        .insert([
          {
            user_id: session.user.id,
            topic: scriptData.topic,
            mode: scriptData.mode,
            goal: scriptData.goal,
            status: scriptData.status,
            planned_at: scriptData.plannedAt,
            content: scriptData.content,
            created_at:
              new Date().toISOString()
          }
        ]);

    if (error) {
      console.error(error);
      showToast("Cloud save failed");
      return;
    }

    showToast("Saved to cloud!");

  } else {

    const key =
      `sf_saved_scripts_${currentWorkspaceId}`;

    const scripts =
      JSON.parse(
        localStorage.getItem(key) || "[]"
      );

    scripts.unshift(scriptData);

    localStorage.setItem(
      key,
      JSON.stringify(scripts)
    );

    showToast("Saved locally!");
  }
renderAnalyticsCharts();
  loadScripts();
};

window.loadScripts = async () => {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {

    const { data, error } =
      await supabaseClient
        .from("scripts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error(error);
      showToast("Failed to load cloud scripts");
      return;
    }

    savedScriptsCache = (data || []).map(script => ({
      id: script.id,
      topic: script.topic,
      mode: script.mode,
      goal: script.goal,
      status: script.status || "Idea",
      plannedAt: script.planned_at || "",
      content: script.content,
      createdAt: new Date(script.created_at).getTime()
    }));

  } else {

    const key =
      `sf_saved_scripts_${currentWorkspaceId}`;

    savedScriptsCache =
      JSON.parse(
        localStorage.getItem(key) || "[]"
      );

    savedScriptsCache =
      savedScriptsCache.map(script => ({
        ...script,
        status: script.status || "Idea",
        plannedAt: script.plannedAt || ""
      }));

    localStorage.setItem(
      key,
      JSON.stringify(savedScriptsCache)
    );
  }

  renderSavedScripts();
  loadSavedExports();
  renderStatusBoard();
  renderUploadPlanner();
  renderContentCalendar();
  loadCompetitors();
  updateDashboardStats();
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
async function loadSavedExports() {
  const container =
  document.getElementById("savedExports");

const autoContainer =
  document.getElementById("autoSavedExports");

  if (!container) return;

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session?.user) {
    container.innerHTML = `<div class="small-note">Log in to view saved exports.</div>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from("saved_exports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = `<div class="small-note">Failed to load exports.</div>`;
    return;
  }

  if (!data.length) {
    container.innerHTML = `<div class="small-note">No saved exports yet.</div>`;
    return;
  }

  const autoSaves =
  data.filter(item =>
    item.type === "Script" ||
    item.type === "Tool Export"
  );

const manualSaves =
  data.filter(item =>
    item.type !== "Script" &&
    item.type !== "Tool Export"
  );

function renderExportCards(items) {
  if (!items.length) {
    return `<div class="small-note">No exports yet.</div>`;
  }

  return items.map(item => `
    <div class="saved-script">
      <div class="meta">
        ${item.type} • ${new Date(item.created_at).toLocaleString()}
      </div>

      <strong>${item.title}</strong>

      <div style="margin-top:10px;color:#cbd5e1;max-height:160px;overflow:hidden;">
        ${item.content.replace(/\n/g, "<br>").slice(0, 1200)}
      </div>

      <div class="saved-actions">
        <button class="copy-btn" onclick="openSavedExport('${item.id}')">
          Open
        </button>

        <button class="copy-btn" onclick="copySavedExport('${item.id}')">
          Copy
        </button>

        <button class="delete-btn" onclick="deleteSavedExport('${item.id}')">
          Delete
        </button>
      </div>
    </div>
  `).join("");
}

if (autoContainer) {
  autoContainer.innerHTML =
    renderExportCards(autoSaves);
}

if (container) {
  container.innerHTML =
    renderExportCards(manualSaves);
}
}
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

window.deleteScript = async (id) => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session?.user) {
    const { error } = await supabaseClient
      .from("scripts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      showToast("Delete failed");
      return;
    }

    showToast("Deleted");
    await loadScripts();
    return;
  }

  // LOCAL STORAGE fallback
  const key = `sf_saved_scripts_${currentWorkspaceId}`;

  let scripts = JSON.parse(localStorage.getItem(key) || "[]");

  scripts = scripts.filter(script => script.id !== id);

  localStorage.setItem(key, JSON.stringify(scripts));

  showToast("Deleted locally");
  loadScripts();
};

window.renderAnalyticsCharts = () => {

  const scripts = savedScriptsCache || [];

  const ideas =
    scripts.filter(s => s.status === "Idea").length;

  const ready =
    scripts.filter(s => s.status === "Ready to Post").length;

  const posted =
    scripts.filter(s => s.status === "Posted").length;

  const ideasEl =
    document.getElementById("chartIdeasCount");

  const readyEl =
    document.getElementById("chartReadyCount");

  const postedEl =
    document.getElementById("chartPostedCount");

  if (ideasEl) ideasEl.innerText = ideas;
  if (readyEl) readyEl.innerText = ready;
  if (postedEl) postedEl.innerText = posted;

  const chart =
    document.getElementById("statusChart");

  if (!chart) return;

  const total =
    Math.max(ideas + ready + posted, 1);

  const ideasPercent =
    (ideas / total) * 100;

  const readyPercent =
    (ready / total) * 100;

  const postedPercent =
    (posted / total) * 100;
    const modeCounts = {};
const goalCounts = {};

scripts.forEach(script => {

  if (script.mode) {
    modeCounts[script.mode] =
      (modeCounts[script.mode] || 0) + 1;
  }

  if (script.goal) {
    goalCounts[script.goal] =
      (goalCounts[script.goal] || 0) + 1;
  }

});

const modeChart =
  document.getElementById("modeChart");

const goalChart =
  document.getElementById("goalChart");

if (modeChart) {

  modeChart.innerHTML = `
    <div class="section-title">
      CONTENT MODES
    </div>

    ${Object.entries(modeCounts).map(([mode, count]) => {

      const percent =
        (count / Math.max(scripts.length, 1)) * 100;

      return `
        <div style="margin-bottom:18px;">

          <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:6px;
            color:#cbd5e1;
          ">
            <span>${mode}</span>
            <span>${count}</span>
          </div>

          <div style="
            width:100%;
            height:14px;
            background:#0f172a;
            border-radius:999px;
            overflow:hidden;
          ">
            <div style="
              width:${percent}%;
              height:100%;
              background:linear-gradient(135deg,#3b82f6,#2563eb);
            "></div>
          </div>

        </div>
      `;

    }).join("")}
  `;
}

if (goalChart) {

  goalChart.innerHTML = `
    <div class="section-title">
      CREATOR GOALS
    </div>

    ${Object.entries(goalCounts).map(([goal, count]) => {

      const percent =
        (count / Math.max(scripts.length, 1)) * 100;

      return `
        <div style="margin-bottom:18px;">

          <div style="
            display:flex;
            justify-content:space-between;
            margin-bottom:6px;
            color:#cbd5e1;
          ">
            <span>${goal}</span>
            <span>${count}</span>
          </div>

          <div style="
            width:100%;
            height:14px;
            background:#0f172a;
            border-radius:999px;
            overflow:hidden;
          ">
            <div style="
              width:${percent}%;
              height:100%;
              background:linear-gradient(135deg,#22c55e,#16a34a);
            "></div>
          </div>

        </div>
      `;

    }).join("")}
  `;
}

  chart.innerHTML = `
    <div style="
      width:100%;
      height:28px;
      border-radius:999px;
      overflow:hidden;
      display:flex;
      margin-bottom:16px;
      background:#0f172a;
    ">

      <div style="
        width:${ideasPercent}%;
        background:#f97316;
      "></div>

      <div style="
        width:${readyPercent}%;
        background:#3b82f6;
      "></div>

      <div style="
        width:${postedPercent}%;
        background:#22c55e;
      "></div>

    </div>

    <div style="
      display:flex;
      gap:18px;
      flex-wrap:wrap;
      color:#cbd5e1;
      font-size:14px;
    ">
      <div>🟧 Ideas</div>
      <div>🟦 Ready</div>
      <div>🟩 Posted</div>
    </div>
  `;
};
window.askAssistant = async () => {

  const question =
    document.getElementById("assistantInput")?.value.trim();

  const output =
    document.getElementById("assistantOutput");

  if (!question) {
    showToast("Ask the assistant a question first");
    return;
  }

  assistantMessages.push({
    role: "user",
    content: question
  });

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Thinking...
      </div>
    </div>
  `;

  try {

    const res = await fetch("/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

body: JSON.stringify({
  question,
  messages: assistantMessages,
  content: lastGenerated
})
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Assistant failed");
    }

    assistantMessages.push({
      role: "assistant",
      content: data.result
    });

    output.innerHTML = assistantMessages.map(message => `

      <div style="
        margin-bottom:18px;
        padding:14px;
        border-radius:14px;
        background:${
          message.role === "user"
            ? "rgba(59,130,246,0.15)"
            : "rgba(255,255,255,0.05)"
        };
      ">

        <strong>
          ${message.role === "user" ? "You" : "ShortForge AI"}
        </strong>

        <div style="margin-top:8px;">
          ${formatOutput(message.content)}
        </div>

      </div>

    `).join("");

    document.getElementById("assistantInput").value = "";

    showToast("Assistant answered!");

  } catch (error) {

    console.error(error);

    output.innerHTML = error.message;

    showToast("Assistant failed");
  }
};
window.applySubtitleStyle = () => {

  const preview =
    document.getElementById("subtitlePreviewText");

  const style =
    document.getElementById("subtitleStyle").value;

  if (!preview) return;

  preview.style.background = "transparent";
  preview.style.padding = "0";
  preview.style.borderRadius = "0";
  preview.style.letterSpacing = "0";
  preview.style.fontStyle = "normal";
  preview.style.color = "white";
  preview.style.textShadow =
    "0 4px 20px rgba(0,0,0,0.8)";
  preview.style.fontFamily =
    "Inter, sans-serif";

  switch (style) {

    case "hormozi":

      preview.style.color = "#facc15";

      preview.style.textShadow =
        "0 0 18px rgba(250,204,21,0.55)";

      preview.style.fontWeight = "900";

      break;

    case "mrbeast":

      preview.style.color = "#60a5fa";

      preview.style.textShadow =
        "0 0 24px rgba(96,165,250,0.7)";

      preview.style.transform = "scale(1.04)";

      preview.style.letterSpacing = "1px";

      break;

    case "cinematic":

      preview.style.color = "#ffffff";

      preview.style.textShadow =
        "0 6px 40px rgba(255,255,255,0.18)";

      preview.style.fontStyle = "italic";

      break;

    case "neon":

      preview.style.color = "#22d3ee";

      preview.style.textShadow =
        `
        0 0 10px #22d3ee,
        0 0 20px #22d3ee,
        0 0 40px #22d3ee
        `;

      break;

    case "meme":

      preview.style.color = "#ffffff";

      preview.style.background = "#000000";

      preview.style.padding = "16px 24px";

      preview.style.borderRadius = "16px";

      preview.style.textShadow =
        "4px 4px 0px rgba(0,0,0,1)";

      preview.style.letterSpacing = "1px";

      break;

    default:

      preview.style.color = "white";
  }

  showToast("Subtitle style applied!");
};
window.buildSubtitleStudio = async () => {
if (!requirePro("Subtitle Studio")) return;
  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  const output =
    document.getElementById("subtitleStudioOutput");

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Building subtitle package...
      </div>
    </div>
  `;

  try {
    const res = await fetch("/subtitle-studio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: lastGenerated
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Subtitle Studio failed");
    }

    output.innerHTML = formatOutput(data.result || "");
    const previewText =
  document.getElementById("subtitlePreviewText");

const previewSection =
  (data.result || "")
    .match(/PREVIEW_SUBTITLES:[\s\S]*?(?=HOOK_SUBTITLES:|MAIN_SUBTITLES:|EMOTION_WORD_HIGHLIGHTS:|$)/i)?.[0] || "";

const previewLines =
  previewSection
    .replace(/PREVIEW_SUBTITLES:/gi, "")
    .split("\n")
    .map(line =>
      line
        .trim()
        .replace(/^[-•\d.]+\s*/, "")
        .replace(/["“”]/g, "")
        .trim()
    )
    .filter(line =>
      line.length > 8 &&
      line.length < 90
    )
    .slice(0, 8);

let previewIndex = 0;

if (previewText && previewLines.length > 0) {
  previewText.innerText = previewLines[0];

  setInterval(() => {
    previewIndex =
      (previewIndex + 1) % previewLines.length;

    previewText.style.opacity = "0";
    previewText.style.transform = "scale(0.92)";

    setTimeout(() => {
      const words =
  previewLines[previewIndex].split(" ");
previewText.innerHTML =
  words.map((word, i) => `
    <span
      style="
        display:inline-block;
        margin:0 4px;
        opacity:${i === 0 ? "1" : "0.45"};
        color:${i === 0 ? "#facc15" : "inherit"};
        transform:${i === 0 ? "scale(1.08)" : "scale(1)"};
        transition:all 0.2s ease;
      "
    >
      ${word}
    </span>
  `).join("");

const canvasSubtitle =
  document.getElementById("canvasSubtitle");

if (canvasSubtitle) {
  canvasSubtitle.innerHTML =
    previewText.innerHTML;
}

let wordIndex = 0;

const wordTimer = setInterval(() => {

  const spans =
    previewText.querySelectorAll("span");

  const canvasSpans =
    canvasSubtitle?.querySelectorAll("span") || [];

  spans.forEach((span, i) => {

    span.style.opacity =
      i === wordIndex ? "1" : "0.45";

    span.style.color =
      i === wordIndex ? "#facc15" : "inherit";

    span.style.transform =
      i === wordIndex ? "scale(1.12)" : "scale(1)";

    if (canvasSpans[i]) {

      canvasSpans[i].style.opacity =
        i === wordIndex ? "1" : "0.45";

      canvasSpans[i].style.color =
        i === wordIndex ? "#facc15" : "inherit";

      canvasSpans[i].style.transform =
        i === wordIndex ? "scale(1.12)" : "scale(1)";
    }

  });

  wordIndex++;

  if (wordIndex >= spans.length) {
    clearInterval(wordTimer);
  }

}, 220);

previewText.style.opacity = "1";
previewText.style.transform = "scale(1)";

    }, 220);

  }, 1700);

}

    showToast("Subtitle Studio built!");

  } catch (error) {
    console.error(error);

    output.innerHTML = `
      <div class="error-box">
        <div class="error-title">
          ⚠️ Subtitle Studio Failed
        </div>

        <div class="error-message">
          ${error.message}
        </div>
      </div>
    `;

    showToast("Subtitle Studio failed");
  }
};
window.buildFullContentPackage = async () => {
if (!requirePro("Full Content Package")) return;
  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  const output =
    document.getElementById("fullPackageOutput");

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Building full content package...
      </div>
    </div>
  `;

  try {
    const res = await fetch("/full-content-package", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: lastGenerated
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Full package failed");
    }

    output.innerHTML = formatOutput(data.result || "");

    showToast("Full content package built!");

  } catch (error) {
    console.error(error);

    output.innerHTML = `
      <div class="error-box">
        <div class="error-title">
          ⚠️ Full Package Failed
        </div>

        <div class="error-message">
          ${error.message}
        </div>
      </div>
    `;

    showToast("Full package failed");
  }
};
window.buildVoiceoverStudio = async () => {
if (!requirePro("Voiceover Studio")) return;
  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  const output =
    document.getElementById("voiceoverStudioOutput");

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Rewriting into spoken voiceover...
      </div>
    </div>
  `;

  try {
    const res = await fetch("/voiceover-rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: lastGenerated
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Voiceover rewrite failed");
    }

    output.innerHTML = formatOutput(data.result || "");

    showToast("Voiceover rewritten!");

  } catch (error) {
    console.error(error);

    output.innerHTML = `
      <div class="error-box">
        <div class="error-title">
          ⚠️ Voiceover Failed
        </div>

        <div class="error-message">
          ${error.message}
        </div>
      </div>
    `;

    showToast("Voiceover failed");
  }
};
   window.buildVideoPipeline = () => {

  if (!requirePro("Full Video Pipeline")) return;

  if (!lastGenerated) {
    showToast("Generate content first");
    return;
  }

  const output =
    document.getElementById("videoPipelineOutput");

  const sceneSection =
    lastGenerated.match(
      /SCENE_BREAKDOWN:[\s\S]*?(?=IMAGE_PROMPTS:|EDITING_NOTES:|CTA:|$)/i
    )?.[0] || lastGenerated;

  const scenes =
    sceneSection
      .split("\n")
      .map(line => line.trim())
      .filter(line =>
        line.length > 10 &&
        line !== "SCENE_BREAKDOWN:"
      );

  output.innerHTML = `

    <div class="section-title">
      FULL AI VIDEO PIPELINE
    </div>

    <div style="
      display:grid;
      gap:18px;
    ">

      ${scenes.map((scene, index) => `

        <div style="
          background:#0f172a;
          border:1px solid rgba(255,255,255,0.06);
          border-radius:18px;
          padding:18px;
        ">

          <div style="
            font-weight:800;
            margin-bottom:10px;
            color:#60a5fa;
          ">
            Scene ${index + 1}
          </div>

          <div style="
            color:#e2e8f0;
            line-height:1.6;
            margin-bottom:16px;
          ">
            ${scene}
          </div>

          <div style="
            background:#020617;
            border-radius:12px;
            padding:14px;
            color:#94a3b8;
            font-size:14px;
            line-height:1.5;
          ">

            <strong style="color:white;">
              AI Video Prompt:
            </strong>

            Cinematic vertical 9:16 creator video,
            dramatic lighting,
            viral TikTok pacing,
            realistic motion,
            based on:
            "${scene.replace(/"/g, "")}"

          </div>

        </div>

      `).join("")}

    </div>
  `;

  showToast("Video pipeline built!");
};
window.addEventListener("load", async () => {
  try {

    realProStatus = false;
    await supabaseClient.auth.getSession();
await window.updateAuthUI();
await checkRealProStatus();

    await window.updateAuthUI();
    const params = new URLSearchParams(window.location.search);

if (params.get("checkout") === "success") {

  showToast("🎉 You're now Pro!");

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
}

    await checkRealProStatus();

    applyTheme();
    ensureDefaultWorkspace();
    renderWorkspaces();
    renderTemplateGallery();
    renderFavoriteTemplates();

    await loadScripts();

    renderImageHistory();
    renderAnalyticsCharts();
    loadCreatorDNA();

  } catch (err) {

    console.error("APP LOAD ERROR:", err);

    alert(err.message);
  }
});

window.scrollToSection = (section) => {

  const map = {
    top: ".header",
    create: ".onboarding-card",
    output: "#output",
    planner: "#uploadPlanner",
    savedScripts: "#saved",
    settings: "#authCard"
  };

  const element =
    document.querySelector(map[section]);

  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};
let draggedWorkspaceCard = null;

window.startWorkspaceDrag = (event) => {
  draggedWorkspaceCard = event.target;
  event.target.style.opacity = "0.5";
};

window.endWorkspaceDrag = (event) => {
  event.target.style.opacity = "1";
};

window.allowWorkspaceDrop = (event) => {
  event.preventDefault();
};

window.dropWorkspaceCard = (event) => {
  event.preventDefault();

  if (!draggedWorkspaceCard) return;

  const column = event.currentTarget;
  column.appendChild(draggedWorkspaceCard);

  draggedWorkspaceCard = null;

  updateWorkspaceCounts();
};
window.updateWorkspaceCounts = () => {
  document
    .querySelectorAll(".creator-workspace-column")
    .forEach(column => {
      const count = column.querySelectorAll(".status-card").length;
      const badge = column.querySelector(".workspace-count");

      if (badge) {
        badge.innerText = count;
      }
    });
};
async function buildTimelineEditor() {

  if (!requirePro("AI Timeline Editor")) return;
  const output =
    document.getElementById("timelineEditor");

  const content =
    document.getElementById("output")
      ?.innerText || "";

  if (!content.trim()) {

    showToast("Generate content first");

    return;
  }

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Building AI timeline editor...
      </div>
    </div>
  `;

  const lines = content
    .split("\n")
    .filter(line => line.trim().length > 20)
    .slice(0, 8);

  output.innerHTML = "";

  lines.forEach((line, index) => {

    const duration =
      Math.floor(Math.random() * 4) + 2;

    const color =
      [
        "#3b82f6",
        "#8b5cf6",
        "#06b6d4",
        "#22c55e",
        "#f97316",
        "#ec4899"
      ][index % 6];

    output.innerHTML += `
      <div
        style="
          background:#020617;
          border:1px solid rgba(255,255,255,0.06);
          border-radius:18px;
          padding:18px;
          overflow:hidden;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:14px;
            gap:12px;
            flex-wrap:wrap;
          "
        >

          <div
            style="
              font-weight:800;
              font-size:15px;
              color:#cbd5e1;
            "
          >
            Scene ${index + 1}
          </div>

          <div
            style="
              background:${color};
              color:white;
              padding:6px 12px;
              border-radius:999px;
              font-size:12px;
              font-weight:800;
            "
          >
            ${duration}s
          </div>

        </div>

        <div
          style="
            font-size:16px;
            line-height:1.6;
            margin-bottom:16px;
            color:white;
          "
        >
          ${line}
        </div>

        <div
          style="
            height:18px;
            background:#0f172a;
            border-radius:999px;
            overflow:hidden;
            position:relative;
          "
        >

          <div
            style="
              width:${duration * 12}%;
              height:100%;
              background:${color};
              border-radius:999px;
              box-shadow:0 0 20px ${color};
            "
          ></div>

        </div>

        <div
          style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            margin-top:14px;
          "
        >

          <div
            style="
              background:rgba(59,130,246,0.12);
              color:#93c5fd;
              padding:8px 12px;
              border-radius:12px;
              font-size:12px;
              font-weight:700;
            "
          >
            Subtitle Block
          </div>

          <div
            style="
              background:rgba(236,72,153,0.12);
              color:#f9a8d4;
              padding:8px 12px;
              border-radius:12px;
              font-size:12px;
              font-weight:700;
            "
          >
            Sound FX
          </div>

          <div
            style="
              background:rgba(34,197,94,0.12);
              color:#86efac;
              padding:8px 12px;
              border-radius:12px;
              font-size:12px;
              font-weight:700;
            "
          >
            Zoom Cut
          </div>

        </div>

      </div>
    `;

  });

  showToast("Timeline editor built");

}
window.buildStoryboardStudio = async function () {

  if (!requirePro("AI Storyboard Studio")) return;
  const output =
    document.getElementById("storyboardStudio");

  const content =
    document.getElementById("output")?.innerText || "";

  if (!content.trim()) {
    showToast("Generate content first");
    return;
  }

  output.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Generating AI storyboard frames...
      </div>
    </div>
  `;

  const scenes =
    content
      .split("\n")
      .map(line => line.trim())
      .filter(line =>
        line.length > 25 &&
        !line.includes(":")
      )
      .slice(0, 8);

  output.innerHTML = scenes.map((scene, index) => `
    <div class="template-card">

      <div
        id="storyboardImage${index}"
        style="
          height:220px;
          border-radius:18px;
          background:linear-gradient(135deg,#1e3a8a,#7c3aed);
          margin-bottom:16px;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          padding:18px;
          font-weight:900;
          font-size:28px;
        "
      >
        Generating Scene ${index + 1}...
      </div>

      <div class="meta">
        AI Storyboard Frame
      </div>

      <strong>${scene}</strong>

      <p>
        Camera: ${index % 2 === 0 ? "slow cinematic push-in" : "fast handheld zoom"}
      </p>

      <p>
        AI Image Prompt: vertical 9:16 cinematic frame, ${scene.replace(/"/g, "")}, dramatic lighting, viral creator style.
      </p>

    </div>
  `).join("");

  for (let i = 0; i < scenes.length; i++) {

    const imageBox =
      document.getElementById(`storyboardImage${i}`);

    const prompt =
      `Create a vertical 9:16 cinematic storyboard frame for a short-form viral video.
      No text in the image.
      Dramatic lighting, realistic motion, high contrast, creator-style composition.
      Scene: ${scenes[i]}`;

    try {

      const res = await fetch("/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (!res.ok || !data.image) {
        throw new Error(data.error || "Image failed");
      }

      imageBox.innerHTML = `
        <img
          src="data:image/png;base64,${data.image}"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
            border-radius:18px;
          "
        />
      `;

    } catch (error) {

      console.error(error);

      imageBox.innerHTML = `
        Scene ${i + 1}
      `;
    }
  }

  showToast("AI storyboard images built!");

};
window.startVideoPlayback = function () {

  if (!requirePro("Interactive Video Playback")) return;
  const sceneBox =
    document.getElementById("playbackScene");

  const progress =
    document.getElementById("playbackProgress");

  const timer =
    document.getElementById("playbackTimer");

  const content =
    document.getElementById("output")
      ?.innerText || "";

  if (!content.trim()) {

    showToast("Generate content first");

    return;
  }

  const scenes =
    content
      .split("\n")
      .map(line => line.trim())
      .filter(line =>
        line.length > 20 &&
        !line.includes(":")
      )
      .slice(0, 8);

  if (scenes.length === 0) {

    showToast("No scenes found");

    return;
  }

  let currentScene = 0;

  let totalSeconds = 0;

  sceneBox.style.opacity = "0";

  const colors = [
    "linear-gradient(135deg,#1e3a8a,#7c3aed)",
    "linear-gradient(135deg,#0f766e,#22c55e)",
    "linear-gradient(135deg,#7c2d12,#f97316)",
    "linear-gradient(135deg,#831843,#ec4899)",
    "linear-gradient(135deg,#312e81,#06b6d4)"
  ];

  function updateScene() {

    sceneBox.style.transition =
      "all 0.35s ease";

    sceneBox.style.transform =
      "scale(0.92)";

    sceneBox.style.opacity = "0";

    setTimeout(() => {

      sceneBox.innerHTML = `
        <div
          style="
            display:flex;
            flex-direction:column;
            gap:18px;
            align-items:center;
          "
        >

          <div
            style="
              font-size:16px;
              font-weight:700;
              letter-spacing:0.08em;
              opacity:0.7;
            "
          >
            SCENE ${currentScene + 1}
          </div>

          <div>
            ${scenes[currentScene]
  .replace(/^\d+\.\s*/, "")
  .split(" ")
  .slice(0, 10)
  .join(" ")}...
          </div>

        </div>
      `;

      const canvas =
        document.getElementById("playbackCanvas");

      if (canvas) {

        canvas.style.background =
          colors[currentScene % colors.length];
      }

      sceneBox.style.transform =
        "scale(1)";

      sceneBox.style.opacity = "1";

    }, 250);
  }

  updateScene();

  const playback = setInterval(() => {

    totalSeconds++;

    const minutes =
      Math.floor(totalSeconds / 60);

    const seconds =
      totalSeconds % 60;

    timer.innerText =
      `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;

    const progressPercent =
      ((currentScene + 1) / scenes.length) * 100;

    progress.style.width =
      `${progressPercent}%`;

    currentScene++;

    if (currentScene >= scenes.length) {

      clearInterval(playback);

      showToast("Playback finished");

      return;
    }

    updateScene();

  }, 2200);

};
window.saveCreatorDNA = function () {

  const niche =
    document.getElementById("memoryNiche").value.trim();

  const tone =
    document.getElementById("memoryTone").value.trim();

  const hookStyle =
    document.getElementById("memoryHookStyle").value.trim();

  const audience =
    document.getElementById("memoryAudience").value.trim();

  const memory = `
Niche: ${niche}
Tone: ${tone}
Hook Style: ${hookStyle}
Audience: ${audience}
  `.trim();

  localStorage.setItem(
    "sf_creator_memory",
    memory
  );

  const status =
    document.getElementById("creatorDNAStatus");

  if (status) {

    status.innerHTML = `
      Creator DNA saved successfully 🧬
    `;
  }

  showToast("Creator DNA saved");

};
window.loadCreatorDNA = function () {

  const memory =
    localStorage.getItem("sf_creator_memory");

  if (!memory) return;

  const nicheMatch =
    memory.match(/Niche:\s(.+)/);

  const toneMatch =
    memory.match(/Tone:\s(.+)/);

  const hookMatch =
    memory.match(/Hook Style:\s(.+)/);

  const audienceMatch =
    memory.match(/Audience:\s(.+)/);

  if (nicheMatch) {
    document.getElementById("memoryNiche").value =
      nicheMatch[1];
  }

  if (toneMatch) {
    document.getElementById("memoryTone").value =
      toneMatch[1];
  }

  if (hookMatch) {
    document.getElementById("memoryHookStyle").value =
      hookMatch[1];
  }

  if (audienceMatch) {
    document.getElementById("memoryAudience").value =
      audienceMatch[1];
  }

  const status =
    document.getElementById("creatorDNAStatus");

  if (status) {
    status.innerHTML =
      "Loaded saved Creator DNA 🧬";
  }

};
function toggleSection(sectionId, arrowId){

  const section =
    document.getElementById(sectionId);

  const arrow =
    document.getElementById(arrowId);

  if(!section) return;

  const isHidden =
    section.dataset.hidden === "true";

  section.dataset.hidden =
    isHidden ? "false" : "true";

  section.style.display =
    isHidden ? "contents" : "none";

  if(arrow){
    arrow.style.transform =
      isHidden
        ? "rotate(0deg)"
        : "rotate(-90deg)";
  }
}