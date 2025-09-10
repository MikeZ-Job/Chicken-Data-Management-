import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password?: string;
  role: 'admin' | 'farm_manager' | 'staff';
  assignedFarmId?: string;
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

    const { email, password = "TempPassword123!", role, assignedFarmId }: CreateUserRequest = await req.json();

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: "Email and role are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get permissions for the role
    const getPermissionsForRole = (userRole: string): string[] => {
      switch (userRole) {
        case 'admin':
          return ['full_access', 'user_management', 'farm_management', 'view_all_farms'];
        case 'farm_manager':
          return ['manage_assigned_farm', 'view_reports', 'manage_staff'];
        case 'staff':
          return ['record_weights', 'record_food', 'view_assigned_data'];
        default:
          return [];
      }
    };

    const permissions = getPermissionsForRole(role);

    // Create the user with admin client (no email verification needed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      throw authError;
    }

    // Check if app_users record exists, if not create it, otherwise update it
    const { data: existingUser } = await supabaseAdmin
      .from('app_users')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    if (existingUser) {
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('app_users')
        .update({
          role,
          permissions,
          assigned_farm_id: assignedFarmId || null,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating app_users:', updateError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw updateError;
      }
    } else {
      // Create new record (in case trigger didn't work)
      const { error: insertError } = await supabaseAdmin
        .from('app_users')
        .insert({
          id: authData.user.id,
          role,
          permissions,
          assigned_farm_id: assignedFarmId || null,
        });

      if (insertError) {
        console.error('Error inserting app_users:', insertError);
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role,
          permissions,
          assigned_farm_id: assignedFarmId || null,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
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