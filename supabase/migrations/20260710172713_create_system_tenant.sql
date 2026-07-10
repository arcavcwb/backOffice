-- Insert the System Tenant
INSERT INTO public.tenants (id, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'System')
ON CONFLICT (id) DO NOTHING;
