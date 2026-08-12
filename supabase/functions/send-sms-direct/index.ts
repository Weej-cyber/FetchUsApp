import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = "sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4";

async function sendTwilioSms(to: string, body: string) {
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const res = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
    },
    body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
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
    const { client_id, walker_name, dog_name, event_type, preferred_date, preferred_time, check_in_date, check_out_date } = await req.json();

    if (!client_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "No client_id" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    if (event_type === "new_booking" || event_type === "new_boarding") {
      const { data: clientInfo } = await supabase.rpc("get_client_sms_info_by_client", { p_client_id: client_id });
      const clientName = clientInfo?.[0]?.name || "A pet parent";

      const { data: admins, error: adminErr } = await supabase.rpc("get_admin_sms_recipients");
      if (adminErr || !admins || admins.length === 0) {
        return new Response(JSON.stringify({ skipped: true, reason: "No admin recipients", adminErr }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      let message;
      if (event_type === "new_booking") {
        const when = preferred_date && preferred_time ? ` on ${preferred_date} at ${preferred_time}` : "";
        message = `FetchUs: New walk request from ${clientName} for ${dog_name || "their dog"}${when}. Reply STOP to opt out.`;
      } else {
        const when = check_in_date && check_out_date ? ` ${check_in_date} to ${check_out_date}` : "";
        message = `FetchUs: New boarding request from ${clientName} for ${dog_name || "their dog"},${when}. Reply STOP to opt out.`;
      }

      const results = [];
      for (const admin of admins) {
        const formattedPhone = formatPhone(admin.phone);
        const { ok, data } = await sendTwilioSms(formattedPhone, message);
        await supabase.from("notifications").insert({
          user_id: admin.user_id,
          type: event_type,
          message,
          phone: formattedPhone,
          status: ok ? "sent" : "failed",
        });
        results.push({ to: formattedPhone, ok, data });
      }

      return new Response(JSON.stringify({ success: true, sentTo: results.length, results }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const { data, error } = await supabase.rpc("get_client_sms_info_by_client", { p_client_id: client_id });

    if (error || !data || data.length === 0) {
      return new Response(JSON.stringify({ skipped: true, reason: "Client not found", error }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const { phone, sms_consent, user_id } = data[0];

    if (!phone || !sms_consent) {
      return new Response(JSON.stringify({ skipped: true, reason: "No phone or no consent", phone, sms_consent }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    let message = "";
    if (event_type === "walk_started") {
      message = `FetchUs: ${walker_name || 'Your walker'} has started ${dog_name || 'your dog'}'s walk. Reply STOP to opt out.`;
    } else if (event_type === "walk_completed") {
      message = `FetchUs: ${walker_name || 'Your walker'} has completed ${dog_name || 'your dog'}'s walk. Have a great day! Reply STOP to opt out.`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown event_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatPhone(phone);
    const { ok: success, data: twilioData } = await sendTwilioSms(formattedPhone, message);

    await supabase.from("notifications").insert({
      user_id: user_id || null,
      type: event_type,
      message,
      phone: formattedPhone,
      status: success ? "sent" : "failed",
    });

    return new Response(JSON.stringify({ success, message, to: formattedPhone, twilioData }), {
      status: success ? 200 : 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
