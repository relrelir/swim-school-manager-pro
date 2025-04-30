
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthFormRequest {
  participantId: string;
  phone: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { participantId, phone, name }: HealthFormRequest = await req.json();
    
    // Create a Supabase client with the auth context of the function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Generate a unique link for the health form
    const formId = crypto.randomUUID();
    
    // Create a health declaration entry in the database
    const { data: healthForm, error: formError } = await supabase
      .from("health_declarations")
      .insert({
        participant_id: participantId,
        phone_sent_to: phone,
        form_status: "pending"
      })
      .select("id")
      .single();
    
    if (formError) throw new Error(`Failed to create health form: ${formError.message}`);
    
    // Create form link with the health declaration ID
    const formLink = `${Deno.env.get("PUBLIC_SITE_URL") || ""}/health-form/${healthForm.id}`;
    
    // TODO: Replace with actual SMS provider
    // For now, log the message that would be sent
    console.log(`Would send SMS to ${phone} for ${name} with link: ${formLink}`);
    
    // In a real implementation, you would use an SMS provider like Twilio:
    /*
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phone,
          Body: `שלום ${name}, יש למלא טופס הצהרת בריאות בקישור המצורף: ${formLink}`,
        }).toString(),
      }
    );
    
    const twilioData = await twilioResponse.json();
    */
    
    // For demo purposes, we'll just return success
    const smsResult = {
      success: true,
      message: "SMS would be sent (demo mode)",
      formId: healthForm.id
    };
    
    return new Response(JSON.stringify(smsResult), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending health form SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
});
