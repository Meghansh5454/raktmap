import React from 'react';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'success', message: 'Blood request fulfilled for City Hospital', time: '2 min ago' },
  { id: 2, type: 'warning', message: 'Low donor response for Metro Hospital', time: '10 min ago' },
  { id: 3, type: 'info', message: 'New donor registered: Jane Doe', time: '30 min ago' },
];

export function Notifications() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Notifications Center</h2>
        <p className="text-gray-600">Recent system alerts and updates</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
        <ul className="divide-y divide-gray-100">
          {mockNotifications.map((notif) => (
            <li key={notif.id} className="py-4 flex items-center space-x-4">
              {notif.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {notif.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              {notif.type === 'info' && <Bell className="h-5 w-5 text-blue-600" />}
              <div>
                <div className="text-gray-900">{notif.message}</div>
                <div className="text-xs text-gray-500">{notif.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}