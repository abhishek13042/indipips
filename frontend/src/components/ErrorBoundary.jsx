import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Matrix Shield intercepted an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '24px',
          fontFamily: '"Inter", sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
            maxWidth: '500px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🛡️</div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e1b4b', marginBottom: '16px' }}>
              Matrix Shield Activated
            </h1>
            <p style={{ color: '#64748b', fontWeight: 500, lineHeight: 1.6, marginBottom: '32px' }}>
              We've encountered a minor structural anomaly in the dashboard. Don't worry, your data is secure. Please refresh or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#1e1b4b',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Reboot Matrix Hub
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
