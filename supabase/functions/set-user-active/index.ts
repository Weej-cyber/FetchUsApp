import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = "sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// "Delete" a person = deactivate them. This flips is_active on their users
// row AND blocks their login at the Supabase Auth level (a ban), so they
// can't sign in again or refresh an open session. Reactivating lifts the
// ban. Only a caller who is an active admin right now can do this.
//
// (The earlier version called auth.admin.signOut(user_id), but that method
// takes the user's login token, not their ID, so it always failed and
// deactivated people kept their sessions.)
const BAN_FOREVER = "876000h"; // ~100 years; "none" lifts it

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });

  try {
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: isAdmin, error: adminCheckErr } = await callerClient.rpc("is_admin");
    if (adminCheckErr || !isAdmin) return json({ error: "Not authorized" }, 403);

    const { user_id, is_active } = await req.json();
    if (!user_id || typeof is_active !== "boolean") {
      return json({ error: "user_id and is_active are required" }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: updateErr } = await adminClient.from("users").update({ is_active }).eq("id", user_id);
    if (updateErr) return json({ error: updateErr.message }, 500);

    const { error: banErr } = await adminClient.auth.admin.updateUserById(user_id, {
      ban_duration: is_active ? "none" : BAN_FOREVER,
    });
    if (banErr) {
      return json({
        success: true,
        warning: is_active
          ? `Reactivated, but their login could not be unblocked: ${banErr.message}`
          : `Deactivated, but their login could not be blocked: ${banErr.message}`,
      });
    }

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
