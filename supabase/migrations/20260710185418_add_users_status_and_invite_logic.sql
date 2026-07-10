-- 1. Add status column to public.users
ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended'));

-- 2. Modify handle_new_user to use active if it's not an invite
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_status TEXT;
BEGIN
    -- Se tem data de convite, é pendente.
    IF NEW.invited_at IS NOT NULL THEN
        initial_status := 'pending';
    ELSE
        initial_status := 'active';
    END IF;

    INSERT INTO public.users (id, tenant_id, role, status)
    VALUES (
        new.id,
        (new.raw_user_meta_data->>'tenant_id')::uuid,
        COALESCE(new.raw_user_meta_data->>'role', 'User'),
        initial_status
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para transitar de pending -> active na confirmação
CREATE OR REPLACE FUNCTION public.handle_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
        UPDATE public.users SET status = 'active' WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_confirmation();

-- 4. Função RPC segura para listar usuários de um tenant
CREATE OR REPLACE FUNCTION public.get_tenant_users()
RETURNS TABLE (id UUID, email VARCHAR, role TEXT, status TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    caller_tenant_id UUID;
    caller_role TEXT;
BEGIN
    caller_tenant_id := (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid;
    caller_role := (current_setting('request.jwt.claims', true)::jsonb ->> 'role');

    -- Se não for Tenant-Admin ou superior, não retorna nada (segurança adicional)
    IF caller_role NOT IN ('Super-Admin', 'Tenant-Admin') THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT u.id, au.email::VARCHAR, u.role, u.status, u.created_at
    FROM public.users u
    JOIN auth.users au ON u.id = au.id
    WHERE u.tenant_id = caller_tenant_id;
END;
$$;
