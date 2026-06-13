import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Verifica se o usuário que está fazendo a requisição está autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Not authenticated');

    // Verifica se o usuário é admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      throw new Error('Not authorized');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const { action, email, password, userId, name, role, phone } = body;

    let result;

    if (action === 'create_user') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (error) throw error;
      
      const newUserId = data.user.id;
      const { error: insertError } = await supabaseAdmin.from('profiles').insert([
        { id: newUserId, name, role, phone: phone || null }
      ]);
      
      if (insertError) {
        // Rollback se falhar a criação do profile
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        throw insertError;
      }
      result = { user: data.user };
    } else if (action === 'delete_user') {
      const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      result = data;
    } else if (action === 'update_user') {
      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      if (Object.keys(updateData).length > 0) {
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
        if (updateAuthError) throw updateAuthError;
      }

      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ name, role, phone: phone || null })
        .eq('id', userId);

      if (updateProfileError) throw updateProfileError;
      result = { success: true };
    } else if (action === 'list_users') {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;
      
      const { data: profiles, error: getProfilesError } = await supabaseAdmin
        .from('profiles')
        .select('*');
      if (getProfilesError) throw getProfilesError;
      
      const combined = profiles.map((p: any) => {
        const u = users.find((usr: any) => usr.id === p.id);
        return {
          ...p,
          email: u?.email || ''
        };
      });
      result = combined;
    } else {
      throw new Error(`Invalid action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
