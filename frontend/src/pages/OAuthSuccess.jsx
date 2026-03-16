import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    const handleLoginSuccess = async () => {
      if (token) {
        try {
          // Store token temporarily to fetch profile
          localStorage.setItem('accessToken', token);
          
          // Fetch user profile
          const res = await api.get('/auth/profile');
          const userData = res.data.data;
          
          // Finalize login in context
          login(userData, token);
          
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('OAuth profile fetch failed:', error);
          navigate('/login?error=profile_fetch_failed');
        }
      } else {
        navigate('/login?error=no_token');
      }
    };

    handleLoginSuccess();
  }, [token, login, navigate]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#fcfcfc',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #2563eb', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h2 style={{ color: '#0f172a', fontWeight: 700 }}>Completing login...</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Authenticating with Google</p>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OAuthSuccess;
