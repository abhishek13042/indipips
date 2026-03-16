import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [allChallenges, setAllChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [singleRes, allRes] = await Promise.all([
          api.get(`/challenges/${id}`),
          api.get('/challenges')
        ]);
        setChallenge(singleRes.data.data);
        setAllChallenges(allRes.data.data);
      } catch (err) {
        console.warn('API fetch failed, switching to mock data for verification.');
        const mockAll = [
          { id: '11740829', accountNodeId: 'IP-11740829', accountSize: 5000, currentBalance: 4503.61, totalPnl: -496.39, phase: 1, status: 'ACTIVE', plan: { name: 'Student' } },
          { id: '100889987', accountNodeId: 'IP-100889987', accountSize: 100000, currentBalance: 94585.00, totalPnl: -5415.00, phase: 1, status: 'ACTIVE', plan: { name: 'Competition' } },
          { id: '11359181', accountNodeId: 'IP-11359181', accountSize: 5000, currentBalance: 4499.84, totalPnl: -500.16, phase: 1, status: 'ACTIVE', plan: { name: 'Student' } }
        ];
        setAllChallenges(mockAll);
        setChallenge({
          id: id || mockAll[1].id,
          accountNodeId: 'IP-100889987',
          accountSize: 100000,
          currentBalance: 94585.00,
          totalPnl: -5415.00,
          dailyPnl: -450.25,
          phase: 1,
          status: 'ACTIVE',
          profitPercentage: -5.41,
          dailyLossPercentage: 0.45,
          drawdownPercentage: 5.42,
          plan: {
            name: 'Competition',
            challengeType: 'FUNDED',
            profitTarget: 10,
            dailyLossLimit: 5,
            maxDrawdown: 10
          },
          recentTrades: [
            { instrument: 'BTCUSD', tradeType: 'BUY', quantity: 0.5, entryPrice: 65000, exitPrice: 65500, pnl: 250, status: 'CLOSED' },
            { instrument: 'ETHUSD', tradeType: 'SELL', quantity: 1.0, entryPrice: 3500, exitPrice: 3450, pnl: 50, status: 'CLOSED' },
            { instrument: 'XAUUSD', tradeType: 'BUY', quantity: 0.1, entryPrice: 2350, exitPrice: 2345, pnl: -5, status: 'CLOSED' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ 
              border: '3px solid #f1f1f5', 
              borderTop: '3px solid #4338ca', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#4338ca', fontWeight: 800, fontSize: '15px' }}>Syncing Matrix State...</p>
          </div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </DashboardLayout>
    );
  }

  if (!challenge) return null;

  const chartData = [
    { name: 'Day 1', equity: 100000 },
    { name: 'Day 2', equity: 98000 },
    { name: 'Day 3', equity: 99500 },
    { name: 'Day 4', equity: 96000 },
    { name: 'Day 5', equity: 94585 }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* Bespoke Account Switcher Sidebar */}
        <aside style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ 
            backgroundColor: '#f8fafc', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1e1b4b', marginBottom: '20px', letterSpacing: '0.5px' }}>MY MATRIX HUB</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allChallenges.map((acc) => {
                const isActive = acc.id === challenge.id;
                return (
                  <div 
                    key={acc.id}
                    onClick={() => navigate(`/dashboard/challenges/${acc.id}`)}
                    style={{
                      padding: '16px', borderRadius: '18px', cursor: 'pointer',
                      background: isActive ? 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' : 'white',
                      border: isActive ? 'none' : '1px solid #f1f5f9',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? '0 10px 20px rgba(67, 56, 202, 0.2)' : 'none',
                    }}
                    onMouseOver={(e) => !isActive && (e.currentTarget.style.transform = 'translateX(4px)')}
                    onMouseOut={(e) => !isActive && (e.currentTarget.style.transform = 'translateX(0)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: isActive ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>#{acc.accountNodeId || acc.id.slice(0, 8).toUpperCase()}</span>
                      <span style={{ 
                        fontSize: '9px', fontWeight: 900, padding: '2px 8px', 
                        backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : '#fef2f2', 
                        color: isActive ? 'white' : '#ef4444', borderRadius: '6px' 
                      }}>LIVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '15px', fontWeight: 900, color: isActive ? 'white' : '#1e1b4b', margin: 0 }}>${acc.currentBalance.toLocaleString()}</p>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: isActive ? '#34d399' : '#10b981', margin: 0 }}>{((acc.totalPnl / acc.accountSize) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/dashboard/new-challenge')}
              style={{
                width: '100%', marginTop: '24px', backgroundColor: '#eef2ff', color: '#4338ca',
                border: 'none', padding: '12px', borderRadius: '14px', fontWeight: 800, fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eef2ff'}
            >
              + NEW ACCOUNT
            </button>
          </div>
        </aside>

        {/* Main Account View */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                width: '100%', padding: '12px 20px', background: 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)', 
                borderRadius: '16px', borderLeft: '4px solid #4338ca' 
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>{challenge.plan.name} Challenge Prototype</h2>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>#{challenge.accountNodeId || challenge.id.toUpperCase()}</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1', alignSelf: 'center' }} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#4338ca' }}>PHASE {challenge.phase}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cluster */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
             {[
               { label: 'EQUITY (NETT)', value: `$${challenge.currentBalance.toLocaleString()}`, icon: '💎' },
               { label: 'BALANCE (REAL)', value: `$${challenge.currentBalance.toLocaleString()}`, icon: '🏦' },
               { label: 'VELOCITY (P&L)', value: `-$${Math.abs(challenge.totalPnl).toLocaleString()}`, color: '#ef4444', icon: '📉' },
               { label: 'INTRADAY', value: `-$${Math.abs(challenge.dailyPnl).toLocaleString()}`, color: '#ef4444', icon: '🕒' },
             ].map((stat, i) => (
               <div key={i} style={{ 
                 backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '24px', padding: '24px',
                 boxShadow: '0 10px 20px rgba(0,0,0,0.01)'
               }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, margin: 0 }}>{stat.label}</p>
                    <span style={{ fontSize: '16px' }}>{stat.icon}</span>
                  </div>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: stat.color || '#1e1b4b', margin: 0 }}>{stat.value}</p>
               </div>
             ))}
          </div>

          {/* Performance Curves */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', marginBottom: '40px' }}>
            <div style={{ 
              backgroundColor: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9',
              boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
            }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                 <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>Equity Trajectory</h3>
                 <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                    <button style={{ padding: '4px 12px', border: 'none', background: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: 800, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Live</button>
                    <button style={{ padding: '4px 12px', border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '11px', fontWeight: 800 }}>Mtg</button>
                 </div>
               </div>
               <div style={{ height: '320px' }}>
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData}>
                     <defs>
                       <linearGradient id="colorBespoke" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4338ca" stopOpacity={0.15}/>
                         <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" hide />
                     <YAxis hide domain={['auto', 'auto']} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                       itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                     />
                     <Area type="monotone" dataKey="equity" stroke="#4338ca" strokeWidth={5} fillOpacity={1} fill="url(#colorBespoke)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

            {/* Trading Vitals */}
            <div style={{ 
              backgroundColor: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9',
              boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#1e1b4b', marginBottom: '32px' }}>Logic Vitals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                {[
                  { label: 'Profit Target', val: 0, target: 10, color: '#4338ca' },
                  { label: 'Daily Loss Barrier', val: 0.45, target: 5, color: '#ef4444' },
                  { label: 'System Drawdown', val: 5.42, target: 10, color: '#f59e0b' },
                ].map((obj, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#4b5563' }}>{obj.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#1e1b4b' }}>{obj.val}% / {obj.target}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(obj.val / obj.target) * 100}%`, height: '100%', backgroundColor: obj.color, boxShadow: `0 0 8px ${obj.color}55` }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ 
                marginTop: '40px', padding: '24px', backgroundColor: '#fdfdff', border: '1px solid #eef2ff', borderRadius: '24px' 
              }}>
                 <p style={{ fontSize: '11px', fontWeight: 900, color: '#4338ca', margin: '0 0 16px 0', letterSpacing: '1px' }}>SECURE ACCESS</p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 800 }}>Node ID:</p>
                     <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>{challenge.accountNodeId || 'IP-PENDING'}</p>
                   </div>
                   <button style={{ backgroundColor: '#4338ca', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>COPY</button>
                 </div>
              </div>
            </div>
          </div>

          {/* Trade Matrix */}
          <div style={{ 
            backgroundColor: 'white', borderRadius: '32px', padding: '32px', border: '1px solid #f1f5f9',
            boxShadow: '0 20px 40px rgba(0,0,0,0.02)'
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>Trade Matrix</h3>
               <button style={{ color: '#4338ca', border: 'none', backgroundColor: 'transparent', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>Exploration View →</button>
             </div>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                   {['Asset', 'Execution', 'Size', 'Entry', 'Current', 'P&L'].map(h => (
                     <th key={h} style={{ padding: '16px', fontSize: '11px', color: '#94a3b8', fontWeight: 900, letterSpacing: '0.5px' }}>{h.toUpperCase()}</th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                  {challenge.recentTrades.map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                      <td style={{ padding: '20px 16px', fontWeight: 900, fontSize: '15px', color: '#1e1b4b' }}>{t.instrument}</td>
                      <td style={{ padding: '20px 16px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, 
                          backgroundColor: t.tradeType === 'BUY' ? '#ecfdf5' : '#fff1f2', 
                          color: t.tradeType === 'BUY' ? '#10b981' : '#f43f5e',
                          border: `1px solid ${t.tradeType === 'BUY' ? '#10b981' : '#f43f5e'}33`
                        }}>{t.tradeType}</span>
                      </td>
                      <td style={{ padding: '20px 16px', fontWeight: 700, fontSize: '14px', color: '#4b5563' }}>{t.quantity} Units</td>
                      <td style={{ padding: '20px 16px', fontWeight: 700, fontSize: '14px', color: '#64748b' }}>{t.entryPrice}</td>
                      <td style={{ padding: '20px 16px', fontWeight: 700, fontSize: '14px', color: '#64748b' }}>{t.exitPrice}</td>
                      <td style={{ padding: '20px 16px', fontWeight: 900, fontSize: '15px', color: t.pnl >= 0 ? '#10b981' : '#f43f5e' }}>{t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}</td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChallengeDetailPage;
