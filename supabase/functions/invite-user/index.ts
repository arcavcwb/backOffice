import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    const callerRole = user.app_metadata.role
    const callerTenantId = user.app_metadata.tenant_id

    if (callerRole !== 'Tenant-Admin' && callerRole !== 'Super-Admin') {
      return new Response(JSON.stringify({ error: 'Permissão negada' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    const { email, role } = await req.json()

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email e role são obrigatórios' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    const allowedRoles = ['Tenant-Admin', 'Approver', 'User']
    if (!allowedRoles.includes(role)) {
      return new Response(JSON.stringify({ error: 'Role inválida' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        tenant_id: callerTenantId,
        role: role
      }
    })

    if (error) {
      if (error.status === 422 || error.message.toLowerCase().includes('already exists')) {
         return new Response(JSON.stringify({ error: 'E-mail já está cadastrado no sistema.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
      }
      throw error
    }

    return new Response(JSON.stringify({ success: true, user: data.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  }
})
