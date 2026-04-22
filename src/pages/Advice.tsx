import React from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Browser } from '@capacitor/browser';

const Advice: React.FC = () => {
  const handleDownloadClick = async (url: string) => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    try {
      await Browser.open({ url });
    } catch (e) {
      alert(`No se pudo abrir el documento: ${url}`);
    }
  };

  return (
    <div className="page-content">
      <main className="main" style={{ paddingTop: 'calc(10px + env(safe-area-inset-top))', paddingBottom: '120px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'white' }}>Recursos y Consejos</h2>

        {/* Convocatorias Section */}
        <section className="card">
          <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>Convocatorias en Curso</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Consorcio Valencia 2026</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>60 Plazas • Estimada Octubre</span>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '4px 8px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent)',
                borderRadius: '6px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>Prevista</span>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Ayto. Valencia 2025</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>20 Plazas • Plazo Abierto</span>
              </div>
              <span style={{
                fontSize: '10px',
                padding: '4px 8px',
                background: 'rgba(34, 197, 94, 0.15)',
                color: 'var(--success)',
                borderRadius: '6px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>Abierta</span>
            </div>
          </div>
        </section>

        {/* Weekly Tips */}
        <section className="card">
          <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>Tips de la Semana</h2>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🧘‍♂️</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Movilidad y Flexibilidad</strong>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                Dedica 15 minutos diarios a movilidad de cadera para mejorar tu técnica de carrera y evitar lesiones.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ fontSize: '24px' }}>🥗</div>
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Nutrición: Hidratación</strong>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                En días de series de 1000m, aumenta la ingesta de sales minerales para optimizar la recuperación muscular.
              </p>
            </div>
          </div>
        </section>

        {/* Specific Test Tips */}
        <section className="card">
          <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>Consejos Técnicos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🧗‍♂️</span>
                <strong style={{ color: 'var(--primary)' }}>Subida de Cuerda</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <li><strong>Tracción Explosiva:</strong> La primera brazada debe ser máxima para ganar inercia.</li>
                <li><strong>Grip:</strong> Entrena con toallas colgadas para fortalecer el agarre específico.</li>
                <li><strong>Core:</strong> Mantén el cuerpo bloqueado; el balanceo excesivo resta eficiencia.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🏰</span>
                <strong style={{ color: 'var(--primary)' }}>Ascenso a la Torre</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                <li><strong>Ritmo de Escalones:</strong> No busques saltar muchos escalones, busca un ritmo constante de 2 en 2.</li>
                <li><strong>Uso de Barandilla:</strong> Tracciona con los brazos para descargar las piernas en los giros.</li>
                <li><strong>Recuperación:</strong> Entrena series de escaleras con chaleco lastrado para sobrecargar.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PDF Downloads */}
        <section className="card">
          <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>Documentos Oficiales</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleDownloadClick('https://www.cpbv.es/wp-content/uploads/2024/Baremos_VLC_2026.pdf')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'left',
                width: '100%',
                fontWeight: '600'
              }}
            >
              <span style={{ fontSize: '20px' }}>📋</span>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block' }}>Baremo Oficial Consorcio</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>ONLINE • PDF OFICIAL</span>
              </div>
              <span style={{ color: 'var(--primary)' }}>🔗</span>
            </button>

            <button
              onClick={() => handleDownloadClick('https://www.valencia.es/ayuntamiento/bomberos.nsf/vDocumentosWeb/Reglamento_Tecnico')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'left',
                width: '100%',
                fontWeight: '600'
              }}
            >
              <span style={{ fontSize: '20px' }}>📖</span>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block' }}>Reglamento Técnico Ayto</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>PORTAL WEB • OFICIAL</span>
              </div>
              <span style={{ color: 'var(--primary)' }}>🔗</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Advice;
