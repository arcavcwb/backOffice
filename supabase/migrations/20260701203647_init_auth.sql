-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.tenants
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio tenant" 
    ON public.tenants FOR SELECT 
    USING (id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid);

-- Solo superadmins via service_role pueden crear/editar/borrar tenants, asi que no anadimos politicas aqui para usuarios normales

-- Table: public.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
    role TEXT NOT NULL DEFAULT 'Usuario',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para tenant_id
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);

-- RLS para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver otros usuarios de su mismo tenant" 
    ON public.users FOR SELECT 
    USING (tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid);

-- Custom JWT Auth Hook (crea el hook y lo registra)
-- Esto anadira tenant_id y role a los claims del token JWT al hacer login
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role public.users.role%TYPE;
    user_tenant_id public.users.tenant_id%TYPE;
BEGIN
    -- Busca el usuario en public.users
    SELECT role, tenant_id INTO user_role, user_tenant_id
    FROM public.users
    WHERE id = (event->>'user_id')::uuid;

    claims := event->'claims';

    IF user_role IS NOT NULL THEN
        -- Añade los claims
        claims := jsonb_set(claims, '{tenant_id}', to_jsonb(user_tenant_id));
        claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
    ELSE
        -- Si no esta en public.users, quizas es un admin global o un usuario recien creado.
        -- Depende de la logica, por defecto ponemos nulo.
        claims := jsonb_set(claims, '{tenant_id}', 'null'::jsonb);
        claims := jsonb_set(claims, '{role}', 'null'::jsonb);
    END IF;

    -- Actualiza el evento con los nuevos claims
    event := jsonb_set(event, '{claims}', claims);
    
    RETURN event;
END;
$$;

-- Otorga permisos a supabase_auth_admin (necesario para hooks)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT SELECT ON public.users TO supabase_auth_admin;

-- Configurar el hook en el esquema auth (normalmente esto se hace via dashboard o API,
-- pero a nivel local / migracion, si tenemos pgcrypto o supabase local no siempre 
-- podemos tocar auth local de forma arbitraria sin usar config.toml. 
-- No obstaste, la function es la base del Custom JWT Hook).
