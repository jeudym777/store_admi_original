import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import type { LoyaltyTransaction } from '@/types/client';

export const useGetLoyaltyTransactions = (clientId?: string) => {
  return useQuery({
    queryKey: ['loyaltyTransactions', clientId],
    queryFn: async (): Promise<LoyaltyTransaction[]> => {
      let query = supabase
        .from('loyalty_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching loyalty transactions: ${error.message}`);
      }

      return data || [];
    },
  });
};