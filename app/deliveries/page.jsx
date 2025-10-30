"use client";

import React, { useState } from "react";
import DeliveriesTable from "@/components/DeliveriesTable";
import DeliveryServicesTable from "@/components/DeliveryServicesTable";

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState('food'); // 'food' or 'services'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries Management</h1>
        <p className="text-gray-600 mt-1">Track and manage all types of deliveries</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('food')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'food'
                ? 'border-[#E00000] text-[#E00000]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">restaurant</span>
              <span>Food Delivery</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'services'
                ? 'border-[#E00000] text-[#E00000]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">local_shipping</span>
              <span>Delivery Services</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'food' ? (
        <DeliveriesTable />
      ) : (
        <DeliveryServicesTable />
      )}
    </div>
  );
}

