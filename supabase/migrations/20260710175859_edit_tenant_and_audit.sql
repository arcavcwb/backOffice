-- 1. Tabla de auditoría
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para audit_logs (solo el Super-Admin puede leerla)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super-Admins pueden ver audit_logs" 
ON public.audit_logs FOR SELECT 
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'Super-Admin');

-- 2. Función Trigger
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_id uuid;
BEGIN
    -- Capturamos el UID del usuario actual
    user_id := auth.uid();
    
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME::text, OLD.id, TG_OP, row_to_json(OLD)::jsonb, user_id);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME::text, NEW.id, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME::text, NEW.id, TG_OP, row_to_json(NEW)::jsonb, user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger en la tabla tenants
CREATE TRIGGER audit_tenants_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- 4. RLS para UPDATE de Tenants
CREATE POLICY "Super-Admins pueden editar tenants" 
ON public.tenants FOR UPDATE
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'Super-Admin');
