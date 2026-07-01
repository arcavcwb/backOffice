import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types'; // Assuming we have types or we will create them

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan variables de entorno de Supabase.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
