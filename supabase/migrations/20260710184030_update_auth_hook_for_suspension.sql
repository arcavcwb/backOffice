CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role public.users.role%TYPE;
    user_tenant_id public.users.tenant_id%TYPE;
    tenant_status public.tenants.status%TYPE;
BEGIN
    -- Busca o usuário e o status do seu tenant
    SELECT u.role, u.tenant_id, t.status 
    INTO user_role, user_tenant_id, tenant_status
    FROM public.users u
    LEFT JOIN public.tenants t ON t.id = u.tenant_id
    WHERE u.id = (event->>'user_id')::uuid;

    -- Bloquear login se estiver suspenso
    IF tenant_status = 'suspended' THEN
        RAISE EXCEPTION 'Acesso negado: O tenant está suspenso.';
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
