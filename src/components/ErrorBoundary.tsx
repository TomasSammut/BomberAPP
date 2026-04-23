import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          backgroundColor: '#0f172a',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Algo salió mal</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', maxWidth: '400px' }}>
            Se produjo un error inesperado. Intenta recargando la página.
          </p>
          {this.state.error && (
            <div style={{
              background: 'rgba(255,0,0,0.1)',
              border: '1px solid rgba(255,0,0,0.3)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              fontSize: '12px',
              maxWidth: '500px',
              wordBreak: 'break-word'
            }}>
              <code>{this.state.error.message}</code>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={this.resetError}
              style={{
                background: 'var(--primary)',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Ir al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
