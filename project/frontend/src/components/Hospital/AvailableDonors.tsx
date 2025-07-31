import React, { useState } from 'react';
import { Users, MapPin, Phone, Calendar, Filter, Search, CheckCircle, X, Heart } from 'lucide-react';
import { Donor } from '../../types';

export function AvailableDonors() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const donors: Donor[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234-567-8901',
      bloodGroup: 'O-',
      age: 28,
      address: '123 Main St',
      lastDonation: '2024-01-15',
      status: 'available',
      distance: 2.3,
      department: 'Engineering'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 234-567-8902',
      bloodGroup: 'A+',
      age: 32,
      address: '456 Oak Ave',
      lastDonation: '2023-12-20',
      status: 'responded',
      distance: 1.8,
      department: 'Marketing'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 234-567-8903',
      bloodGroup: 'B+',
      age: 25,
      address: '789 Pine St',
      lastDonation: '2024-01-10',
      status: 'available',
      distance: 3.1,
      department: 'Sales'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1 234-567-8904',
      bloodGroup: 'AB+',
      age: 29,
      address: '321 Elm St',
      lastDonation: '2023-11-25',
      status: 'unavailable',
      distance: 4.2,
      department: 'HR'
    }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const distanceRanges = ['0-2km', '2-5km', '5-10km', '10+km'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleAction = (donorId: string, action: string) => {
    console.log(`Action ${action} for donor ${donorId}`);
    // Handle donor actions
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.department?.toLowerCase().includes(searchValue.toLowerCase());
    const matchesBloodGroup = !selectedBloodGroup || donor.bloodGroup === selectedBloodGroup;
    const matchesDepartment = !selectedDepartment || donor.department === selectedDepartment;
    
    let matchesDistance = true;
    if (selectedDistance) {
      const distance = donor.distance || 0;
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
    
    return matchesSearch && matchesBloodGroup && matchesDepartment && matchesDistance;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Donors</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{filteredDonors.length} donors found</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or department..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
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
                <p className="text-sm text-gray-600 dark:text-gray-400">{donor.department}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{donor.bloodGroup}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
                  {donor.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{donor.distance}km away</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>{donor.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Last donation: {new Date(donor.lastDonation).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleAction(donor.id, 'contact')}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Phone className="h-3 w-3" />
                <span>Contact</span>
              </button>
              <button
                onClick={() => handleAction(donor.id, 'confirm')}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Confirm</span>
              </button>
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