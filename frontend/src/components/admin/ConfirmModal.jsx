import React, { useEffect } from 'react'

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  confirmColor = 'green', 
  onConfirm, 
  onCancel, 
  children 
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const getButtonColor = () => {
    if (confirmColor === 'red') return { bg: '#EF4444', hover: '#DC2626' }
    if (confirmColor === 'green') return { bg: '#10B981', hover: '#059669' }
    return { bg: '#2563EB', hover: '#1D4ED8' } // default blue
  }

  const btnColors = getButtonColor()

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          backgroundColor: '#0D1420',
          border: '1px solid #1E2D40',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#F1F5F9', marginBottom: '16px' }}>
          {title}
        </h2>
        
        {message && (
          <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.5', marginBottom: '24px' }}>
            {message}
          </p>
        )}
        
        {children && (
          <div style={{ marginBottom: '24px' }}>
            {children}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#F1F5F9',
              border: '1px solid #1E2D40',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#131D2E'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 16px',
              backgroundColor: btnColors.bg,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = btnColors.hover}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = btnColors.bg}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
