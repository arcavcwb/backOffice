-- 1. Update hook to check user status
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role public.users.role%TYPE;
    user_tenant_id public.users.tenant_id%TYPE;
    user_status public.users.status%TYPE;
    tenant_status public.tenants.status%TYPE;
BEGIN
    SELECT u.role, u.tenant_id, u.status, t.status 
    INTO user_role, user_tenant_id, user_status, tenant_status
    FROM public.users u
    LEFT JOIN public.tenants t ON t.id = u.tenant_id
    WHERE u.id = (event->>'user_id')::uuid;

    IF tenant_status = 'suspended' THEN
        RAISE EXCEPTION 'Acesso negado: O tenant está suspenso.';
    END IF;

    IF user_status = 'suspended' THEN
        RAISE EXCEPTION 'Acesso negado: O usuário está suspenso.';
    END IF;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
        claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id));
        claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
    ELSE
        claims := jsonb_set(claims, '{tenant_id}', 'null'::jsonb);
        claims := jsonb_set(claims, '{role}', 'null'::jsonb);
    END IF;

    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;

-- 2. Create RPC for updating a tenant user securely
CREATE OR REPLACE FUNCTION public.update_tenant_user(p_user_id UUID, p_role TEXT, p_status TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    caller_tenant_id UUID;
    caller_role TEXT;
    target_tenant_id UUID;
BEGIN
    caller_tenant_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid;
    caller_role := (current_setting('request.jwt.claims', true)::jsonb ->> 'role');

    IF caller_role NOT IN ('Super-Admin', 'Tenant-Admin') THEN
        RAISE EXCEPTION 'Permissão negada';
    END IF;

    -- Obter o tenant do usuário alvo
    SELECT tenant_id INTO target_tenant_id FROM public.users WHERE id = p_user_id;

    IF target_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;

    -- Verificar se pertence ao mesmo tenant (Super-Admin pode alterar de qualquer tenant)
    IF caller_role = 'Tenant-Admin' AND caller_tenant_id != target_tenant_id THEN
        RAISE EXCEPTION 'Usuário não pertence ao seu tenant';
    END IF;

    UPDATE public.users 
    SET role = p_role, status = p_status, updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;
