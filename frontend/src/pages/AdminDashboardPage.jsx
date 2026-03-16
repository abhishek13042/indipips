import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = 'http://localhost:5000/api/v1/admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get(`${API_BASE}/stats`, { withCredentials: true });
      const challengesRes = await axios.get(`${API_BASE}/challenges`, { withCredentials: true });
      
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (challengesRes.data.success) setChallenges(challengesRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { data } = await axios.patch(`${API_BASE}/challenges/${id}/status`, { status: newStatus }, { withCredentials: true });
      if (data.success) {
        alert('Status updated successfully!');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <DashboardLayout><p>Loading Matrix Hub...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Matrix Hub <span className="text-indigo-600">v1.0</span></h1>
          <p className="text-gray-500">Global firm overview and intervention center.</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Traders', value: stats?.totalUsers, color: 'indigo' },
            { label: 'Active Challenges', value: stats?.activeChallenges, color: 'green' },
            { label: 'Failed Challenges', value: stats?.failedChallenges, color: 'rose' },
            { label: 'Total AUM', value: `$${stats?.totalAum.toLocaleString()}`, color: 'emerald' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-black text-${stat.color}-600`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Challenges Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Global Challenge Ledger</h2>
            <button onClick={fetchData} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">Refresh Feed</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-widest">
                  <th className="px-8 py-4">Trader</th>
                  <th className="px-8 py-4">Account Size</th>
                  <th className="px-8 py-4">Balance</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {challenges.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900">{c.user.fullName}</p>
                      <p className="text-xs text-gray-400">{c.user.email}</p>
                    </td>
                    <td className="px-8 py-5 font-mono text-gray-600">${c.accountSize.toLocaleString()}</td>
                    <td className={`px-8 py-5 font-bold ${Number(c.totalPnl) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      ${c.currentBalance.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        c.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        {c.status === 'ACTIVE' && (
                          <button 
                            onClick={() => handleStatusUpdate(c.id, 'FAILED')}
                            className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                          >
                            Terminate
                          </button>
                        )}
                        <button className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                          Audit
                        </button>
                      </div>
                    </td>
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

export default AdminDashboardPage;
