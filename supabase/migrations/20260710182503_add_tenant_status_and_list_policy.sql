-- Adicionar coluna de status a tenants
ALTER TABLE public.tenants ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- Permitir leitura global para Super-Admins
CREATE POLICY "Super-Admins pueden ver todos los tenants" 
ON public.tenants FOR SELECT 
USING ((current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'Super-Admin');
