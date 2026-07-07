import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_API_KEY_SID = Deno.env.get("TWILIO_API_KEY_SID")!;
const TWILIO_API_KEY_SECRET = Deno.env.get("TWILIO_API_KEY_SECRET")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { to_phone, sms_consent, walker_name, dog_name, event_type, client_user_id } = await req.json();

    if (!to_phone || !sms_consent) {
      return new Response(JSON.stringify({ skipped: true, reason: "No phone or no SMS consent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let message = "";
    if (event_type === "walk_started") {
      message = `FetchUs: ${walker_name} has started ${dog_name}'s walk. Reply STOP to opt out.`;
    } else if (event_type === "walk_completed") {
      message = `FetchUs: ${walker_name} has completed ${dog_name}'s walk. Have a great day! Reply STOP to opt out.`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown event_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const toPhone = to_phone.replace(/\D/g, "");
    const formattedPhone = toPhone.startsWith("1") ? `+${toPhone}` : `+1${toPhone}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(`${TWILIO_API_KEY_SID}:${TWILIO_API_KEY_SECRET}`),
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      }),
    });

    const twilioData = await twilioResponse.json();
    const success = twilioResponse.ok;

    // Log to notifications
    if (client_user_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("notifications").insert({
        user_id: client_user_id,
        type: event_type,
        message,
        phone: formattedPhone,
        status: success ? "sent" : "failed",
      });
    }

    return new Response(JSON.stringify({ success, twilioData }), {
      status: success ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
