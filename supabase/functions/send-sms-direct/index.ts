import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = "sb_publishable_eXLygIqAXfuXO6dYHwz0pA_iSC0dec4";

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("1") ? `+${digits}` : `+1${digits}`;
}

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

// This function is a pure dispatcher. It does not decide who gets notified,
// what the message says, or whether someone has consented -- all of that
// lives in the database (the notifications_before_insert trigger and the
// application code that creates each row). This function's only job: given
// an already-fully-formed, already-approved notification, send it and
// record the result.
//
// Every call must come from the database's own dispatch trigger, proven via
// the x-internal-key header (checked against a secret stored in Vault) --
// never called directly by client, walker, or admin app code.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
      },
    });
  }

  try {
    const internalKey = req.headers.get("x-internal-key");
    const { notification_id } = await req.json();

    if (!internalKey || !notification_id) {
      return new Response(JSON.stringify({ error: "Missing internal key or notification_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: rows, error: fetchErr } = await supabase.rpc("get_notification_for_dispatch", {
      p_id: notification_id,
      p_key: internalKey,
    });

    if (fetchErr || !rows || rows.length === 0) {
      return new Response(JSON.stringify({ error: "Not authorized or notification not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const notification = rows[0];

    if (notification.status !== "pending") {
      return new Response(JSON.stringify({ skipped: true, reason: `Status is '${notification.status}', not 'pending'` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatPhone(notification.phone);
    const { ok, data } = await sendTwilioSms(formattedPhone, notification.message);

    await supabase.rpc("update_notification_status", {
      p_id: notification_id,
      p_key: internalKey,
      p_status: ok ? "sent" : "failed",
    });

    return new Response(JSON.stringify({ success: ok, twilioData: data }), {
      status: ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
