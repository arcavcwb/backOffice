import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Client authentication context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // 2. Check if user is Super-Admin
    const { data: userRoleData, error: roleError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (roleError || userRoleData?.role !== 'Super-Admin') {
      return new Response(JSON.stringify({ error: 'Acesso negado: apenas Super-Admins' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { tenantName, adminEmail } = await req.json();

    if (!tenantName || !adminEmail) {
      throw new Error('tenantName e adminEmail são obrigatórios');
    }

    // 3. Admin client (service_role)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 4. Create the new tenant
    const { data: newTenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({ name: tenantName })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 5. Invite the new admin
    const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      adminEmail
    );

    if (inviteError) {
      await supabaseAdmin.from('tenants').delete().eq('id', newTenant.id);
      throw inviteError;
    }

    // 6. Assign role
    const { error: assignError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: newTenant.id,
        role: 'Admin'
      });

    if (assignError) throw assignError;

    return new Response(JSON.stringify({ tenant: newTenant }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
