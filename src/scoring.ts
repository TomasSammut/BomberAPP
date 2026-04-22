import type { Gender, TestDefinition, TestScore, TestCriteria, Opposition } from './types';

export const oppositions: Opposition[] = [
  {
    id: 'consorcio_vlc',
    name: 'Consorcio Valencia 2026',
    shortName: 'Valencia',
    description: 'Baremos oficiales del Consorcio Provincial de Bomberos de Valencia.',
    scoringTable: 'vlc_2026'
  },
  {
    id: 'ayto_vlc',
    name: 'Ayuntamiento de Valencia',
    shortName: 'Ayto VLC',
    description: 'Baremos oficiales Ayuntamiento de Valencia (Pruebas 2024).',
    scoringTable: 'ayto_vlc_2024'
  }
];

export const tests: TestDefinition[] = [
  { name: 'Cuerda', unit: 'seconds' },
  { name: '3000m', unit: 'time' },
  { name: '60m', unit: 'seconds' },
  { name: 'Natacion', unit: 'time' },
  { name: 'Press Banca', unit: 'reps' },
  { name: 'Torre', unit: 'towerTime' },
];

export const allScoringCriteria: Record<string, Record<string, TestCriteria>> = {
  'vlc_2026': {
    'Cuerda': {
      testName: 'Cuerda',
      unit: 'seconds',
      betterIs: 'lower',
      minApto: { male: 15, female: 15 },
      thresholds: {
        male: [
          { value: 5, score: 10 }, { value: 7, score: 9 }, { value: 9, score: 8 },
          { value: 11, score: 7 }, { value: 13, score: 6 }, { value: 15, score: 5 }
        ],
        female: [
          { value: 5, score: 10 }, { value: 7, score: 9 }, { value: 9, score: 8 },
          { value: 11, score: 7 }, { value: 13, score: 6 }, { value: 15, score: 5 }
        ]
      }
    },
    '3000m': {
      testName: '3000m',
      unit: 'time',
      betterIs: 'lower',
      minApto: { male: 720, female: 810 },
      thresholds: {
        male: [
          { value: 615, score: 10 }, { value: 636, score: 9 }, { value: 657, score: 8 },
          { value: 678, score: 7 }, { value: 699, score: 6 }, { value: 720, score: 5 }
        ],
        female: [
          { value: 675, score: 10 }, { value: 702, score: 9 }, { value: 729, score: 8 },
          { value: 756, score: 7 }, { value: 783, score: 6 }, { value: 810, score: 5 }
        ]
      }
    },
    '60m': {
      testName: '60m',
      unit: 'seconds',
      betterIs: 'lower',
      minApto: { male: 8.8, female: 9.7 },
      thresholds: {
        male: [
          { value: 7.0, score: 10 }, { value: 7.2, score: 9 }, { value: 7.6, score: 8 },
          { value: 8.0, score: 7 }, { value: 8.4, score: 6 }, { value: 8.8, score: 5 }
        ],
        female: [
          { value: 7.9, score: 10 }, { value: 8.3, score: 9 }, { value: 8.7, score: 8 },
          { value: 9.1, score: 7 }, { value: 9.4, score: 6 }, { value: 9.7, score: 5 }
        ]
      }
    },
    'Natacion': {
      testName: 'Natacion',
      unit: 'time',
      betterIs: 'lower',
      minApto: { male: 90, female: 105 },
      thresholds: {
        male: [
          { value: 65, score: 10 }, { value: 70, score: 9 }, { value: 75, score: 8 },
          { value: 80, score: 7 }, { value: 85, score: 6 }, { value: 90, score: 5 }
        ],
        female: [
          { value: 80, score: 10 }, { value: 85, score: 9 }, { value: 90, score: 8 },
          { value: 95, score: 7 }, { value: 100, score: 6 }, { value: 105, score: 5 }
        ]
      }
    },
    'Press Banca': {
      testName: 'Press Banca',
      unit: 'reps',
      betterIs: 'higher',
      minApto: { male: 20, female: 20 },
      thresholds: {
        male: [
          { value: 40, score: 10 }, { value: 36, score: 9 }, { value: 32, score: 8 },
          { value: 28, score: 7 }, { value: 24, score: 6 }, { value: 20, score: 5 }
        ],
        female: [
          { value: 40, score: 10 }, { value: 36, score: 9 }, { value: 32, score: 8 },
          { value: 28, score: 7 }, { value: 24, score: 6 }, { value: 20, score: 5 }
        ]
      }
    },
    'Torre': {
      testName: 'Torre',
      unit: 'towerTime',
      betterIs: 'lower',
      minApto: { male: 30, female: 33 },
      thresholds: {
        male: [
          { value: 23.63, score: 10 }, { value: 24.26, score: 9.5 }, { value: 24.9, score: 9 },
          { value: 25.54, score: 8.5 }, { value: 26.18, score: 8 }, { value: 26.81, score: 7.5 },
          { value: 27.45, score: 7 }, { value: 28.09, score: 6.5 }, { value: 28.72, score: 6 },
          { value: 29.36, score: 5.5 }, { value: 30, score: 5 }
        ],
        female: [
          { value: 26.63, score: 10 }, { value: 27.26, score: 9.5 }, { value: 27.9, score: 9 },
          { value: 28.54, score: 8.5 }, { value: 29.18, score: 8 }, { value: 29.81, score: 7.5 },
          { value: 30.45, score: 7 }, { value: 31.09, score: 6.5 }, { value: 31.72, score: 6 },
          { value: 32.36, score: 5.5 }, { value: 33, score: 5 }
        ]
      }
    }
  },
  'ayto_vlc_2024': {
    'Cuerda': {
      testName: 'Cuerda',
      unit: 'seconds',
      betterIs: 'lower',
      minApto: { male: 12.5, female: 13.5 },
      thresholds: {
        male: [
          { value: 6.5, score: 10 }, { value: 7.5, score: 9 }, { value: 8.5, score: 8 },
          { value: 9.5, score: 7 }, { value: 10.5, score: 6 }, { value: 12.5, score: 5 }
        ],
        female: [
          { value: 7.5, score: 10 }, { value: 8.5, score: 9 }, { value: 9.5, score: 8 },
          { value: 10.5, score: 7 }, { value: 11.5, score: 6 }, { value: 13.5, score: 5 }
        ]
      }
    },
    '3000m': {
      testName: '3000m',
      unit: 'time',
      betterIs: 'lower',
      minApto: { male: 720, female: 810 },
      thresholds: {
        male: [
          { value: 615, score: 10 }, { value: 636, score: 9 }, { value: 657, score: 8 },
          { value: 678, score: 7 }, { value: 699, score: 6 }, { value: 720, score: 5 }
        ],
        female: [
          { value: 675, score: 10 }, { value: 702, score: 9 }, { value: 729, score: 8 },
          { value: 756, score: 7 }, { value: 783, score: 6 }, { value: 810, score: 5 }
        ]
      }
    },
    '60m': {
      testName: '60m',
      unit: 'seconds',
      betterIs: 'lower',
      minApto: { male: 8.6, female: 9.5 },
      thresholds: {
        male: [
          { value: 7.2, score: 10 }, { value: 7.4, score: 9 }, { value: 7.8, score: 8 },
          { value: 8.2, score: 7 }, { value: 8.4, score: 6 }, { value: 8.6, score: 5 }
        ],
        female: [
          { value: 8.1, score: 10 }, { value: 8.5, score: 9 }, { value: 8.9, score: 8 },
          { value: 9.1, score: 7 }, { value: 9.3, score: 6 }, { value: 9.5, score: 5 }
        ]
      }
    },
    'Natacion': {
      testName: 'Natacion',
      unit: 'time',
      betterIs: 'lower',
      minApto: { male: 85, female: 100 },
      thresholds: {
        male: [
          { value: 60, score: 10 }, { value: 65, score: 9 }, { value: 70, score: 8 },
          { value: 75, score: 7 }, { value: 80, score: 6 }, { value: 85, score: 5 }
        ],
        female: [
          { value: 75, score: 10 }, { value: 80, score: 9 }, { value: 85, score: 8 },
          { value: 90, score: 7 }, { value: 95, score: 6 }, { value: 100, score: 5 }
        ]
      }
    },
    'Press Banca': {
      testName: 'Press Banca',
      unit: 'reps',
      betterIs: 'higher',
      minApto: { male: 25, female: 25 },
      thresholds: {
        male: [
          { value: 45, score: 10 }, { value: 41, score: 9 }, { value: 37, score: 8 },
          { value: 33, score: 7 }, { value: 29, score: 6 }, { value: 25, score: 5 }
        ],
        female: [
          { value: 45, score: 10 }, { value: 41, score: 9 }, { value: 37, score: 8 },
          { value: 33, score: 7 }, { value: 29, score: 6 }, { value: 25, score: 5 }
        ]
      }
    },
    'Torre': {
      testName: 'Torre',
      unit: 'towerTime',
      betterIs: 'lower',
      minApto: { male: 110, female: 130 },
      thresholds: {
        male: [
          { value: 81, score: 10 }, { value: 84, score: 9.5 }, { value: 87, score: 9 },
          { value: 90, score: 8.5 }, { value: 93, score: 8 }, { value: 96, score: 7.5 },
          { value: 99, score: 7 }, { value: 102, score: 6.5 }, { value: 105, score: 6 },
          { value: 108, score: 5.5 }, { value: 110, score: 5 }
        ],
        female: [
          { value: 101, score: 10 }, { value: 104, score: 9.5 }, { value: 107, score: 9 },
          { value: 110, score: 8.5 }, { value: 113, score: 8 }, { value: 116, score: 7.5 },
          { value: 119, score: 7 }, { value: 122, score: 6.5 }, { value: 125, score: 6 },
          { value: 128, score: 5.5 }, { value: 130, score: 5 }
        ]
      }
    }
  }
};

