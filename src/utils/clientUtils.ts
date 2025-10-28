import QRCode from 'qrcode';

// Generar un código QR único para el cliente
export const generateClientQRCode = (clientId: string, nombre: string, apellidos: string): string => {
  // Crear un código único que incluya información del cliente
  const timestamp = Date.now();
  const uniqueString = `CLIENT:${clientId}:${nombre}:${apellidos}:${timestamp}`;
  return btoa(uniqueString).replace(/[+/=]/g, '').substring(0, 16);
};

// Generar imagen QR
export const generateQRCodeImage = async (qrData: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Decodificar datos del QR
export const decodeQRCode = (qrCode: string): { clientId: string } | null => {
  try {
    const decoded = atob(qrCode);
    const parts = decoded.split(':');
    if (parts[0] === 'CLIENT' && parts[1]) {
      return { clientId: parts[1] };
    }
    return null;
  } catch (error) {
    console.error('Error decoding QR code:', error);
    return null;
  }
};

// Calcular nivel de fidelidad basado en puntos
export const calculateLoyaltyLevel = (puntos: number): string => {
  if (puntos >= 10000) return 'platino';
  if (puntos >= 5000) return 'oro';
  if (puntos >= 2000) return 'plata';
  return 'bronce';
};

// Obtener color del nivel de fidelidad
export const getLoyaltyLevelColor = (nivel: string): string => {
  switch (nivel) {
    case 'platino': return 'bg-gray-800 text-white';
    case 'oro': return 'bg-yellow-500 text-white';
    case 'plata': return 'bg-gray-400 text-white';
    case 'bronce': return 'bg-amber-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Obtener descuento del nivel
export const getLoyaltyDiscount = (nivel: string): number => {
  switch (nivel) {
    case 'platino': return 15;
    case 'oro': return 10;
    case 'plata': return 5;
    case 'bronce': return 0;
    default: return 0;
  }
};

// Formatear tipo de identificación
export const formatTipoIdentificacion = (tipo: string): string => {
  switch (tipo) {
    case 'cedula': return 'Cédula';
    case 'pasaporte': return 'Pasaporte';
    case 'licencia': return 'Licencia';
    case 'otro': return 'Otro';
    default: return 'No especificado';
  }
};