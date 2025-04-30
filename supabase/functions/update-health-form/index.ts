
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthFormUpdate {
  formId: string;
  agreed: boolean;
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId, agreed, notes }: HealthFormUpdate = await req.json();
    
    // Create a Supabase client with the auth context of the function
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First get the health declaration to find the participant_id
    const { data: healthForm, error: getError } = await supabase
      .from("health_declarations")
      .select("participant_id")
      .eq("id", formId)
      .single();
    
    if (getError) throw new Error(`Failed to retrieve health form: ${getError.message}`);
    
    // Update the health form status
    const { data: updatedForm, error: updateError } = await supabase
      .from("health_declarations")
      .update({
        form_status: agreed ? "approved" : "declined",
        submission_date: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", formId)
      .select()
      .single();
    
    if (updateError) throw new Error(`Failed to update health form: ${updateError.message}`);
    
    // If agreed, also update the participant's health approval status
    if (agreed) {
      const { error: participantError } = await supabase
        .from("participants")
        .update({
          healthapproval: true
        })
        .eq("id", healthForm.participant_id);
      
      if (participantError) throw new Error(`Failed to update participant: ${participantError.message}`);
    }
    
    return new Response(JSON.stringify({ success: true, data: updatedForm }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error updating health form:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
});