export const emptyScores = (): TestScore[] =>
  tests.map((test) => ({
    name: test.name,
    score: 0,
    status: 'No Apto',
    value: '',
  }));

export const parseValue = (value: string, unit: TestDefinition['unit']): number => {
  if (!value || !value.trim()) return Number.NaN;

  if (unit === 'time' || unit === 'towerTime') {
    const parts = value.split(':');
    if (parts.length === 1) return Number(parts[0]);
    if (parts.length === 2) {
      const [m, s] = parts;
      return Number(m) * 60 + Number(s);
    }
    return Number.NaN;
  }

  return Number.parseFloat(value);
};

export const getPlaceholder = (unit: TestDefinition['unit']) => {
  switch (unit) {
    case 'time': return '1:15';
    case 'towerTime': return '27.45';
    case 'seconds': return '8.4';
    case 'reps': return '25';
    default: return '';
  }
};

export const calculateScore = (
  testName: string,
  value: string,
  gender: Gender,
  oppositionId: string = 'consorcio_vlc'
): TestScore => {
  const opp = oppositions.find(o => o.id === oppositionId) || oppositions[0];
  const criteriaSet = allScoringCriteria[opp.scoringTable];
  const criteria = criteriaSet ? criteriaSet[testName] : null;

  if (!criteria) return { name: testName, score: 0, status: 'No Apto', value };

  const rawValue = parseValue(value, criteria.unit);
  if (Number.isNaN(rawValue)) return { name: testName, score: 0, status: 'No Apto', value };

  const thresholds = criteria.thresholds[gender];
  const maxVal = criteria.minApto[gender];

  if (criteria.betterIs === 'lower' && rawValue > maxVal) return { name: testName, score: 0, status: 'No Apto', value };
  if (criteria.betterIs === 'higher' && rawValue < maxVal) return { name: testName, score: 0, status: 'No Apto', value };

  let score = 0;
  for (const t of thresholds) {
    if (criteria.betterIs === 'lower') {
      if (rawValue <= t.value) score = Math.max(score, t.score);
    } else {
      if (rawValue >= t.value) score = Math.max(score, t.score);
    }
  }

  if (score === 0) score = 5;

  return { name: testName, score, status: 'Apto', value };
};

