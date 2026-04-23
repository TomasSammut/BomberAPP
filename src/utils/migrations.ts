import type { UserProfile } from '../types';

export interface MigrationResult {
  profile: UserProfile;
  version: number;
}

const CURRENT_MIGRATION_VERSION = 1;

export const migrateProfile = (savedProfileJson: string): MigrationResult => {
  try {
    const parsed = JSON.parse(savedProfileJson);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid profile format');
    }

    let profile = { ...parsed };

    if (!profile._migrationVersion || profile._migrationVersion < 1) {
      profile = migrateToV1(profile);
    }

    profile._migrationVersion = CURRENT_MIGRATION_VERSION;
    return { profile, version: CURRENT_MIGRATION_VERSION };
  } catch (err) {
    console.error('Error during profile migration:', err);
    throw err;
  }
};

const migrateToV1 = (profile: any): UserProfile => {
  const migratedBestMarks: Record<string, any> = {};

  if (profile.bestMarks) {
    Object.keys(profile.bestMarks).forEach(key => {
      const val = profile.bestMarks[key];
      if (typeof val === 'string') {
        migratedBestMarks[key] = { value: val, timestamp: Date.now() };
      } else {
        migratedBestMarks[key] = val;
      }
    });
  }

  return {
    ...profile,
    bestMarks: migratedBestMarks,
    targets: profile.targets || {}
  };
};
