import React from 'react';
import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">Key metrics and trends for blood requests and donations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-red-100">
          <TrendingUp className="h-8 w-8 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">1,245</div>
          <div className="text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-red-100">
          <Users className="h-8 w-8 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">980</div>
          <div className="text-gray-600">Donors Responded</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-red-100">
          <BarChart2 className="h-8 w-8 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">87%</div>
          <div className="text-gray-600">Fulfillment Rate</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-red-100">
          <Activity className="h-8 w-8 text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">2m 30s</div>
          <div className="text-gray-600">Avg. Response Time</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Request Trends (Last 30 Days)</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          {/* Placeholder for chart */}
          <span>Chart visualization coming soon...</span>
        </div>
      </div>
    </div>
  );
}