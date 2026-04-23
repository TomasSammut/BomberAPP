import React, { useState, useMemo, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, NotificationType, ImpactStyle } from '@capacitor/haptics';
import { exerciseLibrary } from '../data/exerciseLibrary';
import type { UserProfile } from '../types';

interface Workout {
  dayName: string;
  title: string;
  type?: 'rest' | 'athletics' | 'strength' | 'swimming' | 'active_recovery';
  warmup?: string[];
  exercises: {
    name: string;
    target: string;
    sets?: number;
    reps_or_time?: string;
    rest?: string;
    coach_tip?: string;
    completed: boolean;
  }[];
}

const initialWeeklyProgram: Record<number, Workout> = {
  0: { // Domingo
    dayName: 'Domingo',
    title: 'Descanso Activo / Movilidad',
    exercises: [
      { name: 'Caminata ligera', target: '30 min', completed: false },
      { name: 'Estiramientos estáticos', target: '15 min', completed: false },
      { name: 'Focalizar en recuperación y sueño', target: 'Recuperación', completed: false }
    ]
  },
  1: { // Lunes
    dayName: 'Lunes',
    title: 'Fuerza: Tren Superior',
    exercises: [
      { name: 'Press Banca', target: '4 x 10 reps (70% RM)', completed: false },
      { name: 'Dominadas', target: '4 x fallo técnico', completed: false },
      { name: 'Press Militar', target: '3 x 12 reps', completed: false },
      { name: 'Core: Plancha', target: '3 x 1 min', completed: false }
    ]
  },
  2: { // Martes
    dayName: 'Martes',
    title: 'Resistencia: Series de 1000m',
    exercises: [
      { name: 'Calentamiento: Trote suave', target: '15 min', completed: false },
      { name: 'Principal: 5 x 1000m @ 3:50', target: 'Rec 90s', completed: false },
      { name: 'Vuelta a la calma: Estiramientos', target: '10 min', completed: false }
    ]
  },
  3: { // Miércoles
    dayName: 'Miércoles',
    title: 'Técnica de Oposición (Fuerza)',
    exercises: [
      { name: 'Subida de Cuerda', target: '6 subidas explosivas', completed: false },
      { name: 'Press Banca', target: '4 x 10 reps', completed: false },
      { name: 'Torre', target: '3 subidas completas', completed: false }
    ]
  },
  4: { // Jueves
    dayName: 'Jueves',
    title: 'Natación: Específico',
    exercises: [
      { name: 'Calentamiento: Movilidad articular', target: '10 min', completed: false },
      { name: 'Natación: 50m Crol (Simulacro)', target: '4 series @ 100%', completed: false },
      { name: 'Técnica de virajes', target: '15 min', completed: false }
    ]
  },
  5: { // Viernes
    dayName: 'Viernes',
    title: 'Carrera Continua / HIIT',
    exercises: [
      { name: 'Carrera Continua (Zona 2)', target: '40 min', completed: false },
      { name: 'Sprints en cuesta', target: '10 x 50m', completed: false },
      { name: 'Core explosivo', target: '3 series', completed: false }
    ]
  },
  6: { // Sábado
    dayName: 'Sábado',
    title: 'Simulacro / Combinado',
    exercises: [
      { name: 'Simulacro Natación 50m', target: 'Paso 1', completed: false },
      { name: 'Simulacro Cuerda', target: 'Paso 2', completed: false },
      { name: 'Simulacro Carrera 3000m', target: 'Paso 3', completed: false }
    ]
  }
};

interface TrainingProps {
  history: any[];
  profile: UserProfile;
  onSaveWorkout: (title: string, rpe?: number, notes?: string, exercises?: any[]) => void;
  onStartDiagnostic: () => void;
}

