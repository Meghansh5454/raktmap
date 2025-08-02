import React, { useState, useEffect } from 'react';
import { Users, MapPin, Phone, Calendar, Filter, Search, CheckCircle, X, Heart, RefreshCw } from 'lucide-react';
import { Donor } from '../../types';
import axios from 'axios';

interface DonorWithLocation extends Donor {
  rollNo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  responseTime?: string;
  detailedStatus?: string;
  hasLocationData?: boolean;
  matchedBy?: string;
}

export function AvailableDonors() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedResponseStatus, setSelectedResponseStatus] = useState(''); // New filter for response status
  const [donors, setDonors] = useState<DonorWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch donors from API
  const fetchDonors = async () => {
    try {
      setError(null);
      const response = await axios.get('http://localhost:5000/donor-response/available-donors');
      if (response.data.success) {
        setDonors(response.data.donors);
      } else {
        throw new Error(response.data.message || 'Failed to fetch donors');
      }
    } catch (err: any) {
      console.error('Error fetching donors:', err);
      setError(err.message || 'Failed to fetch donors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch donors on component mount
  useEffect(() => {
    fetchDonors();
  }, []);

  // Refresh donors
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
  };

  const bloodGroups = ['A +', 'A -', 'B +', 'B -', 'AB +', 'AB -', 'O +', 'O -'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const distanceRanges = ['0-2km', '2-5km', '5-10km', '10+km'];
  const responseStatuses = [
    { value: '', label: 'All Donors' },
    { value: 'responded', label: 'Location Shared' },
    { value: 'available', label: 'No Location' },
    { value: 'near', label: 'Near (≤5km)' },
    { value: 'far', label: 'Far (>5km)' }
  ];

  const getStatusColor = (status: string, hasLocation?: boolean, distance?: number) => {
    if (hasLocation) {
      if (distance !== null && distance !== undefined) {
        if (distance <= 5) {
          return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        } else {
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
        }
      }
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
    
    switch (status) {
      case 'available':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (donor: DonorWithLocation) => {
    if (donor.hasLocationData) {
      if (donor.distance !== null && donor.distance !== undefined) {
        if (donor.distance <= 5) {
          return 'Near & Ready';
        } else {
          return 'Far but Available';
        }
      }
      return 'Location Shared';
    }
    return 'Not Contacted';
  };

  const handleAction = (donorId: string, action: string) => {
    console.log(`Action ${action} for donor ${donorId}`);
    // Handle donor actions
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.rollNo?.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.phone.toLowerCase().includes(searchValue.toLowerCase());
    const matchesBloodGroup = !selectedBloodGroup || donor.bloodGroup === selectedBloodGroup;
    const matchesDepartment = !selectedDepartment || donor.rollNo?.includes(selectedDepartment);
    
    // Response status filtering
    let matchesResponseStatus = true;
    if (selectedResponseStatus) {
      switch (selectedResponseStatus) {
        case 'responded':
          matchesResponseStatus = donor.hasLocationData === true;
          break;
        case 'available':
          matchesResponseStatus = donor.hasLocationData === false;
          break;
        case 'near':
          matchesResponseStatus = donor.hasLocationData === true && 
                                 donor.distance !== null && 
                                 donor.distance !== undefined && 
                                 donor.distance <= 5;
          break;
        case 'far':
          matchesResponseStatus = donor.hasLocationData === true && 
                                 donor.distance !== null && 
                                 donor.distance !== undefined && 
                                 donor.distance > 5;
          break;
      }
    }
    
    let matchesDistance = true;
    if (selectedDistance && donor.distance !== null && donor.distance !== undefined) {
      const distance = donor.distance;
      switch (selectedDistance) {
        case '0-2km':
          matchesDistance = distance <= 2;
          break;
        case '2-5km':
          matchesDistance = distance > 2 && distance <= 5;
          break;
        case '5-10km':
          matchesDistance = distance > 5 && distance <= 10;
          break;
        case '10+km':
          matchesDistance = distance > 10;
          break;
      }
    }
    
    return matchesSearch && matchesBloodGroup && matchesDepartment && matchesDistance && matchesResponseStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Donors</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{loading ? 'Loading...' : `${filteredDonors.length} found`}</span>
            </div>
            {!loading && (
              <>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{donors.filter(d => d.hasLocationData).length} responded</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>{donors.filter(d => !d.hasLocationData).length} not contacted</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <X className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Loading donors...</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, roll no, or phone..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={selectedResponseStatus}
            onChange={(e) => setSelectedResponseStatus(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {responseStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          <select
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          <select
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Distances</option>
            {distanceRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonors.map((donor) => (
          <div key={donor.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{donor.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {donor.rollNo ? `Roll No: ${donor.rollNo}` : 'No roll number'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{donor.bloodGroup}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status, donor.hasLocationData, donor.distance)}`}>
                  {getStatusLabel(donor)}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {donor.distance !== null && donor.distance !== undefined && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{donor.distance.toFixed(1)}km away</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>{donor.phone}</span>
              </div>
              {donor.address && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{donor.address}</span>
                </div>
              )}
              {donor.responseTime && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Responded: {new Date(donor.responseTime).toLocaleDateString()}</span>
                </div>
              )}
              {donor.hasLocationData && donor.matchedBy && (
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Matched by {donor.matchedBy}</span>
                </div>
              )}
              {!donor.location && (
                <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                  <X className="h-4 w-4 mr-2" />
                  <span>Location not shared</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleAction(donor.id, 'contact')}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Phone className="h-3 w-3" />
                <span>Contact</span>
              </button>
              {donor.location && (
                <button
                  onClick={() => handleAction(donor.id, 'confirm')}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Confirm</span>
                </button>
              )}
              <button
                onClick={() => handleAction(donor.id, 'decline')}
                className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDonors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No donors found matching your criteria</p>
        </div>
      )}
    </div>
  );
}