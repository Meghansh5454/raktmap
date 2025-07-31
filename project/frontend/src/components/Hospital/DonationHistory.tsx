import React, { useState } from 'react';
import { History, Download, Calendar, Filter, FileText } from 'lucide-react';
import { Table } from '../Shared/Table';

interface DonationRecord {
  id: string;
  date: string;
  bloodGroup: string;
  donorName: string;
  status: 'donated' | 'cancelled' | 'pending';
  hospitalBranch?: string;
  quantity: number;
  urgency: 'high' | 'medium' | 'low';
}

export function DonationHistory() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const donations: DonationRecord[] = [
    {
      id: '1',
      date: '2024-01-20',
      bloodGroup: 'O-',
      donorName: 'John Doe',
      status: 'donated',
      hospitalBranch: 'Main Branch',
      quantity: 2,
      urgency: 'high'
    },
    {
      id: '2',
      date: '2024-01-18',
      bloodGroup: 'A+',
      donorName: 'Jane Smith',
      status: 'donated',
      hospitalBranch: 'Main Branch',
      quantity: 1,
      urgency: 'medium'
    },
    {
      id: '3',
      date: '2024-01-15',
      bloodGroup: 'B+',
      donorName: 'Mike Johnson',
      status: 'cancelled',
      hospitalBranch: 'Main Branch',
      quantity: 3,
      urgency: 'low'
    },
    {
      id: '4',
      date: '2024-01-12',
      bloodGroup: 'AB+',
      donorName: 'Sarah Wilson',
      status: 'donated',
      hospitalBranch: 'Emergency Wing',
      quantity: 1,
      urgency: 'high'
    }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['donated', 'cancelled', 'pending'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'donated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

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

  const columns = [
    {
      key: 'date' as keyof DonationRecord,
      label: 'Date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    { key: 'bloodGroup' as keyof DonationRecord, label: 'Blood Group' },
    { key: 'donorName' as keyof DonationRecord, label: 'Donor Name' },
    {
      key: 'quantity' as keyof DonationRecord,
      label: 'Quantity',
      render: (quantity: number) => `${quantity} units`
    },
    {
      key: 'urgency' as keyof DonationRecord,
      label: 'Urgency',
      render: (urgency: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
          {urgency}
        </span>
      )
    },
    {
      key: 'status' as keyof DonationRecord,
      label: 'Status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      )
    },
    { key: 'hospitalBranch' as keyof DonationRecord, label: 'Branch' }
  ];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donorName.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donation.bloodGroup.toLowerCase().includes(searchValue.toLowerCase());
    const matchesBloodGroup = !selectedBloodGroup || donation.bloodGroup === selectedBloodGroup;
    const matchesStatus = !selectedStatus || donation.status === selectedStatus;
    
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const donationDate = new Date(donation.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = donationDate >= startDate && donationDate <= endDate;
    }
    
    return matchesSearch && matchesBloodGroup && matchesStatus && matchesDateRange;
  });

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting ${format.toUpperCase()}...`);
    // Handle export functionality
  };

  const stats = {
    total: donations.length,
    donated: donations.filter(d => d.status === 'donated').length,
    cancelled: donations.filter(d => d.status === 'cancelled').length,
    totalUnits: donations.filter(d => d.status === 'donated').reduce((sum, d) => sum + d.quantity, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Donation History</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <History className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              <p className="text-2xl font-bold text-green-600">{stats.donated}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">✕</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Units</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUnits}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">🩸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Groups</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedBloodGroup('');
                setSelectedStatus('');
                setDateRange({ start: '', end: '' });
                setSearchValue('');
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredDonations}
        columns={columns}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
    </div>
  );
}