import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
async function syncProStatus(){

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if(!session?.user){
    localStorage.setItem("shortforge_pro", "false");
    return;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("is_pro")
    .eq("id", session.user.id)
    .single();

  if(error){
    console.error("Pro sync error:", error);
    localStorage.setItem("shortforge_pro", "false");
    return;
  }

  localStorage.setItem(
    "shortforge_pro",
    data?.is_pro === true ? "true" : "false"
  );
}

supabaseClient.auth.onAuthStateChange(async () => {
  await syncProStatus();
});