
import React from 'react';
import { Map } from 'lucide-react';

const LiveDonorMap = () => (
  <div className="space-y-8">
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Live Donor Response Map</h2>
      <p className="text-gray-600">Real-time visualization of donor responses with location clustering</p>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-100">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-12 text-center border-2 border-dashed border-blue-300">
        <Map className="h-16 w-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-blue-800 mb-2">Interactive Response Map</h3>
        <p className="text-blue-600 mb-6">Real-time donor locations with response status and zone clustering</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-green-800">Responded</p>
            <p className="text-green-600">45 donors</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-yellow-800">SMS Clicked</p>
            <p className="text-yellow-600">23 donors</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-blue-800">Location Shared</p>
            <p className="text-blue-600">18 donors</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
            <p className="font-medium text-red-800">No Response</p>
            <p className="text-red-600">12 donors</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export { LiveDonorMap };