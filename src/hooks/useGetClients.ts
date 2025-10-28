import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import type { Client } from '@/types/client';

export const useGetClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching clients: ${error.message}`);
      }

      return data || [];
    },
  });
};