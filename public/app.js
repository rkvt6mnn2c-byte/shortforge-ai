import { supabase } from "./auth.js";

let lastGenerated = "";

/* ---------------- FORMAT OUTPUT ---------------- */
function formatOutput(text) {
  return text
    .replace(/\n/g, "<br>")
    .replace(/HOOK:/g, "<b>HOOK:</b>")
    .replace(/BODY:/g, "<b>BODY:</b>")
    .replace(/CTA:/g, "<b>CTA:</b>")
    .replace(/VIRAL_SCORE:/g, "<b>VIRAL SCORE:</b>")
    .replace(/IMPROVEMENT_TIP:/g, "<b>IMPROVEMENT TIP:</b>");
}

/* ---------------- TOAST ---------------- */
function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    alert(message);
    return;
  }

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ---------------- GET USER ---------------- */
async function getUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
}

/* ---------------- GENERATE ---------------- */
window.generate = async () => {
  const topic = document.getElementById("topic").value;
  const mode = document.getElementById("mode").value;
  const output = document.getElementById("output");

  if (!topic) {
    output.innerText = "Please enter a topic.";
    return;
  }

  output.innerText = "⏳ Generating...";

  const btn = document.querySelector("button[onclick='generate()']");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Generating...";
  }

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, mode })
    });

    const data = await res.json();

    if (!res.ok) {
      output.innerText = data.error || "Error generating script.";
      showToast("Generation failed");
      return;
    }

    lastGenerated = data.result || "";
    output.innerHTML = formatOutput(lastGenerated);

  } catch (err) {
    console.error(err);
    output.innerText = "Error generating script.";
    showToast("Server error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Generate";
    }
  }
};

/* ---------------- COPY GENERATED SCRIPT ---------------- */
window.copyScript = async () => {
  if (!lastGenerated) {
    showToast("Nothing to copy");
    return;
  }

  await navigator.clipboard.writeText(lastGenerated);
  showToast("Copied to clipboard!");
};

/* ---------------- SAVE ---------------- */
window.saveScript = async () => {
  if (!lastGenerated) {
    showToast("Generate first");
    return;
  }

  const topic = document.getElementById("topic").value;
  const mode = document.getElementById("mode").value;
  const user = await getUser();

  if (!user) {
    showToast("Not logged in");
    return;
  }

  const saveBtn = document.querySelector("button[onclick='saveScript()']");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";
  }

  try {
    const { error } = await supabase.from("scripts").insert([
      {
        user_id: user.id,
        topic: topic || "Untitled",
        mode,
        content: lastGenerated
      }
    ]);

    if (error) throw error;

    showToast("Script saved!");
    loadScripts();

  } catch (err) {
    console.error(err);
    showToast("Save failed");

  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerText = "Save";
    }
  }
};

/* ---------------- IMPROVE VIRALITY ---------------- */
window.improveScript = async () => {
  if (!lastGenerated) {
    showToast("Generate first");
    return;
  }

  const output = document.getElementById("output");
  output.innerText = "🔥 Making it more viral...";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Improve virality:\n\n" + lastGenerated,
        mode: "viral-plus"
      })
    });

    const data = await res.json();

    if (!res.ok) {
      output.innerText = data.error || "Error improving script.";
      showToast("Improve failed");
      return;
    }

    lastGenerated = data.result || "";
    output.innerHTML = formatOutput(lastGenerated);
    showToast("Made more viral!");

  } catch (err) {
    console.error(err);
    output.innerText = "Error improving script.";
    showToast("Server error");
  }
};

/* ---------------- LOAD ---------------- */
window.loadScripts = async () => {
  const container = document.getElementById("saved");
  const user = await getUser();

  if (!user) {
    container.innerHTML = "Please log in";
    return;
  }

  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = "Error loading scripts";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "No saved scripts yet";
    return;
  }

  container.innerHTML = data.map(s => `
    <div class="saved-script">
      <div class="meta">
        ${s.mode.toUpperCase()} • ${new Date(s.created_at).toLocaleString()}
      </div>

      <strong>${s.topic}</strong>

      <div style="margin-top:10px;white-space:pre-wrap;">
        ${s.content}
      </div>

      <div class="saved-actions">
        <button class="copy-btn" onclick="copySavedScript(\`${encodeURIComponent(s.content)}\`)">
          Copy
        </button>

        <button class="delete-btn" onclick="deleteScript('${s.id}')">
          Delete
        </button>
      </div>
    </div>
  `).join("");
};

/* ---------------- COPY SAVED SCRIPT ---------------- */
window.copySavedScript = async (encodedText) => {
  const text = decodeURIComponent(encodedText);
  await navigator.clipboard.writeText(text);
  showToast("Saved script copied!");
};

/* ---------------- DELETE ---------------- */
window.deleteScript = async (id) => {
  const { error } = await supabase
    .from("scripts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    showToast("Delete failed");
    return;
  }

  showToast("Deleted!");
  loadScripts();
};

/* ---------------- LOGOUT ---------------- */
window.logout = async () => {
  await supabase.auth.signOut();
  window.location.replace("/login.html");
};

/* ---------------- INIT ---------------- */
window.addEventListener("load", loadScripts);