// Storage keys
export const STORAGE_KEYS = {
  PROFILE: 'bomberapp_profile',
  HISTORY: 'bomberapp_history',
  API_KEY: 'gemini_api_key'
} as const;

// Opposition IDs
export const OPPOSITION_IDS = {
  CONSORCIO_VLC: 'consorcio_vlc',
  AYTO_VLC: 'ayto_vlc'
} as const;

// Scoring tables
export const SCORING_TABLES = {
  VLC_2026: 'vlc_2026',
  AYTO_VLC_2024: 'ayto_vlc_2024'
} as const;

// Days of week
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
} as const;

// Day labels in Spanish
export const DAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
} as const;

// RPE defaults
export const RPE_DEFAULTS = {
  INITIAL: 7,
  MIN: 1,
  MAX: 10
} as const;

// History limits
export const HISTORY_LIMITS = {
  MAX_RECORDS: 500,
  RECENT_COUNT: 15,
  RECENT_WORKOUTS: 10
} as const;

// Training phases
export const TRAINING_PHASES = {
  BASE: 'base',
  SPECIFIC: 'specific',
  TRANSFORMATION: 'transformation',
  TAPERING: 'tapering',
  REALIZATION: 'realization'
} as const;

// Phase labels in Spanish
export const PHASE_LABELS: Record<string, string> = {
  base: 'FASE DE BASE (ACUMULACIÓN)',
  specific: 'FASE DE ESPECÍFICO',
  transformation: 'FASE DE TRANSFORMACIÓN',
  tapering: 'TAPER (PUESTA A PUNTO)',
  realization: 'FASE DE REALIZACIÓN (PEAK)'
} as const;

// Notifications timeout (ms)
export const NOTIFICATION_TIMEOUT = 3000;

// Default physical data
export const DEFAULT_PHYSICAL_DATA = {
  WEIGHT: 75,
  HEIGHT: 175,
  BIRTH_DATE: '1995-01-01'
} as const;

// Avatars
export const AVATARS: Record<string, string> = {
  '1': '👨‍🚒',
  '2': '👩‍🚒',
  '3': '🚒',
  '4': '🦁',
  '5': '🦅',
  '6': '⚡'
} as const;
