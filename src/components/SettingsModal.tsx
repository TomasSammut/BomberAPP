import React, { useState } from 'react';
import type { UserProfile, Gender } from '../types';
import { oppositions } from '../scoring';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onResetData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [oppositionId, setOppositionId] = useState(profile.activeOppositionId);
  const [avatarId, setAvatarId] = useState(profile.avatarId || '1');

  if (!isOpen) return null;

  const avatars = [
    { id: '1', icon: '👨‍🚒', label: 'Bombero A' },
    { id: '2', icon: '👩‍🚒', label: 'Bombera A' },
    { id: '3', icon: '🚒', label: 'Camión' },
    { id: '4', icon: '🦁', label: 'León' },
    { id: '5', icon: '🦅', label: 'Águila' },
    { id: '6', icon: '⚡', label: 'Rayo' },
  ];

  const handleSave = () => {
    onUpdateProfile({ name, gender, activeOppositionId: oppositionId, avatarId });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '20px', marginTop: '10px' }}>Configuración</h2>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Avatar</label>
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              padding: '10px 5px',
              margin: '0 -5px 15px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} className="avatar-scroll-container">
              {avatars.map(av => (
                <div
                  key={av.id}
                  onClick={() => setAvatarId(av.id)}
                  style={{
                    fontSize: '28px',
                    padding: '12px',
                    minWidth: '60px',
                    background: avatarId === av.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: avatarId === av.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                    flexShrink: 0
                  }}
                >
                  {av.icon}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Aspirante</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Género (Baremos)</label>
            <div className="gender-selector">
              <button
                className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
              >
                Hombre
              </button>
              <button
                className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
              >
                Mujer
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Oposición Activa</label>
            <select
              className="form-input"
              value={oppositionId}
              onChange={(e) => setOppositionId(e.target.value)}
              style={{ width: '100%', appearance: 'none', background: '#0f172a url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center' }}
            >
              {oppositions.map(opp => (
                <option key={opp.id} value={opp.id}>{opp.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Zona de Peligro</label>
            <button className="reset-data-btn" onClick={onResetData} style={{ background: 'white', color: 'black', fontWeight: '900' }}>
              BORRAR TODOS LOS DATOS
            </button>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="save-btn" onClick={handleSave}>
            GUARDAR CAMBIOS
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;

