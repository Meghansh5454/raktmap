import React, { useEffect } from 'react';
import { Building2, Users, Heart, Activity, TrendingUp, Clock } from 'lucide-react';
import { StatsCard } from '../Shared/StatsCard';
import { Chart } from '../Shared/Chart';


export function AdminDashboard() {
  // Remove localStorage token check
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     window.location.href = '/login';
  //   }
  // }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Hospitals"
          value={45}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Active Donors"
          value={1250}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Blood Requests"
          value={89}
          icon={Heart}
          trend={{ value: 5, isPositive: false }}
          color="red"
        />
        <StatsCard
          title="Response Rate"
          value="68%"
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