import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import type { NewLoyaltyTransaction } from '@/types/client';

export const useAddLoyaltyPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: NewLoyaltyTransaction) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insertar la transacción
      const { data: transactionData, error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (transactionError) {
        throw new Error(`Error adding loyalty transaction: ${transactionError.message}`);
      }

      // Actualizar puntos del cliente
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('puntos_acumulados')
        .eq('id', transaction.client_id)
        .single();

      if (clientError) {
        throw new Error(`Error fetching client: ${clientError.message}`);
      }

      const newPoints = client.puntos_acumulados + transaction.puntos_otorgados;

      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update({ 
          puntos_acumulados: newPoints,
          fecha_ultimo_punto: new Date().toISOString()
        })
        .eq('id', transaction.client_id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error updating client points: ${updateError.message}`);
      }

      return { transaction: transactionData, client: updatedClient };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['loyaltyTransactions'] });
    },
  });
};