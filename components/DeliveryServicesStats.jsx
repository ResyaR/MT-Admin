"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function DeliveryServicesStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completedToday: 0,
    todayRevenue: 0,
    byType: {},
    byStatus: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await AdminAPI.getDeliveryStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Deliveries */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <span className="material-symbols-outlined text-blue-600 text-2xl">
              local_shipping
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
        <p className="text-3xl font-bold text-gray-900">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            stats.total.toLocaleString()
          )}
        </p>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <span className="material-symbols-outlined text-orange-600 text-2xl">
              pending_actions
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Active Deliveries</p>
        <p className="text-3xl font-bold text-gray-900">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            stats.active.toLocaleString()
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">Pending, Accepted, In Transit</p>
      </div>

      {/* Completed Today */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <span className="material-symbols-outlined text-green-600 text-2xl">
              check_circle
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Completed Today</p>
        <p className="text-3xl font-bold text-gray-900">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            stats.completedToday.toLocaleString()
          )}
        </p>
      </div>

      {/* Revenue Today */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-[#E00000] bg-opacity-10 rounded-lg">
            <span className="material-symbols-outlined text-[#E00000] text-2xl">
              payments
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Revenue Today</p>
        <p className="text-2xl font-bold text-gray-900">
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            formatCurrency(stats.todayRevenue)
          )}
        </p>
      </div>
    </div>
  );
}