export const getPercentile = (
  testName: string,
  value: string,
  gender: Gender,
  oppositionId: string = 'consorcio_vlc'
): number => {
  const opp = oppositions.find(o => o.id === oppositionId) || oppositions[0];
  const criteriaSet = allScoringCriteria[opp.scoringTable];
  const criteria = criteriaSet ? criteriaSet[testName] : null;

  if (!criteria) return 0;
  const rawValue = parseValue(value, criteria.unit);
  if (Number.isNaN(rawValue)) return 0;

  const thresholds = criteria.thresholds[gender];
  const bestThreshold = thresholds.find(t => t.score === 10) || thresholds[0];
  const worstThreshold = criteria.minApto[gender];

  if (criteria.betterIs === 'lower') {
    if (rawValue <= bestThreshold.value) return 100;
    if (rawValue >= worstThreshold) return 0;
    return Math.round(((worstThreshold - rawValue) / (worstThreshold - bestThreshold.value)) * 100);
  } else {
    if (rawValue >= bestThreshold.value) return 100;
    if (rawValue <= worstThreshold) return 0;
    return Math.round(((rawValue - worstThreshold) / (bestThreshold.value - worstThreshold)) * 100);
  }
};

export const getNextThresholdHint = (testName: string, value: string, gender: Gender, oppositionId: string = 'consorcio_vlc') => {
  const opp = oppositions.find(o => o.id === oppositionId) || oppositions[0];
  const criteriaSet = allScoringCriteria[opp.scoringTable];
  const criteria = criteriaSet ? criteriaSet[testName] : null;

  if (!criteria) return null;

  const rawValue = parseValue(value, criteria.unit);
  if (Number.isNaN(rawValue)) return null;

  const thresholds = [...criteria.thresholds[gender]].sort((a, b) =>
    criteria.betterIs === 'lower' ? b.value - a.value : a.value - b.value
  );

  const currentScore = calculateScore(testName, value, gender, oppositionId).score;

  const next = thresholds.find(t => t.score > currentScore);
  if (!next) return null;

  const diff = Math.abs(next.value - rawValue).toFixed(criteria.unit === 'towerTime' ? 2 : 1);
  return {
    points: next.score,
    diff,
    unit: criteria.unit === 'reps' ? 'reps' : 's'
  };
};
