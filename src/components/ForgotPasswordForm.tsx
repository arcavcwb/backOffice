import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from '@tanstack/react-router';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    try {
      await resetPassword(email);
      setSuccessMessage('Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.');
    } catch (err) {
      // Error is handled by the hook and displayed below
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Recuperar senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Digite seu e-mail e enviaremos um link para você.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {resetPasswordError && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 p-2 rounded">
              {resetPasswordError.message}
            </div>
          )}

          {successMessage && (
            <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/30 p-2 rounded">
              {successMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isResettingPassword}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResettingPassword ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </div>

          <div className="text-center text-sm mt-4">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Voltar ao login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
