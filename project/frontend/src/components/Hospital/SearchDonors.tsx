import React, { useState } from 'react';
import { Search, MapPin, Phone, Calendar, Filter, Grid, List } from 'lucide-react';
import { Donor } from '../../types';

export function SearchDonors() {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    bloodGroup: '',
    department: '',
    city: '',
    availability: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const donors: Donor[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234-567-8901',
      bloodGroup: 'O-',
      age: 28,
      address: '123 Main St, New York',
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
      address: '456 Oak Ave, Boston',
      lastDonation: '2023-12-20',
      status: 'available',
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
      address: '789 Pine St, Chicago',
      lastDonation: '2024-01-10',
      status: 'unavailable',
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
      address: '321 Elm St, Miami',
      lastDonation: '2023-11-25',
      status: 'available',
      distance: 4.2,
      department: 'HR'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david@example.com',
      phone: '+1 234-567-8905',
      bloodGroup: 'O+',
      age: 35,
      address: '654 Cedar Ave, Seattle',
      lastDonation: '2024-01-05',
      status: 'available',
      distance: 5.1,
      department: 'Finance'
    }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
  const cities = ['New York', 'Boston', 'Chicago', 'Miami', 'Seattle', 'Los Angeles'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.department?.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.address.toLowerCase().includes(searchValue.toLowerCase());
    const matchesBloodGroup = !filters.bloodGroup || donor.bloodGroup === filters.bloodGroup;
    const matchesDepartment = !filters.department || donor.department === filters.department;
    const matchesCity = !filters.city || donor.address.includes(filters.city);
    const matchesAvailability = !filters.availability || donor.status === filters.availability;
    
    return matchesSearch && matchesBloodGroup && matchesDepartment && matchesCity && matchesAvailability;
  });

  const DonorCard = ({ donor }: { donor: Donor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
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
          <span>{donor.address}</span>
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
        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          Contact
        </button>
        <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
          Request
        </button>
      </div>
    </div>
  );

  const DonorListItem = ({ donor }: { donor: Donor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 font-bold">{donor.bloodGroup}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{donor.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{donor.department}</span>
              <span>•</span>
              <span>{donor.address.split(',').pop()?.trim()}</span>
              <span>•</span>
              <span>{donor.phone}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
            {donor.status}
          </span>
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
              Contact
            </button>
            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
              Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Donors</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">{filteredDonors.length} donors found</span>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-600 dark:text-gray-400'} rounded-l-lg transition-colors`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-600 dark:text-gray-400'} rounded-r-lg transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, department, or location..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={filters.bloodGroup}
            onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={filters.availability}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFilters({ bloodGroup: '', department: '', city: '', availability: '' });
              setSearchValue('');
            }}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor) => (
            <DonorCard key={donor.id} donor={donor} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDonors.map((donor) => (
            <DonorListItem key={donor.id} donor={donor} />
          ))}
        </div>
      )}

      {filteredDonors.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No donors found matching your criteria</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}