import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from '@tanstack/react-router';

export function CreateTenantForm() {
  const [tenantName, setTenantName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-tenant', {
        body: { tenantName, adminEmail }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Erro ao comunicar com a API');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSuccess('Tenant criado e convite enviado com sucesso!');
      setTenantName('');
      setAdminEmail('');
      
      // Opcional: redirecionar após 2 segundos
      setTimeout(() => navigate({ to: '/' }), 2000);
      
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar o tenant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Criar Novo Tenant
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
            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail do Administrador
              </label>
              <input
                id="adminEmail"
                type="email"
                required
                className="mt-1 block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
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
            {isLoading ? 'Criando...' : 'Criar Tenant'}
          </button>
        </form>
      </div>
    </div>
  );
}
