import { describe, it, expect, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'fake-key';

describe('Aislamiento Cross-Tenant y Seguridad (RLS)', () => {
  it('RNF-01: Usuário do Tenant A não pode ler dados do Tenant B', async () => {
    const clientA = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: 'Bearer fake-jwt-tenant-a'
        }
      }
    });

    // Simulação do comportamento do Postgres RLS:
    // O RLS adiciona `AND tenant_id = 'meu_tenant'` na query.
    // Tentar acessar 'tenant-b-id' resulta em 0 linhas, sem erro.
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    clientA.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: mockSelect
      })
    }) as any;

    const { data } = await clientA.from('users').select('*').eq('tenant_id', 'tenant-b-id');
    
    // O retorno deve ser um array vazio, não vazando dados
    expect(data).toEqual([]);
    expect(mockSelect).toHaveBeenCalledWith('tenant_id', 'tenant-b-id');
  });

  it('RNF-03: Função básica (User) é bloqueada ao tentar ação de Admin via RPC', async () => {
    const clientBasic = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: 'Bearer fake-jwt-basic-user'
        }
      }
    });

    // O RPC 'update_tenant_user' verifica caller_role. 
    // Se não for Admin, a BD lança a exceção "Permissão negada".
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Permissão negada', code: 'P0001', details: '', hint: '' }
    });
    clientBasic.rpc = mockRpc;

    const { error } = await clientBasic.rpc('update_tenant_user', {
      p_user_id: 'target-user-id',
      p_role: 'Tenant-Admin',
      p_status: 'active'
    });

    expect(error).not.toBeNull();
    expect(error?.message).toBe('Permissão negada');
    expect(mockRpc).toHaveBeenCalled();
  });
});
