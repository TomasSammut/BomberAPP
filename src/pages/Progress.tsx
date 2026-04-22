import React, { useState, useMemo } from 'react';
import {
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Tooltip
} from 'recharts';
import { achievements } from '../data/achievements';
import type { SessionRecord, UserProfile, TestScore, TimeRange } from '../types';
import { tests, oppositions, allScoringCriteria, parseValue } from '../scoring';

interface ProgressProps {
  history: SessionRecord[];
  profile: UserProfile;
  currentStats: TestScore[];
  onDeleteRecord?: (id: string, testName: string) => void;
  onUpdateRecord?: (id: string, testName: string, newValue: string) => void;
}

const Progress: React.FC<ProgressProps> = ({ history, profile, currentStats, onDeleteRecord, onUpdateRecord }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'detailed' | 'achievements'>('general');
  const [selectedTest, setSelectedTest] = useState<string>(tests[0].name);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showRadarTooltip, setShowRadarTooltip] = useState(false);
  const [activeRadarData, setActiveRadarData] = useState<any>(null);

  const handleEditClick = (recordId: string) => {
    const record = filteredHistory.find(h => h.id === recordId);
    if (record) {
      const testScore = record.scores.find(s => s.name === selectedTest);
      if (testScore) {
        setEditingRecordId(recordId);
        setEditValue(testScore.value);
      }
    }
  };

  const handleSaveEdit = (recordId: string) => {
    if (onUpdateRecord) {
      onUpdateRecord(recordId, selectedTest, editValue);
    }
    setEditingRecordId(null);
  };

  // Filter history by time range
  const filteredHistory = useMemo(() => {
    // Only 'mark' sessions for the evolution and CRUD (usually)
    const marksOnly = history.filter(h => h.type === 'mark');
    if (timeRange === 'all') return marksOnly;
    const now = Date.now();
    const ranges: Record<string, number> = {
      '30d': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    };
    return marksOnly.filter(s => (now - s.timestamp) <= (ranges[timeRange] || Infinity));
  }, [history, timeRange]);

  const totalScore = currentStats.reduce((acc, s) => acc + s.score, 0);
  const isApto = currentStats.every(s => s.score >= 5);

  const radarData = useMemo(() => {
    return tests.map(test => {
      const stat = currentStats.find(s => s.name === test.name);
      return {
        subject: test.name.split(' ')[0],
        fullSubject: test.name,
        A: stat ? stat.score : 0,
        value: stat ? stat.value : '---',
        fullMark: 10,
      };
    });
  }, [currentStats]);

  const testHistoryData = useMemo(() => {
    const oppId = profile.activeOppositionId || 'consorcio_vlc';
    const opp = oppositions.find(o => o.id === oppId) || oppositions[0];
    const criteria = allScoringCriteria[opp.scoringTable][selectedTest];

    return [...filteredHistory].reverse().map(session => {
      const testScore = session.scores.find(s => s.name === selectedTest);
      const numericValue = testScore ? parseValue(testScore.value, criteria?.unit || 'seconds') : null;
      return {
        timestamp: session.timestamp,
        dateLabel: new Date(session.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        points: testScore ? testScore.score : null,
        value: testScore ? testScore.value : null,
        numericValue: numericValue
      };
    }).filter(d => d.numericValue !== null && !isNaN(d.numericValue as number));
  }, [filteredHistory, selectedTest, profile.activeOppositionId]);

  const testCriteria = useMemo(() => {
    const oppId = profile.activeOppositionId || 'consorcio_vlc';
    const opp = oppositions.find(o => o.id === oppId) || oppositions[0];
    return allScoringCriteria[opp.scoringTable][selectedTest];
  }, [selectedTest, profile.activeOppositionId]);

  const formatYAxis = (val: any) => {
    if (testCriteria?.unit === 'time') {
      const m = Math.floor(val / 60);
      const s = Math.floor(val % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    if (testCriteria?.unit === 'towerTime') {
      return val.toFixed(2);
    }
    return val;
  };

  const getInsights = (testName: string) => {
    const scores = history
      .filter(s => s.scores.some(ts => ts.name === testName))
      .slice(0, 5)
      .map(s => s.scores.find(ts => ts.name === testName)?.score || 0);

    if (scores.length < 2) return { text: "Registra más sesiones para obtener un análisis detallado.", color: "var(--text-muted)" };

    const current = scores[0];
    const prev = scores[1];
    const isWeak = current < 5;
    const isStrong = current >= 9;
    const diff = current - prev;

    if (isWeak) return { text: `⚠️ PUNTO DÉBIL: Mejora en ${testName} para ser APTO.`, color: "var(--error)" };
    if (isStrong) return { text: `🏆 PUNTO FUERTE: Dominas esta prueba.`, color: "var(--primary)" };
    if (diff > 0) return { text: `🚀 EVOLUCIÓN POSITIVA: +${diff.toFixed(1)} pts.`, color: "var(--success)" };

    return { text: "Mantienes un ritmo constante.", color: "white" };
  };

  const getPriorityWeakness = () => {
    const sortedStats = [...currentStats].sort((a, b) => a.score - b.score);
    const worst = sortedStats[0];
    if (worst.score < 5) return { msg: `BLOQUE CRÍTICO: Estás suspendiendo en ${worst.name}. Sin el 5.0 aquí, tu oposición termina.`, level: 'critical', color: 'var(--error)' };
    if (worst.score < 7) return { msg: `MARGEN DE MEJORA: Tu prueba más floja es ${worst.name}. Un pequeño empujón aquí subirá tu media drásticamente.`, level: 'warning', color: 'var(--primary)' };
    return { msg: "Nivel equilibrado. Sigue puliendo detalles para asegurar la plaza.", level: 'success', color: 'var(--success)' };
  };

  const priorityWeakness = useMemo(() => getPriorityWeakness(), [currentStats]);
  const insight = useMemo(() => getInsights(selectedTest), [selectedTest, history]);

  if (history.length === 0) {
    return (
      <div className="page-content">
        <main className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
          <span style={{ fontSize: '64px', marginBottom: '20px' }}>📈</span>
          <h2 style={{ color: 'white' }}>Sin Historial</h2>
          <p style={{ color: 'var(--text-muted)', padding: '0 40px' }}>Registra marcas en la calculadora para ver tu evolución.</p>
        </main>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#1a2234', padding: '12px', border: '1px solid var(--primary)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{data.dateLabel}</p>
          <p style={{ margin: '6px 0', fontSize: '16px', fontWeight: '900', color: 'white' }}>{data.value}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '900' }}>{data.points} pts</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handlePointClick = (data: any) => {
    if (data && data.payload) {
      setActiveRadarData(data.payload);
      setShowRadarTooltip(true);
    }
  };

  const handleCloseTooltip = () => {
    setShowRadarTooltip(false);
    setActiveRadarData(null);
  };

  return (
    <div className="page-content progress-page">
      <main className="main" style={{ paddingTop: 'calc(20px + env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', fontSize: '16px', fontWeight: '800' }}>
          <span onClick={() => setActiveTab('general')} style={{ color: activeTab === 'general' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>General</span>
          <span onClick={() => setActiveTab('detailed')} style={{ color: activeTab === 'detailed' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>Detalle</span>
          <span onClick={() => setActiveTab('achievements')} style={{ color: activeTab === 'achievements' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>Logros</span>
        </div>

        {activeTab === 'general' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '100%', height: '320px', margin: '0 auto', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={radarData}
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                >
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: '700' }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="A"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.5}
                    strokeWidth={3}
                    isAnimationActive={false}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isActive = activeRadarData && activeRadarData.subject === payload.subject;
                      return (
                        <g
                          key={`dot-group-${payload.subject}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePointClick({ payload });
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Hitbox invisible para facilitar el toque en móvil */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={25}
                            fill="transparent"
                          />
                          {/* Punto visual pequeño */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isActive ? 7 : 4}
                            fill={isActive ? 'white' : 'var(--primary)'}
                            stroke={isActive ? 'var(--primary)' : 'none'}
                            strokeWidth={2}
                            style={{ transition: 'all 0.2s ease' }}
                          />
                        </g>
                      );
                    }}
                    activeDot={false}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {showRadarTooltip && activeRadarData && (
                <div
                  onClick={handleCloseTooltip}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#111827',
                    padding: '20px',
                    border: '2px solid var(--primary)',
                    borderRadius: '24px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
                    textAlign: 'center',
                    width: '180px',
                    zIndex: 10000
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    {activeRadarData.fullSubject}
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', lineHeight: 1, marginBottom: '8px' }}>
                    {activeRadarData.A.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>
                    Marca: <span style={{ color: 'white' }}>{activeRadarData.value || '---'}</span>
                  </div>
                  <div style={{ marginTop: '15px', fontSize: '9px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase', opacity: 0.5 }}>
                    Toca para cerrar
                  </div>
                </div>
              )}
            </div>

            <div className="stats-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 15px 25px', textAlign: 'center' }}>
              <div style={{ flex: '1 1 0px', minWidth: 0 }}>
                <label style={{ fontSize: '8px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block', whiteSpace: 'nowrap' }}>Total puntos</label>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', lineHeight: 1 }}>{totalScore.toFixed(1)}</div>
              </div>
              <div style={{ flex: '1.2 1 0px', minWidth: 0, padding: '0 5px' }}>
                <label style={{ fontSize: '8px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px', display: 'block', whiteSpace: 'nowrap' }}>PROB. APTO</label>
                <div style={{ fontSize: '16px', fontWeight: '900', color: 'rgba(255,255,255,0.7)', lineHeight: 1.2 }}>{((totalScore / 60) * 100).toFixed(3)}%</div>
              </div>
              <div style={{ flex: '1.4 1 0px', minWidth: 0 }}>
                <label style={{ fontSize: '8px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'block', whiteSpace: 'nowrap' }}>Estado actual</label>
                <div style={{ fontSize: '28px', fontWeight: '900', color: isApto ? 'var(--success)' : 'var(--error)', lineHeight: 1, whiteSpace: 'nowrap' }}>{isApto ? 'Apto' : 'No Apto'}</div>
              </div>
            </div>

            <div style={{
              margin: '0 20px 20px',
              padding: '20px 25px',
              borderRadius: '16px',
              background: '#1a2234',
              borderLeft: `6px solid ${priorityWeakness.color}`,
              textAlign: 'left',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Análisis de Prioridades</div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: 'white', lineHeight: '1.4' }}>{priorityWeakness.msg}</p>
            </div>
          </div>
        ) : activeTab === 'detailed' ? (
          <div>
            <div className="range-selector">
              {(['30d', '3m', '1y', 'all'] as TimeRange[]).map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={timeRange === r ? 'active' : ''}>{r.toUpperCase()}</button>
              ))}
            </div>

            <div className="test-selector-scroll">
              {tests.map(t => (
                <button key={t.name} onClick={() => setSelectedTest(t.name)} className={selectedTest === t.name ? 'active' : ''}>{t.name}</button>
              ))}
            </div>

            <section className="card" style={{ margin: '0 20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '14px', margin: 0, color: 'var(--primary)', fontWeight: '900' }}>EVOLUCIÓN: {selectedTest}</h2>
                <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800' }}>
                  {testHistoryData.length} REGISTROS
                </div>
              </div>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={testHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fill: 'gray', fontSize: 9 }} />
                    <YAxis domain={['auto', 'auto']} reversed={testCriteria?.betterIs === 'lower'} tickFormatter={formatYAxis} axisLine={false} tickLine={false} tick={{ fill: 'gray', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="numericValue" stroke="var(--primary)" strokeWidth={4} dot={{ fill: 'var(--primary)', r: 5 }} activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '30px', padding: '15px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', borderLeft: `6px solid ${insight.color}` }}>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: 'white', fontWeight: '500' }}>{insight.text}</p>
              </div>
            </section>

            <div style={{ padding: '20px 20px 160px' }}>
              <h3 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '15px', fontWeight: '800', letterSpacing: '1px' }}>Historial de Marcas</h3>
              {filteredHistory.map(record => {
                const score = record.scores.find(s => s.name === selectedTest);
                if (!score) return null;
                const isEditing = editingRecordId === record.id;

                return (
                  <div key={record.id} style={{
                    background: 'var(--card-bg)',
                    padding: '16px',
                    borderRadius: '20px',
                    marginBottom: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                          {new Date(record.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            autoFocus
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--primary)',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: '900',
                              padding: '4px 8px',
                              width: '120px',
                              marginTop: '4px'
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginTop: '4px' }}>{score.value}</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>PUNTOS</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>{score.score.toFixed(1)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(record.id)}
                              style={{ background: 'var(--primary)', color: 'black', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >
                              ✓
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditClick(record.id)}
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                            >
                              <span style={{ transform: 'translateY(-1px)' }}>✏️</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteRecord?.(record.id, selectedTest)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', width: '36px', height: '36px', borderRadius: '10px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          >
                            <span style={{ transform: 'translateY(-1px)' }}>🗑️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="achievements-grid">
            {achievements.map(a => {
              const isUnlocked = profile.achievements?.includes(a.id);
              return (
                <div key={a.id} className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="icon">{a.icon}</div>
                  <div>
                    <h3 style={{ color: isUnlocked ? 'white' : 'var(--text-muted)' }}>{a.title}</h3>
                    <p>{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Progress;
