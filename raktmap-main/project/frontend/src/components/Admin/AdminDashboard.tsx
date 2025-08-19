import React, { useEffect, useState } from 'react';
import { Building2, Users, Heart, Activity, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { StatsCard } from '../Shared/StatsCard';
import { Chart } from '../Shared/Chart';
import axios from 'axios';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeDonors: 0,
    bloodRequests: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch hospitals and donors in parallel
      const [hospitalsResponse, donorsResponse] = await Promise.all([
        axios.get('http://localhost:5000/hospitals'),
        axios.get('http://localhost:5000/donors')
      ]);

      const hospitals = hospitalsResponse.data.success ? hospitalsResponse.data.hospitals : [];
      const donors = donorsResponse.data || [];

      setStats({
        totalHospitals: hospitals.length,
        activeDonors: donors.length,
        bloodRequests: 28, // This would come from blood requests API
        responseRate: 68 // This would be calculated from donor responses
      });

    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const recentActivity = [
    { id: 1, action: 'New hospital registered', hospital: 'City Medical Center', time: '2 hours ago' },
    { id: 2, action: 'Blood request fulfilled', hospital: 'General Hospital', time: '4 hours ago' },
    { id: 3, action: 'Donor response received', donor: 'John Doe (O+)', time: '6 hours ago' },
    { id: 4, action: 'SMS sent to 15 donors', request: 'Emergency A- request', time: '8 hours ago' },
  ];

  const bloodGroupData = [
    { label: 'O+', value: 245, color: 'bg-red-500' },
    { label: 'A+', value: 189, color: 'bg-blue-500' },
    { label: 'B+', value: 156, color: 'bg-green-500' },
    { label: 'AB+', value: 98, color: 'bg-yellow-500' },
    { label: 'O-', value: 87, color: 'bg-purple-500' },
    { label: 'A-', value: 76, color: 'bg-pink-500' },
    { label: 'B-', value: 65, color: 'bg-indigo-500' },
    { label: 'AB-', value: 34, color: 'bg-gray-500' },
  ];

  const responseRateData = [
    { label: 'Responded', value: 68, color: '#10b981' },
    { label: 'No Response', value: 32, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-700 dark:text-red-300">⚠️ {error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Hospitals"
          value={loading ? '...' : stats.totalHospitals}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Donors"
          value={loading ? '...' : stats.activeDonors}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Blood Requests"
          value={loading ? '...' : stats.bloodRequests}
          icon={Heart}
          trend={{ value: 5, isPositive: false }}
          color="red"
        />
        <StatsCard
          title="Response Rate"
          value={loading ? '...' : `${stats.responseRate}%`}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          title="Donors by Blood Group"
          data={bloodGroupData}
          type="bar"
        />
        <Chart
          title="Donor Response Rate"
          data={responseRateData}
          type="pie"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.hospital || activity.donor || activity.request}
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}