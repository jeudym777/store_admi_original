import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        throw new Error(`Error deleting client: ${error.message}`);
      }

      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};