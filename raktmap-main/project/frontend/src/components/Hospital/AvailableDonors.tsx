import React, { useState, useEffect } from 'react';
import { Users, MapPin, Phone, Calendar, Search, CheckCircle, X, RefreshCw, Plus } from 'lucide-react';
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

interface BloodRequest {
  _id: string;
  bloodGroup: string;
  quantity: number;
  urgency: string;
  status: string;
  createdAt: string;
}

export function AvailableDonors() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<string>('all'); // Only blood request filter
  const [donors, setDonors] = useState<DonorWithLocation[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    donorId: '',
    donorName: '',
    donorPhone: '',
    donorBloodGroup: '',
    donationDate: '',
    notes: ''
  });

  // Blood group compatibility function
  const getCompatibleBloodGroups = (requestedBloodGroup: string): string[] => {
    // This returns which donor blood groups can give to the requested blood group
    const compatibility: { [key: string]: string[] } = {
      'A+': ['A+', 'A-', 'O+', 'O-'],        // A+ can receive from A+, A-, O+, O-
      'A-': ['A-', 'O-'],                     // A- can receive from A-, O-
      'B+': ['B+', 'B-', 'O+', 'O-'],        // B+ can receive from B+, B-, O+, O-
      'B-': ['B-', 'O-'],                     // B- can receive from B-, O-
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // AB+ can receive from everyone (universal recipient)
      'AB-': ['A-', 'B-', 'AB-', 'O-'],      // AB- can receive from A-, B-, AB-, O-
      'O+': ['O+', 'O-'],                     // O+ can receive from O+, O-
      'O-': ['O-']                            // O- can only receive from O- (universal donor to others, but restrictive recipient)
    };
    
    return compatibility[requestedBloodGroup] || [];
  };

  // Fetch blood requests from hospital
  const fetchBloodRequests = async () => {
    try {
      console.log('=== FETCHING BLOOD REQUESTS FOR AVAILABLE DONORS ===');
      const response = await axios.get('http://localhost:5000/blood-requests/hospital', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Blood requests response:', response.data);
      
      if (response.data.success) {
        // Add "All Donors" as first option
        const allDonorsOption: BloodRequest = {
          _id: 'all',
          bloodGroup: 'All Donors',
          quantity: 0,
          urgency: 'info',
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        const updatedRequests = [allDonorsOption, ...response.data.bloodRequests];
        setBloodRequests(updatedRequests);
      }
    } catch (error: any) {
      console.error('Error fetching blood requests:', error);
      // Fallback to mock data for development with test requests
      const mockRequests: BloodRequest[] = [
        {
          _id: 'all',
          bloodGroup: 'All Donors',
          quantity: 0,
          urgency: 'info',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        // Add test requests to demonstrate filtering
        {
          _id: 'test-o-negative',
          bloodGroup: 'O-',
          quantity: 1,
          urgency: 'high',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'test-a-positive',
          bloodGroup: 'A+',
          quantity: 2,
          urgency: 'medium',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'test-b-negative',
          bloodGroup: 'B-',
          quantity: 1,
          urgency: 'low',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      setBloodRequests(mockRequests);
    }
  };

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

  // Fetch donation history
  const fetchDonationHistory = async () => {
    try {
      // Get hospital ID from token or localStorage
      const hospitalId = localStorage.getItem('hospitalId') || '676a02e52a63ad1b45ed0ac9'; // Default hospital ID
      
      const response = await axios.get(`http://localhost:5000/donation-history/donation-history/${hospitalId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setDonationHistory(response.data.donationHistory);
        console.log(`Fetched ${response.data.donationHistory.length} donation history records`);
      } else {
        console.error('Failed to fetch donation history:', response.data.message);
      }
    } catch (error: any) {
      console.error('Error fetching donation history:', error);
    }
  };

  // Fetch donors on component mount and blood requests
  useEffect(() => {
    const initializeData = async () => {
      await fetchBloodRequests();
      await fetchDonors();
      await fetchDonationHistory();
    };
    initializeData();
  }, []);

  // Refresh donors
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDonors();
  };

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

  const handleAction = async (donorId: string, action: string) => {
    console.log(`Action ${action} for donor ${donorId}`);
    
    if (action === 'contact') {
      // Handle contact action - open phone dialer
      const donor = donors.find(d => d.id === donorId || d.email === donorId);
      if (donor) {
        // Open phone dialer
        window.open(`tel:${donor.phone}`, '_self');
      }
    } else if (action === 'decline') {
      // Handle decline action
      console.log('Donor declined - this could update their status in the future');
    }
  };

  // Add manual donation entry
  const addManualDonation = async () => {
    if (!manualEntry.donorName || !manualEntry.donorPhone || !manualEntry.donorBloodGroup || !manualEntry.donationDate) {
      alert('Please fill all required fields');
      return;
    }

    if (selectedRequest === 'all') {
      alert('Please select a specific blood request for this donation');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/donation-history/accept-donor', {
        donorId: manualEntry.donorId || manualEntry.donorPhone, // Use phone as ID if no donorId
        bloodRequestId: selectedRequest,
        donorName: manualEntry.donorName,
        donorPhone: manualEntry.donorPhone,
        donorBloodGroup: manualEntry.donorBloodGroup,
        location: { lat: 22.6013, lng: 72.8327 }, // Hospital location
        address: 'Manual entry - Hospital location',
        status: 'completed', // Mark as completed since donation already happened
        acceptedAt: new Date(manualEntry.donationDate),
        completedAt: new Date(manualEntry.donationDate),
        notes: manualEntry.notes
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        alert(`Successfully added donation record for ${manualEntry.donorName}!`);
        await fetchDonationHistory(); // Refresh donation history
        
        // Reset form
        setManualEntry({
          donorId: '',
          donorName: '',
          donorPhone: '',
          donorBloodGroup: '',
          donationDate: '',
          notes: ''
        });
        setShowManualEntry(false);
      } else {
        throw new Error(response.data.message || 'Failed to add donation record');
      }
      
    } catch (error: any) {
      console.error('Error adding manual donation:', error);
      alert(`Failed to add donation record: ${error.response?.data?.message || error.message}`);
    }
  };

  const filteredDonors = donors.filter(donor => {
    // Basic search filter
    const matchesSearch = donor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.rollNo?.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.phone.toLowerCase().includes(searchValue.toLowerCase());
    
    // Response filtering based on selected request
    let shouldShowDonor = true;
    
    if (selectedRequest === 'all') {
      // "All Donors" - show everyone (responded + not contacted)
      shouldShowDonor = true;
    } else {
      // Specific blood request selected - ONLY show donors who have responded
      const hasResponded = donor.hasLocationData === true;
      
      // Blood request compatibility filtering - ONLY for responded donors
      let matchesBloodRequest = true;
      const selectedBloodRequest = bloodRequests.find(req => req._id === selectedRequest);
      if (selectedBloodRequest) {
        const compatibleGroups = getCompatibleBloodGroups(selectedBloodRequest.bloodGroup);
        const donorBloodGroup = donor.bloodGroup?.replace(/\s+/g, '') || 'Unknown'; // Normalize spaces
        matchesBloodRequest = compatibleGroups.includes(donorBloodGroup);
        console.log(`🩸 FILTERING: Donor ${donor.name} (${donorBloodGroup}) responded: ${hasResponded}, compatible with request ${selectedBloodRequest.bloodGroup}?`, matchesBloodRequest);
        console.log(`Compatible groups for ${selectedBloodRequest.bloodGroup}:`, compatibleGroups);
      }
      
      // For specific requests: must have responded AND be blood compatible
      shouldShowDonor = hasResponded && matchesBloodRequest;
    }
    
    // Must match search AND meet the response/request criteria
    return matchesSearch && shouldShowDonor;
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
            onClick={() => setShowManualEntry(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Donation</span>
          </button>
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

      {/* Search and Blood Request Filter - SIMPLIFIED */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Box */}
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
          
          {/* Blood Request Filter - ONLY FILTER */}
          <select
            value={selectedRequest}
            onChange={(e) => setSelectedRequest(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {bloodRequests.map((request) => (
              <option key={request._id} value={request._id}>
                {request._id === 'all' ? 'All Donors' : `${request.bloodGroup} - ${new Date(request.createdAt).toLocaleDateString()}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Donor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonors.map((donor) => (
          <div key={donor.email || donor.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{donor.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {donor.rollNo ? `Roll No: ${donor.rollNo}` : 'No roll number'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{donor.bloodGroup}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status || '', donor.hasLocationData, donor.distance)}`}>
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
                onClick={() => handleAction(donor.email || donor.id || '', 'contact')}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Phone className="h-3 w-3" />
                <span>Contact</span>
              </button>
              <button
                onClick={() => handleAction(donor.email || donor.id || '', 'decline')}
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

      {/* Donation History Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Donation History</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{donationHistory.length} donations recorded</span>
          </div>
        </div>

        {donationHistory.length > 0 ? (
          <div className="space-y-3">
            {donationHistory.map((history) => (
              <div key={history._id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{history.donorName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group: <span className="font-semibold text-red-600">{history.donorBloodGroup}</span></p>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      history.status === 'completed' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {history.status === 'completed' ? '✓ Donated' : '✓ Accepted'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {history.status === 'completed' && history.completedAt
                        ? `${new Date(history.completedAt).toLocaleDateString()} at ${new Date(history.completedAt).toLocaleTimeString()}`
                        : `${new Date(history.acceptedAt).toLocaleDateString()} at ${new Date(history.acceptedAt).toLocaleTimeString()}`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>📞 {history.donorPhone}</span>
                    {history.bloodRequestId?.bloodGroup && (
                      <span>🩸 For: {history.bloodRequestId.bloodGroup} request</span>
                    )}
                  </div>
                  <span className="text-xs">
                    📍 {history.address || 'Location shared'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No donation records yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the "Add Donation" button above to manually record completed donations
            </p>
          </div>
        )}
      </div>

      {/* Manual Donation Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Donation Record</h3>
              <button
                onClick={() => setShowManualEntry(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Donor Name *
                </label>
                <input
                  type="text"
                  value={manualEntry.donorName}
                  onChange={(e) => setManualEntry(prev => ({...prev, donorName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter donor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={manualEntry.donorPhone}
                  onChange={(e) => setManualEntry(prev => ({...prev, donorPhone: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Blood Group *
                </label>
                <select
                  value={manualEntry.donorBloodGroup}
                  onChange={(e) => setManualEntry(prev => ({...prev, donorBloodGroup: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Donation Date *
                </label>
                <input
                  type="date"
                  value={manualEntry.donationDate}
                  onChange={(e) => setManualEntry(prev => ({...prev, donationDate: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={manualEntry.notes}
                  onChange={(e) => setManualEntry(prev => ({...prev, notes: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>

              {selectedRequest === 'all' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Please select a specific blood request above to associate this donation with.
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowManualEntry(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addManualDonation}
                disabled={!manualEntry.donorName || !manualEntry.donorPhone || !manualEntry.donorBloodGroup || !manualEntry.donationDate || selectedRequest === 'all'}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Donation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}