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
    const { walk_id, event_type } = await req.json();

    if (!walk_id || !event_type) {
      return new Response(JSON.stringify({ error: "walk_id and event_type are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get walk with walker name and booking details
    const { data: walk, error: walkError } = await supabase
      .from("walks")
      .select(`
        id,
        booking_id,
        walker:walker_id (
          name
        ),
        booking:booking_id (
          dog_ids,
          client:client_id (
            user_id,
            user:user_id (
              phone,
              sms_consent,
              name
            )
          )
        )
      `)
      .eq("id", walk_id)
      .single();

    if (walkError || !walk) {
      return new Response(JSON.stringify({ error: "Walk not found", detail: walkError }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const clientUser = walk.booking?.client?.user;
    const clientPhone = clientUser?.phone;
    const smsConsent = clientUser?.sms_consent;

    // Only send if client has phone and has opted in
    if (!clientPhone || !smsConsent) {
      return new Response(JSON.stringify({ skipped: true, reason: "No phone or no SMS consent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const walkerName = walk.walker?.name || "Your walker";

    // Look up dog names from dog_ids array
    let dogNames = "your dog";
    const dogIds = walk.booking?.dog_ids || [];
    if (dogIds.length > 0) {
      const { data: dogs } = await supabase.from("dogs").select("name").in("id", dogIds);
      if (dogs && dogs.length > 0) {
        dogNames = dogs.map((d: any) => d.name).join(" & ");
      }
    }

    // Build message
    let message = "";
    if (event_type === "walk_started") {
      message = `FetchUs: ${walkerName} has started ${dogNames}'s walk. Reply STOP to opt out.`;
    } else if (event_type === "walk_completed") {
      message = `FetchUs: ${walkerName} has completed ${dogNames}'s walk. Have a great day! Reply STOP to opt out.`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown event_type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Format phone to E.164
    const toPhone = clientPhone.replace(/\D/g, "");
    const formattedPhone = toPhone.startsWith("1") ? `+${toPhone}` : `+1${toPhone}`;

    // Send via Twilio
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
    await supabase.from("notifications").insert({
      user_id: walk.booking?.client?.user_id || null,
      type: event_type,
      message,
      phone: formattedPhone,
      status: success ? "sent" : "failed",
    });

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
