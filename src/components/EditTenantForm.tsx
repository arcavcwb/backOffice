import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from '@tanstack/react-router';

export function EditTenantForm({ tenantId }: { tenantId: string }) {
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTenant() {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('name')
          .eq('id', tenantId)
          .single();
        
        if (error) throw error;
        if (data) setTenantName(data.name);
      } catch (err: any) {
        setError('Não foi possível carregar o tenant. Acesso negado ou não encontrado.');
      } finally {
        setIsFetching(false);
      }
    }
    loadTenant();
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ name: tenantName, updated_at: new Date().toISOString() })
        .eq('id', tenantId);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Tenant atualizado com sucesso!');
      
      // Opcional: redirecionar após 2 segundos
      setTimeout(() => navigate({ to: '/' }), 2000);
      
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao atualizar o tenant.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Editar Tenant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Apenas para Super-Admins
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome da Empresa (Tenant)
              </label>
              <input
                id="tenantName"
                type="text"
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/30 p-3 rounded">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
