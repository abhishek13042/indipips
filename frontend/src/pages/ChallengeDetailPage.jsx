import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Activity, 
  Target, 
  AlertTriangle, 
  TrendingDown, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Wallet,
  Clock,
  ShieldAlert
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api';

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [allChallenges, setAllChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutEligible, setPayoutEligible] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState('');

  const fetchPayoutEligibility = async () => {
    try {
      const { data } = await api.get(`/payouts/eligibility/${id}`);
      if (data.success) setPayoutEligible(data.data);
    } catch (err) {
      console.warn('Payout eligibility check failed');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [singleRes, allRes] = await Promise.all([
          api.get(`/challenges/${id}`),
          api.get('/challenges')
        ]);
        setChallenge(singleRes.data.data);
        setAllChallenges(allRes.data.data);
        fetchPayoutEligibility();
      } catch (err) {
        console.warn('API fetch failed, switching to mock data for verification.');
        const mockAll = [
          { id: '11740829', accountNodeId: 'IP-A992', accountSize: 5000, currentBalance: 4503.61, totalPnl: -496.39, phase: 1, status: 'ACTIVE', plan: { name: 'Student' } },
          { id: '100889987', accountNodeId: 'IP-X889', accountSize: 100000, currentBalance: 94585.00, totalPnl: -5415.00, phase: 1, status: 'ACTIVE', plan: { name: 'Competition' } },
          { id: '11359181', accountNodeId: 'IP-B331', accountSize: 5000, currentBalance: 5499.84, totalPnl: 499.84, phase: 1, status: 'ACTIVE', plan: { name: 'Student' } }
        ];
        
        let found = mockAll.find(c => c.id === id);
        if (!found) found = mockAll[1];

        setAllChallenges(mockAll);
        setChallenge({
          ...found,
          dailyPnl: -450.25,
          profitPercentage: (found.totalPnl / found.accountSize) * 100,
          dailyLossPercentage: 0.45,
          drawdownPercentage: 5.42,
          plan: {
            ...found.plan,
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

  const handleRequestPayout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payouts/request', { challengeId: id });
      if (data.success) {
        setPayoutMessage('Payout request submitted successfully!');
        setTimeout(() => setShowPayoutModal(false), 2000);
        fetchPayoutEligibility();
      }
    } catch (err) {
      setPayoutMessage(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBroker = async () => {
    try {
      const { data } = await api.get('/upstox/login');
      if (data.success && data.data.loginUrl) {
        window.location.href = data.data.loginUrl;
      }
    } catch (err) {
      alert('Failed to initiate broker connection.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium animate-pulse">Syncing Matrix State...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!challenge) return null;

  const chartData = [
    { name: 'Day 1', equity: challenge.accountSize },
    { name: 'Day 2', equity: challenge.accountSize * 0.98 },
    { name: 'Day 3', equity: challenge.accountSize * 0.995 },
    { name: 'Day 4', equity: challenge.accountSize * 0.96 },
    { name: 'Day 5', equity: challenge.currentBalance }
  ];

  const profitAmount = Number(challenge.totalPnl);
  const isProfitable = profitAmount >= 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Account Switcher Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rounded-full blur-[50px] pointer-events-none"></div>
            
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Matrix Hub</h3>
            
            <div className="flex flex-col gap-3 relative z-10">
              {allChallenges.map((acc) => {
                const isActive = acc.id === challenge.id;
                const accProfit = Number(acc.totalPnl);
                
                return (
                  <div 
                    key={acc.id}
                    onClick={() => navigate(`/dashboard/challenges/${acc.id}`)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                      isActive 
                        ? 'bg-gray-900 border-green-400/30 shadow-[0_0_20px_rgba(74,222,128,0.1)]' 
                        : 'bg-black border-gray-800 hover:border-gray-600 hover:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                        #{acc.accountNodeId || acc.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-green-400/10 text-green-400' : 'bg-gray-800 text-gray-400'
                      }`}>
                        LIVE
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <p className={`text-lg font-black font-outfit ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        ${acc.currentBalance.toLocaleString()}
                      </p>
                      <p className={`text-xs font-bold ${accProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {((accProfit / acc.accountSize) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate('/dashboard/new-challenge')}
              className="w-full mt-6 bg-gray-900 text-white border border-gray-800 hover:border-gray-600 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              + Parse New Node
            </button>
          </motion.div>
        </aside>

        {/* Main Account View */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 w-full"
        >
          {/* Header Row */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-2xl font-black text-white font-outfit flex items-center gap-3">
                  {challenge.plan.name} Evaluation
                  <span className="px-3 py-1 bg-gray-900 border border-gray-800 text-gray-300 text-xs font-bold rounded-lg tracking-widest font-inter">
                    PHASE {challenge.phase}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Node: <span className="text-green-400">{challenge.accountNodeId || challenge.id.toUpperCase()}</span>
                </p>
              </div>
            </div>

            {payoutEligible?.isEligible && (
              <button 
                onClick={() => setShowPayoutModal(true)}
                className="px-6 py-3 rounded-xl bg-green-400 text-black font-black text-sm shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all hover:-translate-y-1 flex items-center gap-2"
              >
                <Wallet size={16} /> WITHDRAW PROFIT
              </button>
            )}
          </motion.div>

          {/* Stats Cluster */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             {[
               { label: 'EQUITY (NETT)', value: `$${challenge.currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: Activity, color: 'text-white' },
               { label: 'BALANCE (REAL)', value: `$${challenge.accountSize.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: Wallet, color: 'text-gray-300' },
               { label: 'VELOCITY (P&L)', value: `${isProfitable ? '+' : ''}$${profitAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: isProfitable ? Target : TrendingDown, color: isProfitable ? 'text-green-400' : 'text-red-400' },
               { label: 'INTRADAY P&L', value: `${challenge.dailyPnl >= 0 ? '+' : ''}$${Number(challenge.dailyPnl).toLocaleString()}`, icon: Clock, color: challenge.dailyPnl >= 0 ? 'text-green-400' : 'text-red-400' },
             ].map((stat, i) => {
               const Icon = stat.icon;
               return (
                 <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                      <Icon size={16} className="text-gray-600" />
                    </div>
                    <p className={`text-2xl font-black font-outfit ${stat.color} truncate`}>{stat.value}</p>
                 </div>
               );
             })}
          </motion.div>

          {/* Charts & Vitals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Chart Area */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-black border border-gray-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-400/5 rounded-full blur-[100px] pointer-events-none"></div>
               
               <div className="flex justify-between items-center mb-8 relative z-10">
                 <h3 className="text-lg font-black text-white font-outfit">Equity Trajectory</h3>
                 <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-xl">
                    <button className="px-4 py-1.5 rounded-lg bg-green-400/10 text-green-400 text-xs font-bold border border-green-400/20">Live</button>
                    <button className="px-4 py-1.5 rounded-lg text-gray-500 text-xs font-bold hover:text-white transition-colors">Sim</button>
                 </div>
               </div>

               <div className="h-72 w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4ade80" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                     <XAxis dataKey="name" hide />
                     <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', color: '#fff' }}
                       itemStyle={{ fontWeight: 800, fontSize: '14px', color: '#4ade80' }}
                       cursor={{ stroke: '#4ade80', strokeWidth: 1, strokeDasharray: '4 4' }}
                     />
                     <Area type="monotone" dataKey="equity" stroke="#4ade80" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </motion.div>

            {/* Trading Logic Vitals */}
            <motion.div variants={itemVariants} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-white font-outfit mb-6 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-gray-400" /> Logic Vitals
                </h3>
                
                <div className="space-y-6">
                  {[
                    { label: 'Profit Target', val: Math.max(0, challenge.profitPercentage || 0), target: challenge.plan.profitTarget, color: 'bg-green-400', glow: 'shadow-[0_0_10px_rgba(74,222,128,0.5)]' },
                    { label: 'Daily Loss Barrier', val: challenge.dailyLossPercentage || 0, target: challenge.plan.dailyLossLimit, color: 'bg-red-500', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
                    { label: 'System Drawdown', val: challenge.drawdownPercentage || 0, target: challenge.plan.maxDrawdown, color: 'bg-yellow-400', glow: 'shadow-[0_0_10px_rgba(250,204,21,0.5)]' },
                  ].map((obj, i) => {
                    const percent = Math.min((obj.val / obj.target) * 100, 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{obj.label}</span>
                          <span className="text-xs font-black text-white">{obj.val.toFixed(2)}% / {obj.target}%</span>
                        </div>
                        <div className="h-1.5 bg-black rounded-full overflow-hidden border border-gray-800">
                          <div className={`h-full ${obj.color} ${obj.glow} rounded-full`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="mt-8 p-5 bg-black border border-gray-800 rounded-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                 <p className="text-[10px] font-black text-gray-500 mb-4 tracking-widest uppercase">Platform Access</p>
                 
                 <div className="flex justify-between items-center mb-4">
                   <div>
                     <p className="text-[10px] text-gray-600 font-bold">Node ID / Alias:</p>
                     <p className="text-sm font-black text-white font-outfit">{challenge.accountNodeId || 'IP-PENDING'}</p>
                   </div>
                   <button className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                     <Copy size={14} />
                   </button>
                 </div>

                 <button 
                   onClick={handleConnectBroker}
                   className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                 >
                   <ExternalLink size={16} /> Connect Broker
                 </button>
              </div>
            </motion.div>
          </div>

          {/* Trade Matrix Table */}
          <motion.div variants={itemVariants} className="bg-black border border-gray-800 rounded-3xl p-6 shadow-xl overflow-hidden">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-black text-white font-outfit">Trade Matrix</h3>
               <button className="text-green-400 text-xs font-bold hover:text-green-300 transition-colors flex items-center gap-1">
                 View Full Log <ChevronRight size={14} />
               </button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                 <thead>
                   <tr className="border-b border-gray-800">
                     {['Asset', 'Type', 'Size', 'Entry', 'Current', 'P&L'].map(h => (
                       <th key={h} className="pb-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800/50">
                    {challenge.recentTrades.map((t, i) => (
                      <tr key={i} className="hover:bg-gray-900/30 transition-colors">
                        <td className="py-4 font-black text-sm text-white">{t.instrument}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-lg border ${
                            t.tradeType === 'BUY' 
                              ? 'bg-green-400/10 text-green-400 border-green-400/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {t.tradeType}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-xs text-gray-400">{t.quantity} Lots</td>
                        <td className="py-4 font-medium text-xs text-gray-500">{t.entryPrice.toLocaleString()}</td>
                        <td className="py-4 font-medium text-xs text-gray-500">{t.exitPrice.toLocaleString()}</td>
                        <td className={`py-4 font-black text-sm ${t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
               {challenge.recentTrades.length === 0 && (
                 <div className="py-12 text-center text-gray-500 text-sm font-medium border-b border-gray-800/50">
                    No trade executions found in the matrix yet.
                 </div>
               )}
             </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Payout Modal - Glassmorphic */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-green-400/5 rounded-full blur-[50px] pointer-events-none"></div>

              <h2 className="text-2xl font-black text-white font-outfit mb-2">Withdraw Earnings</h2>
              <p className="text-sm text-gray-400 mb-8 font-inter">Review your profit distribution before submitting the request to your linked Indian bank account.</p>

              {payoutMessage ? (
                <div className={`p-4 rounded-xl border font-bold text-sm text-center ${
                  payoutMessage.includes('success') 
                    ? 'bg-green-400/10 text-green-400 border-green-400/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {payoutMessage}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                    <span className="text-sm font-bold text-gray-400">Total Account Profit</span>
                    <span className="text-lg font-black text-white">${payoutEligible?.breakdown?.totalProfit?.toLocaleString() || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-400">Trader Share ({payoutEligible?.breakdown?.splitPercent || 80}%)</span>
                    <span className="text-sm font-black text-white">${payoutEligible?.breakdown?.traderGrossShare?.toLocaleString() || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-400">TDS Deduction (10%)</span>
                    <span className="text-sm font-black text-red-400">-${payoutEligible?.breakdown?.tdsAmount?.toLocaleString() || '0.00'}</span>
                  </div>
                  
                  <div className="bg-black border border-gray-800 p-6 rounded-2xl mt-6 text-center">
                    <p className="text-[10px] font-black text-gray-500 tracking-widest mb-2">ESTIMATED NET PAYOUT</p>
                    <p className="text-4xl font-black text-green-400 font-outfit">${payoutEligible?.breakdown?.netPayout?.toLocaleString() || '0.00'}</p>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button 
                      onClick={() => setShowPayoutModal(false)}
                      className="flex-1 py-4 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleRequestPayout}
                      disabled={loading}
                      className="flex-[2] py-4 rounded-xl bg-green-400 text-black font-black flex items-center justify-center gap-2 hover:bg-green-300 transition-colors shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Request Withdrawal'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default ChallengeDetailPage;
