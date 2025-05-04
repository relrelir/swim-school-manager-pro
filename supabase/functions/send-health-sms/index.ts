
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Setup interface for request body
interface SendSMSRequest {
  phone?: string;
  declarationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, declarationId }: SendSMSRequest = await req.json();

    // Validate declarationId
    if (!declarationId) {
      throw new Error("Missing required parameter: declarationId");
    }

    // Generate a link to the health form
    const origin = req.headers.get("origin") || "https://your-app-url.com";
    const formLink = `${origin}/health-form?id=${declarationId}`;
    
    // Log the form link
    console.log(`Form link generated: ${formLink} for declaration ID: ${declarationId}`);
    
    // Update the health declaration entry in the database - make sure to use the correct field names
    const { error } = await supabase
      .from('health_declarations')
      .update({
        form_status: 'sent',
        updated_at: new Date().toISOString(),
        phone_sent_to: phone || ''
      })
      .eq('id', declarationId);
    
    if (error) {
      console.error('Error updating health declaration:', error);
      throw new Error(`Error updating health declaration: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "לינק הצהרת בריאות נוצר בהצלחה",
        formLink
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error in send-health-sms function:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
