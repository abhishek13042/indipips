import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Terminal component error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: '#0D1420',
          color: '#94A3B8',
          fontSize: 12,
          flexDirection: 'column',
          gap: 8,
        }}>
          <div>⚠️ Component error</div>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