const Training: React.FC<TrainingProps> = ({ history, profile, onSaveWorkout, onStartDiagnostic }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [activeTab, setActiveTab] = useState<'plan' | 'hist'>('plan');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [filterType, setFilterType] = useState<string>('all');
  const [showRpeModal, setShowRpeModal] = useState(false);
  const [rpe, setRpe] = useState<number>(7);
  const [notes, setNotes] = useState('');

  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const isPlanConfigured = !!profile.physicalData && !!profile.availability;

  const days = [
    { id: 1, label: 'L' },
    { id: 2, label: 'M' },
    { id: 3, label: 'X' },
    { id: 4, label: 'J' },
    { id: 5, label: 'V' },
    { id: 6, label: 'S' },
    { id: 0, label: 'D' },
  ];

  const currentWorkout = profile.trainingPlan?.weeklySchedule[selectedDay] || initialWeeklyProgram[selectedDay];

  const filteredHistory = useMemo(() => {
    // Filtrar para que en el historial SOLO aparezcan los entrenamientos realizados ('workout')
    let combined = history.filter(h => h.type === 'workout');

    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filterType === 'all') return combined;

    return combined.filter(session => {
      const title = (session.workoutTitle || '').toLowerCase();
      const exercises = (session.exercises || []).map((ex: any) => ex.name.toLowerCase());

      if (filterType === 'Carrera') {
        return title.includes('carrera') ||
               title.includes('3000m') ||
               title.includes('1000m') ||
               title.includes('60m') ||
               exercises.some((ex: string) => ex.includes('carrera') || ex.includes('3000m') || ex.includes('1000m') || ex.includes('60m'));
      }

      if (filterType === 'Natacion') {
        return title.includes('nataci') ||
               title.includes('piscina') ||
               exercises.some((ex: string) => ex.includes('nataci') || ex.includes('piscina') || ex.includes('crol'));
      }

      if (filterType === 'Fuerza') {
        return title.includes('fuerza') ||
               title.includes('press') ||
               title.includes('dominadas') ||
               title.includes('cuerda') ||
               exercises.some((ex: string) => ex.includes('press') || ex.includes('dominadas') || ex.includes('sentadilla') || ex.includes('cuerda'));
      }

      return title.includes(filterType.toLowerCase());
    });
  }, [history, filterType]);

  const handleCompleteWorkout = () => {
    setShowRpeModal(true);
  };

  const confirmCompleteWorkout = () => {
    onSaveWorkout(currentWorkout.title, rpe, notes, currentWorkout.exercises);
    setShowRpeModal(false);
    setActiveTab('hist');
    setNotes('');
    setRpe(7);
    Haptics.notification({ type: NotificationType.Success });
  };

  const getPhaseLabel = (phase?: string) => {
    switch(phase) {
      case 'base': return 'FASE DE BASE (ACUMULACIÓN)';
      case 'transformation': return 'FASE DE TRANSFORMACIÓN';
      case 'realization': return 'FASE DE REALIZACIÓN (PEAK)';
      case 'tapering': return 'TAPER (PUESTA A PUNTO)';
      default: return 'PLAN SEMANAL';
    }
  }

  return (
    <div className="page-content">
      <main className="main" style={{
        paddingTop: 'calc(20px + env(safe-area-inset-top))',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '120px'
      }}>
        {/* TÍTULO Y SELECTOR SEGÚN CROQUIS */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-0.5px' }}>Entrenamiento</h1>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              fontSize: '18px',
              fontWeight: '800'
            }}>
              <span
                onClick={() => setActiveTab('plan')}
                style={{
                  color: activeTab === 'plan' ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}>
                Plan
                {activeTab === 'plan' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    style={{
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'var(--primary)',
                      borderRadius: 2
                    }}
                  />
                )}
              </span>
              <span
                onClick={() => setActiveTab('hist')}
                style={{
                  color: activeTab === 'hist' ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}>
                Hist.
                {activeTab === 'hist' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    style={{
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'var(--primary)',
                      borderRadius: 2
                    }}
                  />
                )}
              </span>
            </div>
        </div>

        {activeTab === 'plan' ? (
          <div>
            {!isPlanConfigured ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '24px',
                border: '1px dashed rgba(255,255,255,0.1)',
                margin: '0 20px'
              }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎯</div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '10px' }}>Plan no configurado</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.5' }}>
                  Para generar un entrenamiento a medida basado en tus debilidades y disponibilidad, necesitamos conocerte mejor.
                </p>
                <button
                  onClick={onStartDiagnostic}
                  style={{
                    background: 'var(--primary)',
                    color: 'black',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px 25px',
                    fontSize: '14px',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  CONFIGURAR MI PLAN IA
                </button>
              </div>
            ) : (
              <>
                {/* CALENDARIO SEMANAL SEGÚN CROQUIS */}
                <div style={{ marginBottom: '25px', padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h2 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1px', margin: 0 }}>CALENDARIO SEMANAL</h2>
                      <button
                        onClick={onStartDiagnostic}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold' }}
                      >
                        RECONFIGURAR ⚙️
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {days.map(day => (
                        <div
                          key={day.id}
                          onClick={() => setSelectedDay(day.id)}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '900',
                            fontSize: '15px',
                            background: selectedDay === day.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                            color: selectedDay === day.id ? 'black' : 'white',
                            border: selectedDay === day.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}
                        >
                          {day.label}
                        </div>
                      ))}
                    </div>
                </div>

                {/* BLOQUE ENTRENAMIENTO DINÁMICO SEGÚN CROQUIS */}
                <section className="card" style={{
                    padding: '25px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    minHeight: '300px',
                    margin: '0 10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <h2 style={{ fontSize: '11px', color: 'var(--primary)', marginBottom: '5px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px' }}>
                            {getPhaseLabel(profile.trainingPlan?.phase)} - {currentWorkout.dayName}
                        </h2>
                        {profile.trainingPlan?.weeklyFocus && (
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: '10px' }}>
                            "{profile.trainingPlan.weeklyFocus}"
                          </p>
                        )}
                        <p style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: 0 }}>{currentWorkout.title}</p>
                      </div>
                      <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--primary)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '900' }}>{currentWorkout.exercises.length} EJERCICIOS</span>
                      </div>
                  </div>

                  {currentWorkout.warmup && currentWorkout.warmup.length > 0 && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '900', display: 'block', marginBottom: '8px' }}>🔥 CALENTAMIENTO</span>
                      {currentWorkout.warmup.map((w, idx) => (
                        <div key={idx} style={{ fontSize: '13px', color: 'white', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }} />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentWorkout.exercises.map((ex, i) => {
                      const libraryInfo = exerciseLibrary[ex.name];
                      return (
                        <div key={i}
                          onClick={() => setSelectedExercise(libraryInfo ? { ...libraryInfo, ...ex } : { ...ex })}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.03)',
                            cursor: 'pointer'
                          }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: 'white', display: 'block' }}>{ex.name}</span>
                                {ex.coach_tip && (
                                    <span style={{ fontSize: '12px' }} title={ex.coach_tip}>💡</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                              {ex.sets && <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '900' }}>{ex.sets} SERIES</span>}
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{ex.reps_or_time || ex.target}</span>
                            </div>
                          </div>
                          <div
                              onClick={(e) => {
                                  e.stopPropagation();
                                  // Local state update for visual feedback
                                  const updatedExercises = [...currentWorkout.exercises];
                                  updatedExercises[i] = { ...ex, completed: !ex.completed };
                                  // This update should ideally be synced to a local state in Training.tsx
                                  // For now, we simulate the toggle for the session
                                  ex.completed = !ex.completed;
                                  Haptics.impact({ style: ImpactStyle.Light });
                                  forceUpdate();
                              }}
                              style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '10px',
                                  border: ex.completed ? 'none' : '2px solid rgba(255,255,255,0.2)',
                                  background: ex.completed ? 'var(--primary)' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                              }}>
                              {ex.completed && <span style={{ color: 'black', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleCompleteWorkout}
                    style={{
                      width: '100%',
                      marginTop: '30px',
                      padding: '18px',
                      borderRadius: '16px',
                      background: 'var(--primary)',
                      border: 'none',
                      color: 'black',
                      fontWeight: '900',
                      fontSize: '15px',
                      boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)'
                    }}>
                    FINALIZAR ENTRENAMIENTO
                  </button>
                </section>
              </>
            )}

            <AnimatePresence>
              {selectedExercise && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.95)',
                  zIndex: 3000,
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    style={{
                      background: '#1A1A1A',
                      width: '100%',
                      maxWidth: '450px',
                      borderRadius: '32px',
                      padding: '30px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      position: 'relative'
                    }}>
                      <button
                        onClick={() => setSelectedExercise(null)}
                        style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: '20px' }}>✕</button>

                      <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        FICHA TÉCNICA - {selectedExercise.category || 'EJERCICIO'}
                      </span>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginTop: '5px', marginBottom: '5px' }}>{selectedExercise.name}</h2>
                      <p style={{ fontSize: '16px', color: 'var(--primary)', fontWeight: '800', marginBottom: '15px' }}>
                        {selectedExercise.sets ? `${selectedExercise.sets} SERIES x ` : ''}
                        {selectedExercise.reps_or_time || selectedExercise.target}
                      </p>

                      {selectedExercise.rest && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '20px' }}>
                          RECO: {selectedExercise.rest}
                        </p>
                      )}

                      {selectedExercise.coach_tip && (
                        <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(249, 115, 22, 0.05)', borderRadius: '16px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                          <h4 style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>COACH TIP</h4>
                          <p style={{ fontSize: '14px', color: 'white', fontStyle: 'italic', margin: 0 }}>
                            "{selectedExercise.coach_tip}"
                          </p>
                        </div>
                      )}

                      <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '900', marginBottom: '10px' }}>EJECUCIÓN</h4>
                        <p style={{ fontSize: '14px', color: 'white', lineHeight: '1.6', margin: 0 }}>
                          {selectedExercise.description || 'No hay descripción disponible para este ejercicio.'}
                        </p>
                      </div>

                      {selectedExercise.tips && (
                        <div style={{ marginBottom: '30px' }}>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '900', marginBottom: '10px' }}>CONSEJOS CLAVE</h4>
                          <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {selectedExercise.tips.map((tip: string, idx: number) => (
                              <li key={idx} style={{ fontSize: '13px', color: 'white', marginBottom: '8px', lineHeight: '1.4' }}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '15px' }}>
                        {selectedExercise.videoUrl && (
                          <a
                            href={selectedExercise.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              padding: '16px',
                              borderRadius: '16px',
                              background: 'rgba(255,255,255,0.05)',
                              color: 'white',
                              fontWeight: '900',
                              textAlign: 'center',
                              textDecoration: 'none',
                              fontSize: '14px',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                            VER VIDEO 📺
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedExercise(null)}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '16px',
                            background: 'var(--primary)',
                            border: 'none',
                            color: 'black',
                            fontWeight: '900',
                            fontSize: '14px'
                          }}>
                          ENTENDIDO
                        </button>
                      </div>
                   </motion.div>
                </div>
              )}

              {showRpeModal && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  padding: '20px'
                }}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                      background: '#1A1A1A',
                      width: '100%',
                      maxWidth: '400px',
                      borderRadius: '32px',
                      padding: '30px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '10px', textAlign: 'center' }}>¿Cómo ha ido?</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '30px' }}>
                      Tu feedback ayuda a la IA a ajustar la carga de la próxima semana.
                    </p>

                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>ESFUERZO (RPE)</span>
                        <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)' }}>{rpe}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={rpe}
                        onChange={(e) => setRpe(parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          accentColor: 'var(--primary)',
                          height: '6px',
                          borderRadius: '3px'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>
                        <span>SUAVE</span>
                        <span>MODERADO</span>
                        <span>MÁXIMO</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>NOTAS (OPCIONAL)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Molestias, sensaciones, pesos usados..."
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '15px',
                          color: 'white',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          minHeight: '80px',
                          resize: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button
                        onClick={() => setShowRpeModal(false)}
                        style={{
                          flex: 1,
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          color: 'white',
                          fontWeight: '800',
                          fontSize: '14px'
                        }}>
                        CANCELAR
                      </button>
                      <button
                        onClick={confirmCompleteWorkout}
                        style={{
                          flex: 1,
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'var(--primary)',
                          border: 'none',
                          color: 'black',
                          fontWeight: '900',
                          fontSize: '14px'
                        }}>
                        GUARDAR
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div>
            {/* HISTORIAL CON BOTONES Y FILTRO SEGÚN CROQUIS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '13px', margin: 0, fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>ÚLTIMOS ENTRENAMIENTOS</h2>
            </div>

            {/* Filtros */}
            <div className="test-selector-scroll" style={{ marginBottom: '10px' }}>
              {['all', 'Carrera', 'Natacion', 'Fuerza'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={filterType === f ? 'active' : ''}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Lista de Actividades */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredHistory.map((session, i) => (
                <div key={i} style={{
                  background: 'var(--card-bg)',
                  padding: '18px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '45px',
                        height: '45px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                    }}>
                        {session.workoutTitle?.toLowerCase().includes('carrera') ? '🏃' :
                         session.workoutTitle?.toLowerCase().includes('fuerza') ? '💪' : '📋'}
                    </div>
                    <div>
                        <span style={{ fontSize: '15px', fontWeight: '800', display: 'block', color: 'white' }}>
                            {session.workoutTitle || 'Entrenamiento'}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                {new Date(session.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </span>
                            {session.rpe && (
                                <span style={{ fontSize: '10px', color: 'var(--primary)', background: 'rgba(249, 115, 22, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>
                                    RPE {session.rpe}
                                </span>
                            )}
                        </div>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelectedSession(session)}
                    style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', cursor: 'pointer' }}>
                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '900' }}>VER ➔</span>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {selectedSession && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  zIndex: 2000,
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                      <button onClick={() => setSelectedSession(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px' }}>✕</button>
                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'white', margin: 0 }}>DETALLE</h3>
                      <div style={{ width: '24px' }}></div>
                   </div>

                   <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase' }}>
                        {new Date(selectedSession.timestamp).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                      <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginTop: '5px', marginBottom: '20px' }}>{selectedSession.workoutTitle}</h2>

                      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>ESFUERZO</span>
                            <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>{selectedSession.rpe || '-'}/10</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px', flex: 1, textAlign: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold' }}>ESTADO</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', color: 'white' }}>COMPLETADO</span>
                        </div>
                      </div>

                      {selectedSession.notes && (
                        <div style={{ marginBottom: '25px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>NOTAS</span>
                            <p style={{ fontSize: '14px', color: 'white', lineHeight: '1.5', margin: 0, fontStyle: 'italic' }}>
                                "{selectedSession.notes}"
                            </p>
                        </div>
                      )}

                      {selectedSession.exercises && (
                        <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>EJERCICIOS</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {selectedSession.exercises.map((ex: any, idx: number) => (
                                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'white', display: 'block' }}>{ex.name}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.target}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                      )}
                   </div>

                   <button
                    onClick={() => setSelectedSession(null)}
                    style={{
                        marginTop: 'auto',
                        width: '100%',
                        padding: '18px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '900'
                    }}>
                    CERRAR
                   </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Training;
