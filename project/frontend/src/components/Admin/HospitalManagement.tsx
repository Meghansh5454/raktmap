import React, { useState } from 'react';
import { Plus, Edit, Eye, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Table } from '../Shared/Table';
import { Modal } from '../Shared/Modal';
import { Hospital } from '../../types';

export function HospitalManagement() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add'>('view');

  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'City Medical Center',
      email: 'contact@citymedical.com',
      phone: '+1 234-567-8901',
      address: '123 Main St, City',
      emergencyContact: '+1 234-567-8902',
      radius: 10,
      status: 'active',
      registeredAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'General Hospital',
      email: 'info@generalhospital.com',
      phone: '+1 234-567-8903',
      address: '456 Oak Ave, City',
      emergencyContact: '+1 234-567-8904',
      radius: 15,
      status: 'pending',
      registeredAt: '2024-01-20',
    },
    {
      id: '3',
      name: 'Emergency Care Center',
      email: 'emergency@carecentre.com',
      phone: '+1 234-567-8905',
      address: '789 Pine St, City',
      emergencyContact: '+1 234-567-8906',
      radius: 8,
      status: 'suspended',
      registeredAt: '2024-01-10',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const columns = [
    { key: 'name' as keyof Hospital, label: 'Hospital Name' },
    { key: 'email' as keyof Hospital, label: 'Email' },
    { key: 'phone' as keyof Hospital, label: 'Phone' },
    {
      key: 'status' as keyof Hospital,
      label: 'Status',
      render: (status: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <span className="ml-1 capitalize">{status}</span>
        </span>
      ),
    },
    {
      key: 'id' as keyof Hospital,
      label: 'Actions',
      render: (_: any, hospital: Hospital) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedHospital(hospital);
              setModalType('view');
              setIsModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedHospital(hospital);
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
      ),
    },
  ];

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    hospital.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hospital Management</h2>
        <button
          onClick={() => {
            setSelectedHospital(null);
            setModalType('add');
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Hospital</span>
        </button>
      </div>

      <Table
        data={filteredHospitals}
        columns={columns}
        searchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'add' ? 'Add Hospital' : modalType === 'edit' ? 'Edit Hospital' : 'Hospital Details'}
        size="lg"
      >
        {selectedHospital && modalType === 'view' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p className="text-gray-900 dark:text-white">{selectedHospital.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="text-gray-900 dark:text-white">{selectedHospital.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <p className="text-gray-900 dark:text-white">{selectedHospital.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
                <p className="text-gray-900 dark:text-white">{selectedHospital.emergencyContact}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <p className="text-gray-900 dark:text-white">{selectedHospital.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Radius</label>
                <p className="text-gray-900 dark:text-white">{selectedHospital.radius} km</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedHospital.status)}`}>
                  {getStatusIcon(selectedHospital.status)}
                  <span className="ml-1 capitalize">{selectedHospital.status}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {(modalType === 'edit' || modalType === 'add') && (
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hospital Name</label>
                <input
                  type="text"
                  defaultValue={selectedHospital?.name || ''}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  defaultValue={selectedHospital?.email || ''}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  defaultValue={selectedHospital?.phone || ''}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</label>
                <input
                  type="tel"
                  defaultValue={selectedHospital?.emergencyContact || ''}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <textarea
                  defaultValue={selectedHospital?.address || ''}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Radius (km)</label>
                <input
                  type="number"
                  defaultValue={selectedHospital?.radius || 10}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  defaultValue={selectedHospital?.status || 'pending'}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {modalType === 'add' ? 'Add Hospital' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}