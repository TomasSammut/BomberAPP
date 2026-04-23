import React, { useState, useMemo, useEffect } from 'react';
import { calculateScore, tests } from '../scoring';
import type { UserProfile, TestScore, SessionRecord } from '../types';

interface CalculatorProps {
  profile: UserProfile;
  history: SessionRecord[];
  onSaveSession: (timestamp?: number, specificScores?: TestScore[]) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ profile, history, onSaveSession }) => {
  const [editingTest, setEditingTest] = useState<string | null>(null);
  const [localInputValue, setLocalInputValue] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inputError, setInputError] = useState<string>('');

  // Obtener las marcas más recientes (Globales)
  const latestMarks = useMemo(() => {
    const latest: Record<string, string> = {};
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

    tests.forEach(test => {
      const record = sortedHistory.find(s =>
        s.type === 'mark' && s.scores.some(ts => ts.name === test.name && ts.value && ts.value.trim() !== '')
      );
      if (record) {
        const scoreObj = record.scores.find(ts => ts.name === test.name);
        if (scoreObj) latest[test.name] = scoreObj.value;
      }
    });
    return latest;
  }, [history]);

  // Obtener las marcas de la fecha seleccionada (Editor)
  const dayInputs = useMemo(() => {
    const dayRecord = history.find(h =>
      h.type === 'mark' &&
      new Date(h.timestamp).toISOString().split('T')[0] === selectedDate
    );
    const inputs: Record<string, string> = {};
    if (dayRecord) {
      dayRecord.scores.forEach(s => {
        inputs[s.name] = s.value;
      });
    }
    return inputs;
  }, [history, selectedDate]);

  // Actualizar el input local cuando cambie la fecha o el test seleccionado
  useEffect(() => {
    if (editingTest) {
      setLocalInputValue(dayInputs[editingTest] || '');
    }
  }, [selectedDate, editingTest, dayInputs]);

  const validateInput = (testName: string, value: string): string => {
    if (value.trim() === '') return '';
    const test = tests.find(t => t.name === testName);
    if (!test) return 'Test not found';

    if (test.unit === 'reps') {
      if (!/^\d+$/.test(value)) return 'Must be a whole number';
      const num = parseInt(value, 10);
      if (num < 0 || num > 200) return 'Value between 0-200';
    } else if (test.unit === 'seconds' || test.unit === 'time') {
      if (!/^(\d+:)?\d{1,2}$/.test(value)) return 'Format: MM:SS or SS';
    } else if (test.unit === 'meters') {
      if (!/^\d+$/.test(value)) return 'Must be a whole number';
      const num = parseInt(value, 10);
      if (num < 0 || num > 5000) return 'Value between 0-5000';
    } else if (test.unit === 'towerTime') {
      if (!/^(\d+:)?\d{1,2}$/.test(value)) return 'Format: MM:SS or SS';
    }
    return '';
  };

  const handleSave = (testName: string) => {
    const trimmedValue = localInputValue.trim();
    const error = validateInput(testName, trimmedValue);

    if (error) {
      setInputError(error);
      return;
    }

    setInputError('');
    const scoreObj = trimmedValue === ''
      ? { name: testName, value: '', score: 0 }
      : calculateScore(
          testName,
          trimmedValue,
          profile.gender,
          profile.activeOppositionId
        );

    const [y, m, d] = selectedDate.split('-').map(Number);
    const timestamp = new Date(y, m - 1, d, 12, 0, 0).getTime();

    onSaveSession(timestamp, [scoreObj as TestScore]);
    setEditingTest(null);
    setLocalInputValue('');
  };

  // Puntuación Total GLOBAL (Basada en marcas más recientes)
  const globalTotalPoints = useMemo(() => {
    return tests.reduce((acc, t) => {
      const val = latestMarks[t.name] || '';
      return acc + calculateScore(t.name, val, profile.gender, profile.activeOppositionId).score;
    }, 0);
  }, [latestMarks, profile.gender, profile.activeOppositionId]);

  return (
    <div className="calculator-page">
      <main className="main" style={{ paddingTop: 'calc(10px + env(safe-area-inset-top))' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '900' }}>
            Puntuación Global ({profile.gender === 'male' ? 'H' : 'M'})
          </span>
          <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', letterSpacing: '-1px' }}>
            {globalTotalPoints.toFixed(1)} <span style={{ fontSize: '16px', color: 'var(--primary)', opacity: 0.8 }}>/ 60</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-5px', fontWeight: '700' }}>
            ESTADO ACTUAL SEGÚN ÚLTIMAS MARCAS
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '0 5px 120px'
        }}>
          {tests.map((test) => {
            const bestMarks = profile.bestMarks || {};
            const bestValue = bestMarks[test.name]?.value || "—";
            const latestValue = latestMarks[test.name] || "—";
            const isEditing = editingTest === test.name;
            const currentDayVal = dayInputs[test.name] || '';

            return (
              <div
                key={test.name}
                onClick={() => {
                  if (!isEditing) {
                    setEditingTest(test.name);
                    setLocalInputValue(currentDayVal);
                  }
                }}
                style={{
                  background: isEditing ? 'rgba(255,255,255,0.08)' : 'var(--card-bg)',
                  borderRadius: '20px',
                  padding: '16px',
                  border: isEditing ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  boxShadow: isEditing ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
                  zIndex: isEditing ? 10 : 1
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {test.name}
                </div>

                {isEditing ? (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '10px' }}>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'var(--primary)',
                        fontSize: '11px',
                        fontWeight: '900',
                        padding: '6px',
                        marginBottom: '8px',
                        textAlign: 'center',
                        textTransform: 'uppercase'
                      }}
                    />
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '4px', fontWeight: 'bold' }}>
                      VALOR PARA ESTA FECHA: {currentDayVal || '(VACÍO)'}
                    </div>
                    <input
                      type="text"
                      autoFocus
                      value={localInputValue}
                      onChange={(e) => {
                        setLocalInputValue(e.target.value);
                        setInputError('');
                      }}
                      placeholder=""
                      style={{
                        width: '100%',
                        background: inputError ? '#ffebee' : 'white',
                        border: inputError ? '2px solid var(--error)' : 'none',
                        borderRadius: '8px',
                        color: 'black',
                        fontSize: '20px',
                        fontWeight: '900',
                        padding: '10px',
                        marginBottom: '10px',
                        textAlign: 'center'
                      }}
                    />
                    {inputError && (
                      <div style={{ fontSize: '10px', color: 'var(--error)', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                        {inputError}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleSave(test.name)}
                        style={{
                          flex: 1,
                          background: 'var(--primary)',
                          color: 'black',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          fontSize: '11px',
                          fontWeight: '900'
                        }}
                      >
                        {localInputValue === '' && currentDayVal ? 'BORRAR' : 'OK'}
                      </button>
                      <button
                        onClick={() => setEditingTest(null)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          width: '40px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ margin: '10px 0' }}>
                      <div style={{ fontSize: '20px', color: 'white', fontWeight: '900' }}>
                        {latestValue}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>
                        Best: <span style={{ color: 'rgba(255,255,255,0.4)' }}>{bestValue}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '900',
                      color: latestValue !== '—' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      textAlign: 'right',
                      lineHeight: 1
                    }}>
                      {calculateScore(test.name, latestValue === '—' ? '' : latestValue, profile.gender, profile.activeOppositionId).score.toFixed(1)}
                      <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '2px' }}>pts</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Calculator;
