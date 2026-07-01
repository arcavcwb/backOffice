import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: async (credentials: SignInWithPasswordCredentials) => {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
  });

  return {
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
