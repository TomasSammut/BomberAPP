export type Gender = 'male' | 'female';

export type Status = 'Apto' | 'No Apto';

export interface TestScore {
  name: string;
  value: string;
  score: number;
  status?: Status;
}

export interface BestMark {
  value: string;
  timestamp: number;
}

export interface TestDefinition {
  name: string;
  unit: 'seconds' | 'reps' | 'meters' | 'towerTime' | 'time';
  description?: string;
}

export interface UserPhysicalData {
  weight?: number;
  height?: number;
  birthDate?: string;
  injuries?: string;
}

export interface Availability {
  daysPerWeek: number;
  specificDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  hasPool: boolean;
  hasTrack: boolean;
  hasTower: boolean;
  workShift: 'morning' | 'afternoon' | 'night' | 'rotative';
}

export interface TrainingPlan {
  phase: 'base' | 'specific' | 'tapering' | 'transformation' | 'realization';
  weeklyFocus?: string;
  weeklySchedule: Record<number, {
    dayName: string;
    type?: 'rest' | 'athletics' | 'strength' | 'swimming' | 'active_recovery';
    title: string;
    warmup?: string[];
    exercises: {
      name: string;
      sets?: number;
      reps_or_time?: string;
      rest?: string;
      coach_tip?: string;
      target: string;
      completed: boolean;
    }[];
  }>;
  generatedAt: number;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  activeOppositionId: string;
  bestMarks: Record<string, BestMark>;
  targets: Record<string, string>;
  physicalData?: UserPhysicalData;
  availability?: Availability;
  examDate?: string;
  trainingPlan?: TrainingPlan;
  streak?: number;
  lastWorkoutDate?: string;
  avatarId?: string;
  achievements?: string[];
}

export interface Opposition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  scoringTable: string; // Key to the scoringCriteria in scoring.ts
}

export interface ScoreThreshold {
  value: number; // The raw value (seconds, reps, etc.)
  score: number; // The points awarded
}

export interface TestCriteria {
  testName: string;
  unit: TestDefinition['unit'];
  betterIs: 'lower' | 'higher';
  thresholds: {
    male: ScoreThreshold[];
    female: ScoreThreshold[];
  };
  minApto: {
    male: number;
    female: number;
  };
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  type: 'mark' | 'workout';
  workoutTitle?: string;
  exercises?: { name: string; target: string; completed: boolean }[];
  totalScore: number;
  scores: TestScore[];
  gender: Gender;
  rpe?: number;
  notes?: string;
}

export type TimeRange = '30d' | '3m' | '1y' | 'all';
