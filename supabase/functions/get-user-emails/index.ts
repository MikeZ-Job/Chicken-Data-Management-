import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetUserEmailsRequest {
  userIds: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { userIds }: GetUserEmailsRequest = await req.json();

    if (!userIds || !Array.isArray(userIds)) {
      return new Response(
        JSON.stringify({ error: "userIds array is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emails: Record<string, string> = {};

    // Get emails for each user ID
    for (const userId of userIds) {
      try {
        const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!error && authUser.user?.email) {
          emails[userId] = authUser.user.email;
        }
      } catch (error) {
        console.error(`Error fetching email for user ${userId}:`, error);
        // Continue with other users
      }
    }

    return new Response(
      JSON.stringify({ emails }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in get-user-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);