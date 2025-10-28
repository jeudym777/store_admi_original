import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import type { NewClient } from '@/types/client';
import { generateClientQRCode } from '@/utils/clientUtils';
import { PUNTOS_CONFIG } from '@/types/client';

export const useAddClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newClient: NewClient) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Crear un QR code único temporal
      const tempQRCode = generateClientQRCode('temp', newClient.nombre, newClient.apellidos);

      const clientData = {
        ...newClient,
        qr_code: tempQRCode,
        puntos_acumulados: PUNTOS_CONFIG.BONUS_REGISTRO, // Puntos de bienvenida
        nivel_fidelidad: 'bronce' as const,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding client: ${error.message}`);
      }

      // Actualizar el QR code con el ID real del cliente
      const realQRCode = generateClientQRCode(data.id, newClient.nombre, newClient.apellidos);
      
      const { data: updatedClient, error: updateError } = await supabase
        .from('clients')
        .update({ qr_code: realQRCode })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating QR code:', updateError);
        return data; // Retornar data original si falla la actualización del QR
      }

      // Registrar transacción de puntos de bienvenida
      await supabase
        .from('loyalty_transactions')
        .insert([{
          client_id: data.id,
          puntos_otorgados: PUNTOS_CONFIG.BONUS_REGISTRO,
          motivo: 'registro',
          descripcion: 'Puntos de bienvenida por registrarse',
          user_id: user.id
        }]);

      return updatedClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};