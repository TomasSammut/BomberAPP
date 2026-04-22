export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: any[], history: any[], profile: any) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first_workout',
    title: 'Primer Paso',
    description: 'Completa tu primer entrenamiento.',
    icon: '🔥',
    condition: (_, history) => history.filter(h => h.type === 'workout').length >= 1
  },
  {
    id: 'streak_3',
    title: 'Constancia',
    description: 'Mantén una racha de 3 días.',
    icon: '🏃',
    condition: (_, __, profile) => (profile.streak || 0) >= 3
  },
  {
    id: 'max_score',
    title: 'Bombero de Élite',
    description: 'Consigue 10 puntos en cualquier prueba.',
    icon: '🏆',
    condition: (stats) => stats.some(s => s.score >= 10)
  },
  {
    id: 'half_way',
    title: 'A Medio Camino',
    description: 'Supera los 30 puntos totales.',
    icon: '🎯',
    condition: (stats) => stats.reduce((acc, s) => acc + s.score, 0) >= 30
  },
  {
    id: 'rope_master',
    title: 'Señor de la Cuerda',
    description: 'Consigue al menos un 8 en la subida de cuerda.',
    icon: '🧗',
    condition: (stats) => stats.find(s => s.name === 'Cuerda')?.score >= 8
  }
];
