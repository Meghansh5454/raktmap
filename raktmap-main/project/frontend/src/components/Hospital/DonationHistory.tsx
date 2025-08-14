import React, { useState, useEffect } from 'react';
import { History, Download, Calendar, Filter, FileText, Loader } from 'lucide-react';
import { Table } from '../Shared/Table';
import axiosInstance from '../../utils/axios';

interface DonationRecord {
  _id: string;
  date: string;
  bloodGroup: string;
  donorName?: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  hospitalBranch?: string;
  quantity: number;
  urgency: 'high' | 'medium' | 'low';
  description?: string;
  requiredBy?: string;
}

export function DonationHistory() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch donation history from backend
  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch from the public donation history endpoint
      const response = await axiosInstance.get('/donation-history');
      
      if (response.data.success) {
        // Transform the data to match our interface
        const transformedDonations = response.data.bloodRequests.map((request: any) => ({
          _id: request._id,
          date: request.createdAt,
          bloodGroup: request.bloodGroup,
          donorName: 'Multiple Donors', // Since this is a request, not a specific donation
          status: request.status,
          hospitalBranch: 'Main Hospital', // Default value
          quantity: request.quantity,
          urgency: request.urgency,
          description: request.description,
          requiredBy: request.requiredBy
        }));
        
        setDonations(transformedDonations);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch donation history');
      }
    } catch (err: any) {
      console.error('Error fetching donation history:', err);
      setError(err.response?.data?.message || 'Failed to fetch donation history');
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['pending', 'fulfilled', 'cancelled'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
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
    { key: 'donorName' as keyof DonationRecord, label: 'Request Type' },
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
    const matchesSearch = (donation.donorName || '').toLowerCase().includes(searchValue.toLowerCase()) ||
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
    donated: donations.filter(d => d.status === 'fulfilled').length,
    cancelled: donations.filter(d => d.status === 'cancelled').length,
    totalUnits: donations.filter(d => d.status === 'fulfilled').reduce((sum, d) => sum + d.quantity, 0)
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading donation history...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchDonationHistory}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Donation History</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchDonationHistory}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <History className="h-4 w-4" />
            <span>Refresh</span>
          </button>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Fulfilled</p>
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

      {/* Results */}
      {filteredDonations.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No donation records found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search filters</p>
        </div>
      ) : (
        <Table
          data={filteredDonations}
          columns={columns}
          searchable
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />
      )}
    </div>
  );
}