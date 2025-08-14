import React, { useState } from 'react';
import { Bell, MessageSquare, Heart, CheckCircle, Clock, Filter, MoreVertical } from 'lucide-react';
import { Notification } from '../../types';

export function NotificationCenter() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'SMS Sent Successfully',
      message: '15 donors have been notified about your O- blood request',
      type: 'info',
      createdAt: '2024-01-21T10:30:00Z',
      read: false
    },
    {
      id: '2',
      title: 'Donor Confirmed',
      message: 'John Doe (O-) has confirmed availability for donation',
      type: 'success',
      createdAt: '2024-01-21T09:15:00Z',
      read: false
    },
    {
      id: '3',
      title: 'Blood Request Fulfilled',
      message: 'Your A+ blood request has been successfully fulfilled',
      type: 'success',
      createdAt: '2024-01-20T16:45:00Z',
      read: true
    },
    {
      id: '4',
      title: 'Urgent Request Alert',
      message: 'Emergency B- blood request requires immediate attention',
      type: 'error',
      createdAt: '2024-01-20T14:20:00Z',
      read: true
    },
    {
      id: '5',
      title: 'Donor Response Received',
      message: 'Jane Smith has responded to your blood donation request',
      type: 'info',
      createdAt: '2024-01-20T11:30:00Z',
      read: true
    },
    {
      id: '6',
      title: 'Request Update',
      message: 'Your blood request status has been updated to "In Progress"',
      type: 'warning',
      createdAt: '2024-01-19T15:10:00Z',
      read: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (selectedFilter) {
      case 'unread':
        return !notification.read;
      case 'sms':
        return notification.title.toLowerCase().includes('sms');
      case 'request':
        return notification.title.toLowerCase().includes('request');
      case 'donor':
        return notification.title.toLowerCase().includes('donor');
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={markAllAsRead}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'sms', label: 'SMS', count: notifications.filter(n => n.title.toLowerCase().includes('sms')).length },
            { key: 'request', label: 'Requests', count: notifications.filter(n => n.title.toLowerCase().includes('request')).length },
            { key: 'donor', label: 'Donors', count: notifications.filter(n => n.title.toLowerCase().includes('donor')).length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedFilter === filter.key
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Mark as read
                    </button>
                  )}
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {selectedFilter === 'all' ? 'You\'re all caught up!' : `No ${selectedFilter} notifications`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}