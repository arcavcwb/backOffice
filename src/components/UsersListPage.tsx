import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type TenantUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

export function UsersListPage() {
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('User');
  const { user } = useAuth();

  const { data: users, isLoading, error } = useQuery<TenantUser[]>({
    queryKey: ['tenant_users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_tenant_users');
      if (error) throw error;
      return data || [];
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email, role }
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant_users'] });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('User');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, role, status }: { id: string; role: string; status: string }) => {
      const { error } = await supabase.rpc('update_tenant_user', {
        p_user_id: id,
        p_role: role,
        p_status: status
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant_users'] });
    }
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-500">Carregando equipe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-red-500 bg-red-50 p-6 rounded-lg shadow">Erro ao carregar usuários: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Equipe do Tenant</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gerencie o acesso e as funções dos colaboradores.</p>
          </div>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Convidar Usuário
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50/80 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Função
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{u.email}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{u.id}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                        u.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                          : u.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {u.status === 'active' ? 'Ativo' : u.status === 'pending' ? 'Pendente' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      {user?.id !== u.id && (
                        <div className="flex justify-end gap-2">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserMutation.mutate({ id: u.id, role: e.target.value, status: u.status })}
                            disabled={updateUserMutation.isPending}
                            className="text-xs border-gray-300 dark:border-gray-600 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="User">Usuário</option>
                            <option value="Approver">Aprovador</option>
                            <option value="Tenant-Admin">Admin</option>
                          </select>
                          <button
                            onClick={() => updateUserMutation.mutate({ id: u.id, role: u.role, status: u.status === 'suspended' ? 'active' : 'suspended' })}
                            disabled={updateUserMutation.isPending}
                            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                              u.status === 'suspended'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/50'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/50'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Reativar' : 'Suspender'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 flex-col items-center justify-center">
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-1">Nenhum usuário encontrado</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Convite */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Convidar Novo Usuário</h3>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleInviteSubmit} className="p-6">
                {inviteMutation.error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {inviteMutation.error.message}
                  </div>
                )}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="exemplo@empresa.com"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Função</label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="User">Usuário Padrão</option>
                    <option value="Approver">Aprovador</option>
                    <option value="Tenant-Admin">Administrador do Tenant</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                  >
                    {inviteMutation.isPending ? 'Enviando...' : 'Enviar Convite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
