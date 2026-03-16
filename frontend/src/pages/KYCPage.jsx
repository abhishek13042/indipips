import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const KYCPage = () => {
  const [kycStatus, setKycStatus] = useState(null);
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = 'http://localhost:5000/api/v1';

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/kyc/status`, { withCredentials: true });
      if (data.success) {
        setKycStatus(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch KYC status');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAadhaarSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.post(`${API_BASE}/kyc/aadhaar`, { aadhaarNumber: aadhaar }, { withCredentials: true });
      if (data.success) {
        setMessage('Aadhaar verified successfully!');
        fetchStatus();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data } = await axios.post(`${API_BASE}/kyc/pan`, { panNumber: pan }, { withCredentials: true });
      if (data.success) {
        setMessage('PAN verified and KYC completed!');
        fetchStatus();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Identity Verification (KYC)</h1>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Aadhaar Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
              Aadhaar Verification
            </h2>
            {kycStatus?.aadhaarVerified ? (
              <div className="flex items-center text-green-600 font-medium">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified
              </div>
            ) : (
              <form onSubmit={handleAadhaarSubmit}>
                <p className="text-gray-600 text-sm mb-4">Enter your 12-digit Aadhaar number for instant verification.</p>
                <input
                  type="text"
                  placeholder="12 Digit Aadhaar"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  maxLength={12}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Aadhaar'}
                </button>
              </form>
            )}
          </div>

          {/* PAN Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
              PAN Card Verification
            </h2>
            {kycStatus?.kycStatus === 'VERIFIED' ? (
              <div className="flex items-center text-green-600 font-medium">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Verified ({kycStatus.panNumber})
              </div>
            ) : (
              <form onSubmit={handlePanSubmit}>
                <p className="text-gray-600 text-sm mb-4">Enter your 10-character PAN number to complete your profile.</p>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full p-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  maxLength={10}
                />
                <button
                  type="submit"
                  disabled={loading || !kycStatus?.aadhaarVerified}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {!kycStatus?.aadhaarVerified ? 'Complete Step 1 First' : (loading ? 'Verifying...' : 'Verify PAN')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 p-6 bg-indigo-50 rounded-2xl">
          <h3 className="text-indigo-900 font-semibold mb-2">Why is KYC required?</h3>
          <p className="text-indigo-700 text-sm">
            As a professional prop firm, we must verify the identity of our traders to prevent fraud, comply with AML (Anti-Money Laundering) regulations, and ensure that payouts reach the correct bank accounts.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KYCPage;
