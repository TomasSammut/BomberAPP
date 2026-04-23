import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import './App.css';
import { calculateScore, tests, oppositions, allScoringCriteria, parseValue } from './scoring';
import type { TestScore, UserProfile, SessionRecord } from './types';
import { migrateProfile } from './utils/migrations';
import { STORAGE_KEYS } from './constants'; // Used in Preferences.set calls

// Import Pages
import Home from './pages/Home';
import CalculatorPage from './pages/Calculator';
import Progress from './pages/Progress';
import Training from './pages/Training';
import Advice from './pages/Advice';
import Diagnostic from './pages/Diagnostic';

import { motion, AnimatePresence } from 'framer-motion';

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    style={{ height: '100%', width: '100%' }}
  >
    {children}
  </motion.div>
);

const AppContent: React.FC<{
  profile: UserProfile;
  big6Stats: TestScore[];
  history: SessionRecord[];
  onUpdateProfile: (u: Partial<UserProfile>) => void;
  onSaveSession: (type: 'mark' | 'workout', timestamp?: number, specificScores?: TestScore[], title?: string, rpe?: number, notes?: string, exercises?: any[]) => Promise<string>;
  onUpdateStreak: (p: UserProfile) => void;
  onResetData: () => void;
}> = ({
  profile, big6Stats, history,
  onUpdateProfile, onSaveSession, onUpdateStreak, onResetData
}) => {
  const location = useLocation();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const activeOpposition = useMemo(() =>
    oppositions.find(o => o.id === profile.activeOppositionId) || oppositions[0]
  , [profile.activeOppositionId]);

  if (showDiagnostic) {
    return <Diagnostic
      profile={profile}
      onUpdateProfile={onUpdateProfile}
      onComplete={() => setShowDiagnostic(false)}
      currentStats={big6Stats}
      history={history}
    />;
  }

  return (
    <div className="app">
      <div className="page-container">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: 'env(safe-area-inset-top, 20px)',
                left: '20px',
                right: '20px',
                zIndex: 100000,
                background: notification.type === 'error' ? 'var(--error)' : 'var(--primary)',
                color: 'black',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '13px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                textTransform: 'uppercase'
              }}
            >
              {notification.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition>
                <Home
                  stats={big6Stats}
                  profile={profile}
                  opposition={activeOpposition}
                  onUpdateProfile={onUpdateProfile}
                  onResetData={onResetData}
                  history={history}
                />
              </PageTransition>
            } />
            <Route path="/calculator" element={
              <PageTransition>
                <CalculatorPage
                  profile={profile}
                  history={history}
                  onSaveSession={async (ts, scores) => {
                    const action = await onSaveSession('mark', ts, scores);
                    if (action === 'created') setNotification({ msg: 'Nueva marca registrada', type: 'success' });
                    if (action === 'updated') setNotification({ msg: 'Marca actualizada correctamente', type: 'success' });
                    if (action === 'deleted') setNotification({ msg: 'Marca eliminada', type: 'info' });
                  }}
                />
              </PageTransition>
            } />
            <Route path="/progress" element={
              <PageTransition>
                <Progress
                  history={history}
                  profile={profile}
                  currentStats={big6Stats}
                  onDeleteRecord={(recordId, testName) => {
                    const record = history.find(h => h.id === recordId);
                    if (record && window.confirm(`¿Eliminar marca de ${testName}?`)) {
                      onSaveSession('mark', record.timestamp, [{ name: testName, value: '', score: 0 }]);
                    }
                  }}
                  onUpdateRecord={(id, testName, newValue) => {
                    const record = history.find(h => h.id === id);
                    if (record) {
                      const scoreObj = calculateScore(testName, newValue, profile.gender, profile.activeOppositionId);
                      onSaveSession('mark', record.timestamp, [scoreObj]);
                    }
                  }}
                />
              </PageTransition>
            } />
            <Route path="/training" element={
              <PageTransition>
                <Training
                  history={history}
                  profile={profile}
                  onSaveWorkout={(title, rpe, notes, exercises) => {
                    onSaveSession('workout', Date.now(), [], title, rpe, notes, exercises);
                    onUpdateStreak(profile);
                  }}
                  onStartDiagnostic={() => setShowDiagnostic(true)}
                />
              </PageTransition>
            } />
            <Route path="/advice" element={
              <PageTransition>
                <Advice />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </div>

      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} aria-label="Inicio">
          <span className="nav-icon">🏠</span>
        </NavLink>
        <NavLink to="/calculator" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} aria-label="Calculadora">
          <span className="nav-icon">🧮</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} aria-label="Progreso">
          <span className="nav-icon">📈</span>
        </NavLink>
        <NavLink to="/training" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} aria-label="Entrenar">
          <span className="nav-icon">🏋️‍♂️</span>
        </NavLink>
        <NavLink to="/advice" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} aria-label="Consejos">
          <span className="nav-icon">💡</span>
        </NavLink>
      </nav>
    </div>
  );
};

