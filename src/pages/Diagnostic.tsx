import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, UserPhysicalData, Availability, TestScore, SessionRecord } from '../types';
import { generateTrainingPlan } from '../services/aiService';

interface DiagnosticProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onComplete: () => void;
  currentStats: TestScore[];
  history: SessionRecord[];
}

const Diagnostic: React.FC<DiagnosticProps> = ({ profile, onUpdateProfile, onComplete, currentStats, history }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('gemini_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [physicalData, setPhysicalData] = useState<UserPhysicalData>(profile.physicalData || {
    weight: 75,
    height: 175,
    birthDate: '1995-01-01',
    injuries: ''
  });

  const [availability, setAvailability] = useState<Availability>({
    daysPerWeek: profile.availability?.daysPerWeek || 5,
    specificDays: profile.availability?.specificDays || [1, 2, 3, 4, 5],
    hasPool: profile.availability?.hasPool ?? true,
    hasTrack: profile.availability?.hasTrack ?? true,
    hasTower: profile.availability?.hasTower ?? true,
    workShift: profile.availability?.workShift || 'morning'
  });

  const daysOfWeek = [
    { id: 1, name: 'Lun' },
    { id: 2, name: 'Mar' },
    { id: 3, name: 'Mié' },
    { id: 4, name: 'Jue' },
    { id: 5, name: 'Vie' },
    { id: 6, name: 'Sáb' },
    { id: 0, name: 'Dom' },
  ];

  const toggleDay = (dayId: number) => {
    const newDays = availability.specificDays.includes(dayId)
      ? availability.specificDays.filter(d => d !== dayId)
      : [...availability.specificDays, dayId].sort();

    setAvailability({
      ...availability,
      specificDays: newDays,
      daysPerWeek: newDays.length
    });
  };

  const [examDate, setExamDate] = useState(profile.examDate || '');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setIsGenerating(true);
    setError(null);
    if (apiKey) sessionStorage.setItem('gemini_api_key', apiKey);

    try {
      const updatedProfile = {
        ...profile,
        physicalData,
        availability,
        examDate
      };

      const plan = await generateTrainingPlan(apiKey, updatedProfile, currentStats, history);

      onUpdateProfile({
        ...updatedProfile,
        trainingPlan: {
          ...plan,
          generatedAt: Date.now()
        }
      });
      onComplete();
    } catch (err: any) {
      setError(`Error: ${err.message || 'No se pudo generar el plan. Revisa tu conexión.'}`);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '20px' }}>
        <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ marginTop: '20px' }}>Generando tu Plan Maestro...</h2>
        <p style={{ color: 'var(--text-muted)' }}>Analizando tus debilidades y disponibilidad con Google Gemini.</p>
      </div>
    );
  }

  return (
    <div className="page-content diagnostic-page" style={{ padding: '20px', color: 'white' }}>
      {showApiKeyInput && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '16px', border: '1px solid var(--primary)', width: '100%' }}>
            <h3 style={{ marginTop: 0 }}>API Key Requerida</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Para usar la IA personalizada necesitas una clave de Google Gemini (es gratuita).</p>
            <input
              type="password"
              placeholder="Introduce tu API Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={inputStyle}
            />
            <button onClick={() => setShowApiKeyInput(false)} style={primaryButtonStyle}>Confirmar</button>
          </div>
        </div>
      )}
      <header style={{ textAlign: 'center', marginBottom: '30px', paddingTop: 'env(safe-area-inset-top)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>Simulacro de Diagnóstico</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Paso {step} de 3</p>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Datos Físicos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Sexo</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => onUpdateProfile({ gender: 'male' })}
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: 0,
                      background: profile.gender === 'male' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: profile.gender === 'male' ? 'black' : 'white',
                      border: profile.gender === 'male' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    Hombre
                  </button>
                  <button
                    onClick={() => onUpdateProfile({ gender: 'female' })}
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: 0,
                      background: profile.gender === 'female' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: profile.gender === 'female' ? 'black' : 'white',
                      border: profile.gender === 'female' ? 'none' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    Mujer
                  </button>
                </div>
              </label>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Peso (kg)</span>
                <input
                  type="number"
                  value={physicalData.weight}
                  onChange={e => setPhysicalData({...physicalData, weight: Number(e.target.value)})}
                  style={inputStyle}
                />
              </label>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Altura (cm)</span>
                <input
                  type="number"
                  value={physicalData.height}
                  onChange={e => setPhysicalData({...physicalData, height: Number(e.target.value)})}
                  style={inputStyle}
                />
              </label>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Fecha de Nacimiento</span>
                <input
                  type="date"
                  value={physicalData.birthDate}
                  onChange={e => setPhysicalData({...physicalData, birthDate: e.target.value})}
                  style={inputStyle}
                />
              </label>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Lesiones actuales o molestias</span>
                <textarea
                  value={physicalData.injuries}
                  onChange={e => setPhysicalData({...physicalData, injuries: e.target.value})}
                  placeholder="Ej: Molestia leve hombro derecho..."
                  style={{ ...inputStyle, height: '80px', resize: 'none' }}
                />
              </label>
            </div>
            <button onClick={nextStep} style={primaryButtonStyle}>Siguiente</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Disponibilidad y Recursos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Selecciona tus días de entreno</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px', marginTop: '10px' }}>
                  {daysOfWeek.map(day => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: availability.specificDays.includes(day.id) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: availability.specificDays.includes(day.id) ? 'black' : 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '10px', fontSize: '14px', color: 'var(--primary)' }}>
                  {availability.daysPerWeek} días a la semana
                </div>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Acceso a instalaciones:</span>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={availability.hasPool} onChange={e => setAvailability({...availability, hasPool: e.target.checked})} />
                  Piscina
                </label>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={availability.hasTrack} onChange={e => setAvailability({...availability, hasTrack: e.target.checked})} />
                  Pista de atletismo
                </label>
                <label style={checkboxLabelStyle}>
                  <input type="checkbox" checked={availability.hasTower} onChange={e => setAvailability({...availability, hasTower: e.target.checked})} />
                  Torre / Maniobras
                </label>
              </div>

              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Turno laboral</span>
                <select
                  value={availability.workShift}
                  onChange={e => setAvailability({...availability, workShift: e.target.value as any})}
                  style={inputStyle}
                >
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                  <option value="night">Noche</option>
                  <option value="rotative">Rotativo / 24h</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button onClick={prevStep} style={secondaryButtonStyle}>Atrás</button>
              <button onClick={nextStep} style={primaryButtonStyle}>Siguiente</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Objetivo Temporal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <label>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Fecha estimada del examen</span>
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '10px' }}>
                  * Si no la conoces, pon una fecha aproximada para calcular los bloques de entrenamiento.
                </p>
              </label>

              <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid var(--primary)', marginTop: '20px' }}>
                <p style={{ fontSize: '13px', margin: 0, color: 'white', lineHeight: '1.4' }}>
                  <strong>Nota:</strong> Tu punto de partida se basa en las marcas que ya tienes registradas en la calculadora.
                  Si quieres un plan más preciso, asegúrate de haber subido tus marcas actuales.
                </p>
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button onClick={prevStep} style={secondaryButtonStyle}>Atrás</button>
              <button onClick={handleFinish} style={primaryButtonStyle}>Generar Plan Maestro</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: 'white',
  padding: '12px',
  fontSize: '16px',
  outline: 'none'
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--primary)',
  color: 'black',
  border: 'none',
  borderRadius: '12px',
  padding: '15px',
  fontSize: '16px',
  fontWeight: '900',
  marginTop: '30px',
  cursor: 'pointer'
};

const secondaryButtonStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '15px',
  fontSize: '16px',
  fontWeight: '900',
  marginTop: '30px',
  cursor: 'pointer'
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  background: 'rgba(255,255,255,0.03)',
  padding: '10px',
  borderRadius: '8px'
};

export default Diagnostic;
