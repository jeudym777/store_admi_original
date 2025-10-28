export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  cumpleanos_dia?: number;
  cumpleanos_mes?: string;
  recibir_promociones: boolean;
  // Nuevos campos para fidelización
  tipo_identificacion: TipoIdentificacion;
  numero_identificacion: string;
  qr_code: string;
  puntos_acumulados: number;
  nivel_fidelidad: NivelFidelidad;
  fecha_ultimo_punto?: string;
  user_id: string;
}

export interface NewClient {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  cumpleanos_dia?: number;
  cumpleanos_mes?: string;
  recibir_promociones: boolean;
  tipo_identificacion: TipoIdentificacion;
  numero_identificacion: string;
}

export interface UpdateClient {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  cumpleanos_dia?: number;
  cumpleanos_mes?: string;
  recibir_promociones?: boolean;
  tipo_identificacion?: TipoIdentificacion;
  numero_identificacion?: string;
  puntos_acumulados?: number;
}

export interface LoyaltyTransaction {
  id: string;
  created_at: string;
  client_id: string;
  puntos_otorgados: number;
  motivo: string;
  monto_compra?: number;
  descripcion?: string;
  user_id: string;
}

export interface NewLoyaltyTransaction {
  client_id: string;
  puntos_otorgados: number;
  motivo: string;
  monto_compra?: number;
  descripcion?: string;
}

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export const TIPOS_IDENTIFICACION = [
  'cedula', 'pasaporte', 'licencia', 'otro'
] as const;

export const NIVELES_FIDELIDAD = [
  'bronce', 'plata', 'oro', 'platino'
] as const;

export const MOTIVOS_PUNTOS = [
  'compra', 'registro', 'referido', 'cumpleanos', 'promocion', 'bonus'
] as const;

export type Mes = typeof MESES[number];
export type TipoIdentificacion = typeof TIPOS_IDENTIFICACION[number];
export type NivelFidelidad = typeof NIVELES_FIDELIDAD[number];
export type MotivoPuntos = typeof MOTIVOS_PUNTOS[number];

// Configuración del sistema de puntos
export const PUNTOS_CONFIG = {
  PUNTOS_POR_PESO: 1, // 1 punto por cada peso gastado
  BONUS_REGISTRO: 100, // Puntos por registrarse
  BONUS_CUMPLEANOS: 200, // Puntos en cumpleaños
  NIVELES: {
    bronce: { min: 0, max: 1999, descuento: 0 },
    plata: { min: 2000, max: 4999, descuento: 5 },
    oro: { min: 5000, max: 9999, descuento: 10 },
    platino: { min: 10000, max: Infinity, descuento: 15 }
  }
};