import confetti from 'canvas-confetti';

import { achievements } from './data/achievements';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Aspirante',
    gender: 'male',
    activeOppositionId: 'consorcio_vlc',
    bestMarks: {},
    targets: {},
    streak: 0,
    achievements: [],
    avatarId: '1'
  });
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleUpdateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      try {
        JSON.stringify(updated);
        Preferences.set({
          key: STORAGE_KEYS.PROFILE,
          value: JSON.stringify(updated),
        }).catch(err => console.error('Error saving profile:', err));
      } catch (err) {
        console.error('Error serializing profile:', err);
      }
      return updated;
    });
  }, []);

  const updateStreak = useCallback((currentProfile: UserProfile) => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = currentProfile.lastWorkoutDate;

    if (lastDate === today) return; // Ya actualizado hoy

    let newStreak = currentProfile.streak || 0;

    if (lastDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // Racha rota, empezamos de nuevo
      }
    } else {
      newStreak = 1; // Primera vez
    }

    handleUpdateProfile({
      streak: newStreak,
      lastWorkoutDate: today
    });

    if (newStreak > 0 && newStreak % 5 === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ffffff']
      });
    }
  }, [handleUpdateProfile]);

  // Derived state: latest inputs and current stats from history
  const inputs = useMemo(() => {
    const latest: Record<string, string> = {};
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

    tests.forEach(test => {
      const record = sortedHistory.find(s =>
        s.scores.some(ts => ts.name === test.name && ts.value && ts.value.trim() !== '')
      );
      if (record) {
        const scoreObj = record.scores.find(ts => ts.name === test.name);
        if (scoreObj) {
          latest[test.name] = scoreObj.value;
        }
      }
    });
    return latest;
  }, [history]);

  const big6Stats = useMemo(() => {
    return tests.map((test) =>
      calculateScore(test.name, inputs[test.name] || '', profile.gender, profile.activeOppositionId)
    );
  }, [inputs, profile.gender, profile.activeOppositionId]);

  const checkAchievements = useCallback((currentStats: TestScore[], currentHistory: SessionRecord[], currentProfile: UserProfile) => {
    const unlockedIds = currentProfile.achievements || [];
    const newUnlocks = achievements.filter(a => !unlockedIds.includes(a.id) && a.condition(currentStats, currentHistory, currentProfile));

    if (newUnlocks.length > 0) {
      const updatedIds = [...unlockedIds, ...newUnlocks.map(a => a.id)];
      handleUpdateProfile({ achievements: updatedIds });

      newUnlocks.forEach((_, index) => {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#FFD700', '#FFA500']
          });
          // Podríamos añadir una notificación UI aquí
        }, index * 1000);
      });
    }
  }, [handleUpdateProfile]);

  useEffect(() => {
    if (!isLoading) {
      checkAchievements(big6Stats, history, profile);
    }
  }, [big6Stats, history, profile.streak, isLoading]);

  // Derived state: best marks recalculation from history
  const bestMarks = useMemo(() => {
    const bests: Record<string, { value: string; timestamp: number }> = {};
    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp); // Chronological order to find the FIRST best

    tests.forEach(test => {
      let currentBestValue: number | null = null;
      let currentBestStr: string = "";
      let currentBestTime: number = 0;

      const oppId = profile.activeOppositionId || 'consorcio_vlc';
      const opp = oppositions.find(o => o.id === oppId) || oppositions[0];
      const criteria = allScoringCriteria[opp.scoringTable][test.name];

      if (!criteria) return;

      sortedHistory.forEach(record => {
        const scoreObj = record.scores.find(ts => ts.name === test.name);
        if (scoreObj && scoreObj.value) {
          const val = parseValue(scoreObj.value, criteria.unit);
          if (isNaN(val)) return;

          if (currentBestValue === null) {
            currentBestValue = val;
            currentBestStr = scoreObj.value;
            currentBestTime = record.timestamp;
          } else {
            const isBetter = criteria.betterIs === 'lower' ? val < currentBestValue : val > currentBestValue;
            if (isBetter) {
              currentBestValue = val;
              currentBestStr = scoreObj.value;
              currentBestTime = record.timestamp;
            }
          }
        }
      });

      if (currentBestStr) {
        bests[test.name] = { value: currentBestStr, timestamp: currentBestTime };
      }
    });
    return bests;
  }, [history, profile.activeOppositionId]);

  // PB Confetti Logic
  const prevBestMarks = React.useRef<Record<string, string>>({});
  useEffect(() => {
    if (isLoading) return;

    let brokePB = false;
    Object.keys(bestMarks).forEach(key => {
      const currentVal = bestMarks[key].value;
      const prevVal = prevBestMarks.current[key];

      if (currentVal && prevVal && currentVal !== prevVal) {
        const criteria = allScoringCriteria[profile.activeOppositionId]?.[key];
        if (criteria) {
          const curNum = parseValue(currentVal, criteria.unit);
          const prevNum = parseValue(prevVal, criteria.unit);
          const isBetter = criteria.betterIs === 'lower' ? curNum < prevNum : curNum > prevNum;
          if (isBetter) brokePB = true;
        }
      }
      prevBestMarks.current[key] = currentVal;
    });

    if (brokePB) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ffffff', '#fb923c']
      });
      Haptics.impact({ style: ImpactStyle.Heavy });
    }
  }, [bestMarks, isLoading, profile.activeOppositionId]);


  // Load data from Preferences on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { value: savedProfile } = await Preferences.get({ key: STORAGE_KEYS.PROFILE });
        const { value: savedHistory } = await Preferences.get({ key: STORAGE_KEYS.HISTORY });
        const { value: savedInputs } = await Preferences.get({ key: 'bomberapp_inputs' });

        let loadedHistory: SessionRecord[] = [];
        if (savedHistory) {
          try {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed)) loadedHistory = parsed;
          } catch (e) { console.error("Error parsing history", e); }
        }

        // Migración: Si no hay historial pero sí había inputs guardados de la versión anterior
        if (loadedHistory.length === 0 && savedInputs) {
          try {
            const inputsObj = JSON.parse(savedInputs);
            const initialScores = tests.map(t =>
              calculateScore(t.name, inputsObj[t.name] || '', 'male', 'consorcio_vlc')
            ).filter(s => s.value);

            if (initialScores.length > 0) {
              const migrationRecord: SessionRecord = {
                id: 'migration_' + Date.now(),
                timestamp: Date.now() - 1000,
                type: 'mark',
                totalScore: initialScores.reduce((acc, s) => acc + s.score, 0),
                scores: initialScores,
                gender: 'male'
              };
              loadedHistory = [migrationRecord];
            }
          } catch (e) { console.error("Error in inputs migration", e); }
        }
        setHistory(loadedHistory);

        if (savedProfile) {
          try {
            const { profile: migratedProfile } = migrateProfile(savedProfile);
            setProfile(prev => ({
              ...prev,
              ...migratedProfile
            }));
          } catch (e) { console.error("Error migrating profile", e); }
        }
      } catch (err) {
        console.error("Critical error loading data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const recalculateTotalScores = (updatedHistory: SessionRecord[]): SessionRecord[] => {
    let processed = [...updatedHistory].sort((a, b) => a.timestamp - b.timestamp);
    const latestKnownScores: Record<string, number> = {};

    return processed.map(record => {
      if (record.type === 'mark') {
        record.scores.forEach(s => {
          latestKnownScores[s.name] = s.score;
        });
      }
      const currentTotal = tests.reduce((sum, t) => sum + (latestKnownScores[t.name] || 0), 0);
      return { ...record, totalScore: currentTotal };
    }).sort((a, b) => b.timestamp - a.timestamp).slice(0, 500);
  };

  const saveMark = useCallback(async (timestamp: number, specificScores: TestScore[]): Promise<'created' | 'updated' | 'deleted' | 'none'> => {
    const testName = specificScores.length > 0 ? specificScores[0].name : null;
    let actionResult: 'created' | 'updated' | 'deleted' | 'none' = 'none';

    setHistory(prevHistory => {
      const updatedHistory = [...prevHistory];
      const dateStr = new Date(timestamp).toDateString();
      const existingIdx = updatedHistory.findIndex(h =>
        h.type === 'mark' &&
        new Date(h.timestamp).toDateString() === dateStr
      );

      const activeScores = specificScores.filter(s => s.value && s.value.trim() !== '');

      if (activeScores.length > 0) {
        if (existingIdx > -1) {
          const record = { ...updatedHistory[existingIdx] };
          const newScores = [...record.scores];
          activeScores.forEach(aS => {
            const sIdx = newScores.findIndex(s => s.name === aS.name);
            if (sIdx > -1) newScores[sIdx] = aS;
            else newScores.push(aS);
          });
          record.scores = newScores;
          updatedHistory[existingIdx] = record;
          actionResult = 'updated';
        } else {
          const newRecord: SessionRecord = {
            id: timestamp.toString() + (testName ? `_${testName}` : ''),
            timestamp,
            type: 'mark',
            totalScore: 0,
            scores: activeScores,
            gender: profile.gender
          };
          updatedHistory.push(newRecord);
          actionResult = 'created';
        }
      } else if (existingIdx > -1) {
        const record = { ...updatedHistory[existingIdx] };
        if (testName) {
          record.scores = record.scores.filter(s => s.name !== testName);
          if (record.scores.length === 0) {
            updatedHistory.splice(existingIdx, 1);
          } else {
            updatedHistory[existingIdx] = record;
          }
        } else {
          updatedHistory.splice(existingIdx, 1);
        }
        actionResult = 'deleted';
      }

      if (actionResult !== 'none') {
        Haptics.notification({ type: actionResult === 'deleted' ? NotificationType.Warning : NotificationType.Success });
      }

      const finalHistory = recalculateTotalScores(updatedHistory);
      try {
        Preferences.set({ key: STORAGE_KEYS.HISTORY, value: JSON.stringify(finalHistory) }).catch(err => console.error('Error saving history:', err));
      } catch (err) {
        console.error('Error serializing history:', err);
      }
      return finalHistory;
    });

    return actionResult;
  }, [profile.gender]);

  const saveWorkout = useCallback(async (timestamp: number, title: string, rpe?: number, notes?: string, exercises?: any[]): Promise<'created' | 'updated' | 'deleted' | 'none'> => {
    setHistory(prevHistory => {
      const updatedHistory = [...prevHistory];
      const newRecord: SessionRecord = {
        id: timestamp.toString(),
        timestamp,
        type: 'workout',
        workoutTitle: title,
        exercises,
        totalScore: 0,
        scores: [],
        gender: profile.gender,
        rpe,
        notes
      };
      updatedHistory.push(newRecord);
      Haptics.notification({ type: NotificationType.Success });

      const finalHistory = recalculateTotalScores(updatedHistory);
      try {
        Preferences.set({ key: STORAGE_KEYS.HISTORY, value: JSON.stringify(finalHistory) }).catch(err => console.error('Error saving history:', err));
      } catch (err) {
        console.error('Error serializing history:', err);
      }
      return finalHistory;
    });

    return 'created';
  }, [profile.gender]);

  const handleSaveSession = useCallback(async (type: 'mark' | 'workout', timestamp?: number, specificScores?: TestScore[], title?: string, rpe?: number, notes?: string, exercises?: any[]): Promise<'created' | 'updated' | 'deleted' | 'none'> => {
    const logTime = timestamp || Date.now();
    if (type === 'mark') {
      return saveMark(logTime, specificScores || []);
    } else {
      return saveWorkout(logTime, title || '', rpe, notes, exercises);
    }
  }, [saveMark, saveWorkout]);

  const handleResetData = useCallback(async () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos tus datos? Esta acción es irreversible.')) {
      await Preferences.clear();
      window.location.reload();
    }
  }, []);


  if (isLoading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    <Router>
      <AppContent
        profile={{ ...profile, bestMarks }}
        big6Stats={big6Stats}
        history={history}
        onUpdateProfile={handleUpdateProfile}
        onSaveSession={handleSaveSession}
        onUpdateStreak={updateStreak}
        onResetData={handleResetData}
      />
    </Router>
  );
};

export default App;
