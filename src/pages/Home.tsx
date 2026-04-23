import React, { useState, useMemo } from 'react';
import type { TestScore, UserProfile, Opposition, SessionRecord } from '../types';
import SettingsModal from '../components/SettingsModal';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  stats: TestScore[];
  profile: UserProfile;
  opposition: Opposition;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetData: () => void;
  history: SessionRecord[];
}

const Home: React.FC<HomeProps> = ({ stats, profile, opposition, onUpdateProfile, onResetData, history }) => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const historicalData = useMemo(() => {
    return [...history].slice(0, 15).reverse().map(session => ({
      name: new Date(session.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      score: session.totalScore,
    }));
  }, [history]);

  const totalScore = stats.reduce((acc, curr) => acc + curr.score, 0);
  const readinessPercentage = (totalScore / 60) * 100;

  const oppositionSiglas = opposition.name
    .split(' ')
    .filter(word => word.length > 3)
    .map(word => word[0])
    .join('')
    .toUpperCase() || 'OP';

  const avatars: Record<string, string> = {
    '1': '👨‍🚒', '2': '👩‍🚒', '3': '🚒', '4': '🦁', '5': '🦅', '6': '⚡'
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'calc(10px + env(safe-area-inset-top)) 20px 10px',
        marginBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: 'var(--primary)',
              color: 'black',
              fontWeight: '900',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
            {oppositionSiglas}
          </div>
          {profile.streak && profile.streak > 0 && (
            <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)' }}>
              🔥 {profile.streak}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{avatars[profile.avatarId || '1']}</span>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
              {profile.name}
            </h1>
        </div>

        <div
          onClick={() => navigate('/progress')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '900',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}>
          {Math.round(readinessPercentage)}%
        </div>
      </header>

      <main className="main">
        <section className="card" style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(30, 41, 59, 0.5) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              Entrenamiento de hoy
            </h2>
            <button
              onClick={() => navigate('/training')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>
              VER PLAN ➔
            </button>
          </div>
          <p style={{ fontSize: '20px', fontWeight: '800', margin: '5px 0', color: 'white' }}>Mi Entrenamiento</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Pulsa para ver detalles de los ejercicios y herramientas.</p>
        </section>

        <section className="card" style={{ marginTop: '20px', padding: '15px' }}>
          <h2 style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px' }}>
            Evolución Global
          </h2>
          <div style={{ width: '100%', height: '180px' }}>
            {historicalData.length > 1 ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {historicalData.map((d, i) => (
                  <div key={i} style={{
                    flex: 1,
                    height: `${(d.score / 60) * 100}%`,
                    background: i === historicalData.length - 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '2px 2px 0 0'
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                Registra al menos dos marcas para ver tu curva de evolución.
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
             <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Historial</span>
             <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>Actual: {totalScore.toFixed(1)} pts</span>
          </div>
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onResetData={onResetData}
      />
    </div>
  );
};

export default Home;
