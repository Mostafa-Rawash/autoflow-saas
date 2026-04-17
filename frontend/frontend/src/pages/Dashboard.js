import React, { useState, useEffect } from 'react';

console.log('📄 Dashboard.js file loaded');

const Dashboard = () => {
  console.log('🚀 Dashboard component function called');
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('📊 Dashboard useEffect running');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token ? 'exists' : 'missing');
      
      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://52.249.222.161:5000/api/conversations/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log('📊 API Result:', result);
      setData(result);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Error: {error}</h1>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {data && data.success && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-gray-400">Total Conversations</p>
            <p className="text-3xl font-bold">{data.conversations?.total || 0}</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-gray-400">Active</p>
            <p className="text-3xl font-bold">{data.conversations?.active || 0}</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-gray-400">Resolved</p>
            <p className="text-3xl font-bold">{data.conversations?.resolved || 0}</p>
          </div>
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-gray-400">Total Messages</p>
            <p className="text-3xl font-bold">{data.messages?.total || 0}</p>
          </div>
        </div>
      )}

      <button 
        onClick={fetchData} 
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default Dashboard;