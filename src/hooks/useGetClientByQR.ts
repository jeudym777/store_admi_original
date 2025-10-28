import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/supabaseClient';
import type { Client } from '@/types/client';

export const useGetClientByQR = (qrCode: string) => {
  return useQuery({
    queryKey: ['clientByQR', qrCode],
    queryFn: async (): Promise<Client | null> => {
      if (!qrCode) return null;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('qr_code', qrCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el cliente
          return null;
        }
        throw new Error(`Error fetching client by QR: ${error.message}`);
      }

      return data;
    },
    enabled: !!qrCode,
  });
};