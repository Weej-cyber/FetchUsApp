import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_API_KEY_SID = Deno.env.get("TWILIO_API_KEY_SID")!;
const TWILIO_API_KEY_SECRET = Deno.env.get("TWILIO_API_KEY_SECRET")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
}

async function sendTwilioSms(toPhone: string, message: string) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const twilioResponse = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${TWILIO_API_KEY_SID}:${TWILIO_API_KEY_SECRET}`),
    },
    body: new URLSearchParams({
      To: toPhone,
      From: TWILIO_PHONE_NUMBER,
      Body: message,
    }),
  });
  const twilioData = await twilioResponse.json();
  return { success: twilioResponse.ok, twilioData };
}

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
    const body = await req.json();
    const { event_type } = body;

    // Admin-notification events: fan out to every admin with a phone number
    // and SMS consent on file, rather than a single recipient.
    if (event_type === "new_walk_request" || event_type === "new_boarding_request") {
      const { dog_name, client_name, service_type, preferred_date, preferred_time, check_in_date, check_out_date } = body;

      const message = event_type === "new_walk_request"
        ? `FetchUs: New walk request - ${service_type || "walk"} for ${dog_name || "a dog"} from ${client_name || "a client"} on ${preferred_date} at ${preferred_time}. Reply STOP to opt out.`
        : `FetchUs: New boarding request for ${dog_name || "a dog"} from ${client_name || "a client"}, ${check_in_date} to ${check_out_date}. Reply STOP to opt out.`;

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: admins } = await supabase
        .from("users")
        .select("id, phone")
        .eq("role", "admin")
        .eq("sms_consent", true)
        .not("phone", "is", null);

      const results = [];
      for (const admin of admins ?? []) {
        const formattedPhone = formatPhone(admin.phone);
        const { success } = await sendTwilioSms(formattedPhone, message);
        await supabase.from("notifications").insert({
          user_id: admin.id,
          type: event_type,
          message,
          phone: formattedPhone,
          status: success ? "sent" : "failed",
        });
        results.push({ admin_id: admin.id, success });
      }

      return new Response(JSON.stringify({ success: true, notified: results }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Single-recipient events: text the client directly (walker-triggered).
    const { to_phone, sms_consent, walker_name, dog_name, client_user_id } = body;

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

    const formattedPhone = formatPhone(to_phone);
    const { success, twilioData } = await sendTwilioSms(formattedPhone, message);

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
