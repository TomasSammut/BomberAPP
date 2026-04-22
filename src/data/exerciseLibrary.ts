export interface ExerciseInfo {
  name: string;
  videoUrl?: string;
  description?: string;
  category: 'fuerza' | 'resistencia' | 'tecnica' | 'movilidad';
  tips?: string[];
}

export const exerciseLibrary: Record<string, ExerciseInfo> = {
  // FUERZA
  'Press de Banca': {
    name: 'Press de Banca',
    videoUrl: 'https://www.youtube.com/watch?v=tuwHzzPrzSA',
    category: 'fuerza',
    description: 'Ejercicio de empuje horizontal para pectoral y tríceps. En oposiciones suele ser a repeticiones con un peso fijo (40-45kg).',
    tips: ['Mantén 5 puntos de apoyo', 'Retracción escapular siempre', 'No rebotes en el pecho']
  },
  'Dominadas': {
    name: 'Dominadas',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    category: 'fuerza',
    description: 'Tracción vertical. Prueba reina de tren superior.',
    tips: ['Supera la barra con la barbilla', 'Extensión total de brazos abajo', 'Evita el balanceo (kipping)']
  },
  'Sentadillas': {
    name: 'Sentadillas',
    videoUrl: 'https://www.youtube.com/watch?v=q6hBSSiqX_U',
    category: 'fuerza',
    description: 'Fuerza base de piernas y estabilidad central.',
    tips: ['Talones siempre apoyados', 'Rodillas en dirección a las puntas', 'Mirada al frente']
  },
  'Peso Muerto Rumano': {
    name: 'Peso Muerto Rumano',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwvgQ',
    category: 'fuerza',
    description: 'Fortalecimiento de la cadena posterior (isquios y glúteo).',
    tips: ['Barra pegada a las piernas', 'Baja hasta notar tensión en isquios', 'Espalda neutra']
  },
  'Torre': {
    name: 'Torre (Escalera)',
    category: 'tecnica',
    description: 'Subida de escalones con sobrecarga o tiempo. Prueba crítica de resistencia muscular.',
    tips: ['Mantén un ritmo constante', 'Usa el braceo para impulsarte', 'Cuidado con el impacto en el descenso']
  },
  '3000m': {
    name: '3000m Lisos',
    category: 'resistencia',
    description: 'Prueba de resistencia aeróbica por excelencia en el Consorcio.',
    tips: ['Gestión de ritmos por vuelta', 'Mantén la calma en el primer km', 'Final explosivo']
  },
  '60m': {
    name: '60m Velocidad',
    category: 'resistencia',
    description: 'Explosividad pura y técnica de salida.',
    tips: ['Reacción al disparo', 'Máxima frecuencia de zancada', 'No frenar antes de la línea']
  },

  // TÉCNICA / ESPECÍFICO
  'Subida de Cuerda': {
    name: 'Subida de Cuerda',
    videoUrl: 'https://www.youtube.com/watch?v=H74HOfpG27M',
    category: 'tecnica',
    description: 'Prueba específica de bomberos. Combina fuerza de tracción y coordinación.',
    tips: ['Usa la pinza de pies para descansar brazos', 'Tracciones potentes y largas', 'Baja con control para evitar quemaduras']
  },
  'Salto Vertical': {
    name: 'Salto Vertical',
    videoUrl: 'https://www.youtube.com/watch?v=R9U0X8nE0yM',
    category: 'tecnica',
    description: 'Potencia explosiva de tren inferior.',
    tips: ['Carga explosiva de brazos', 'Aterrizaje amortiguado', 'Máxima extensión en el punto más alto']
  },
  'Circuito de Agilidad': {
    name: 'Circuito de Agilidad',
    videoUrl: 'https://www.youtube.com/watch?v=I0GqHUPuO_o',
    category: 'tecnica',
    description: 'Coordinación, velocidad de reacción y cambios de dirección.',
    tips: ['Pasos cortos en los giros', 'Baja el centro de gravedad', 'No quites la vista del siguiente obstáculo']
  },

  // RESISTENCIA
  'Course Navette': {
    name: 'Course Navette',
    videoUrl: 'https://www.youtube.com/watch?v=V6P39X6vGqU',
    category: 'resistencia',
    description: 'Test de potencia aeróbica máxima (1 minuto por periodo).',
    tips: ['Pisa la línea, no la sobrepases innecesariamente', 'Gira alternando la pierna de apoyo', 'Controla la respiración desde el inicio']
  },
  '1000m Lisos': {
    name: '1000m Lisos',
    videoUrl: 'https://www.youtube.com/watch?v=vVEnA6E4eO8',
    category: 'resistencia',
    description: 'Resistencia mixta aeróbica-anaeróbica.',
    tips: ['Ritmo constante los primeros 600m', 'Cambio de ritmo final a los 200m', 'Braceo activo']
  },
  'Natación: 50m Crol': {
    name: 'Natación 50m',
    videoUrl: 'https://www.youtube.com/watch?v=4asWyZ-9R_U',
    category: 'tecnica',
    description: 'Velocidad pura en agua.',
    tips: ['Salida explosiva y buen subacuático', 'No respires en los últimos 5-10m', 'Viraje rápido sin tocar fondo']
  },

  // MOVILIDAD
  'Estiramientos Dinámicos': {
    name: 'Calentamiento Dinámico',
    category: 'movilidad',
    description: 'Preparación articular antes del entrenamiento de alta intensidad.',
    tips: ['Círculos de hombro', 'Leg swings', 'Cat-cow']
  }
};
