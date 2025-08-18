import React, { useState } from 'react';
import { Users, MessageSquare, UserX, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { Table } from '../Shared/Table';
import { Modal } from '../Shared/Modal';
import { Donor } from '../../types';

export function DonorManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit'>('view');

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
      address: '789 Pine St, Chicago',
      lastDonation: '2024-01-10',
      status: 'unavailable',
      distance: 3.1,
      department: 'Sales'
    }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['available', 'responded', 'unavailable'];

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

  const columns = [
    {
      key: 'select' as keyof Donor,
      label: '',
      render: (_: any, donor: Donor) => (
        <input
          type="checkbox"
          checked={selectedDonors.includes(donor.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedDonors([...selectedDonors, donor.id]);
            } else {
              setSelectedDonors(selectedDonors.filter(id => id !== donor.id));
            }
          }}
          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
      )
    },
    { key: 'name' as keyof Donor, label: 'Name' },
    { key: 'bloodGroup' as keyof Donor, label: 'Blood Group' },
    { key: 'phone' as keyof Donor, label: 'Contact' },
    {
      key: 'lastDonation' as keyof Donor,
      label: 'Last Donation',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    { key: 'address' as keyof Donor, label: 'Location' },
    {
      key: 'status' as keyof Donor,
      label: 'Status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      )
    },
    {
      key: 'id' as keyof Donor,
      label: 'Actions',
      render: (_: any, donor: Donor) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedDonor(donor);
              setModalType('view');
              setIsModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedDonor(donor);
              setModalType('edit');
              setIsModalOpen(true);
            }}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.email.toLowerCase().includes(searchValue.toLowerCase()) ||
                         donor.phone.includes(searchValue);
    const matchesBloodGroup = !selectedBloodGroup || donor.bloodGroup === selectedBloodGroup;
    const matchesStatus = !selectedStatus || donor.status === selectedStatus;
    
    return matchesSearch && matchesBloodGroup && matchesStatus;
  });

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} for donors:`, selectedDonors);
    // Handle bulk actions
  };

  const handleSelectAll = () => {
    if (selectedDonors.length === filteredDonors.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(filteredDonors.map(donor => donor.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Donor Management</h2>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{donors.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-green-600">{donors.filter(d => d.status === 'available').length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Responded</p>
              <p className="text-2xl font-bold text-blue-600">{donors.filter(d => d.status === 'responded').length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500"></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unavailable</p>
              <p className="text-2xl font-bold text-red-600">{donors.filter(d => d.status === 'unavailable').length}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500"></div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {selectedDonors.length > 0 && (
            <div className="flex space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                {selectedDonors.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('sms')}
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Send SMS</span>
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                <UserX className="h-3 w-3" />
                <span>Deactivate</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table with Select All */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedDonors.length === filteredDonors.length && filteredDonors.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Select All</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search donors..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <Table
          data={filteredDonors}
          columns={columns}
        />
      </div>

      {/* Donor Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'view' ? 'Donor Details' : 'Edit Donor'}
        size="lg"
      >
        {selectedDonor && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                {modalType === 'view' ? (
                  <p className="text-gray-900 dark:text-white">{selectedDonor.name}</p>
                ) : (
                  <input
                    type="text"
                    defaultValue={selectedDonor.name}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
                {modalType === 'view' ? (
                  <p className="text-gray-900 dark:text-white">{selectedDonor.bloodGroup}</p>
                ) : (
                  <select
                    defaultValue={selectedDonor.bloodGroup}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                {modalType === 'view' ? (
                  <p className="text-gray-900 dark:text-white">{selectedDonor.email}</p>
                ) : (
                  <input
                    type="email"
                    defaultValue={selectedDonor.email}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                {modalType === 'view' ? (
                  <p className="text-gray-900 dark:text-white">{selectedDonor.phone}</p>
                ) : (
                  <input
                    type="tel"
                    defaultValue={selectedDonor.phone}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                {modalType === 'view' ? (
                  <p className="text-gray-900 dark:text-white">{selectedDonor.address}</p>
                ) : (
                  <textarea
                    defaultValue={selectedDonor.address}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
            
            {modalType === 'edit' && (
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}