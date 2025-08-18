import React from 'react';
import { Heart, Users, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import { StatsCard } from '../Shared/StatsCard';

export function HospitalDashboard() {
  const recentRequests = [
    { id: 1, bloodGroup: 'O-', quantity: 2, status: 'fulfilled', requestedAt: '2024-01-20', urgency: 'high' },
    { id: 2, bloodGroup: 'A+', quantity: 3, status: 'pending', requestedAt: '2024-01-21', urgency: 'medium' },
    { id: 3, bloodGroup: 'B+', quantity: 1, status: 'pending', requestedAt: '2024-01-21', urgency: 'low' },
  ];

  const respondingDonors = [
    { id: 1, name: 'John Doe', bloodGroup: 'O-', distance: '2.3 km', phone: '+1 234-567-8901', status: 'confirmed' },
    { id: 2, name: 'Jane Smith', bloodGroup: 'A+', distance: '1.8 km', phone: '+1 234-567-8902', status: 'responded' },
    { id: 3, name: 'Mike Johnson', bloodGroup: 'B+', distance: '3.1 km', phone: '+1 234-567-8903', status: 'contacted' },
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Requests"
          value={2}
          icon={Heart}
          color="red"
        />
        <StatsCard
          title="Available Donors"
          value={23}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Completed This Month"
          value={15}
          icon={CheckCircle}
          trend={{ value: 20, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Response Time"
          value="12 min"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Blood Requests</h3>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">{request.bloodGroup}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.quantity} units • {request.requestedAt}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'fulfilled' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Responding Donors</h3>
          <div className="space-y-4">
            {respondingDonors.map((donor) => (
              <div key={donor.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">{donor.name}</span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">{donor.bloodGroup}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      {donor.distance}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-3 w-3 mr-1" />
                      {donor.phone}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
                  {donor.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg text-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Emergency Request</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Send urgent blood request</p>
          </button>
          <button className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">View Donors</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Browse available donors</p>
          </button>
          <button className="p-4 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg text-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Live Map</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track donor locations</p>
          </button>
        </div>
      </div>
    </div>
  );
}