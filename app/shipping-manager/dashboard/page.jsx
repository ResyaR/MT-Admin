"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingManagerAuth } from '@/lib/shippingManagerAuth';
import ShippingManagerDeliveryAPI from '@/lib/shippingManagerDeliveryApi';

export default function ShippingManagerDashboard() {
  const router = useRouter();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    delivering: 0,
    delivered: 0,
  });

  useEffect(() => {
    if (!ShippingManagerAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const managerData = ShippingManagerAuth.getManagerData();
    setManager(managerData);
    loadStats(managerData);
    setLoading(false);
  }, [router]);

  const loadStats = async (managerData) => {
    try {
      const deliveries = await ShippingManagerDeliveryAPI.getDeliveriesByZone(managerData.zone);
      const statsData = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'pending').length,
        preparing: deliveries.filter(d => d.status === 'accepted' || d.status === 'picked_up').length,
        delivering: deliveries.filter(d => d.status === 'in_transit').length,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Set default stats on error
      setStats({
        total: 0,
        pending: 0,
        preparing: 0,
        delivering: 0,
        delivered: 0,
      });
    }
  };

  const handleLogout = () => {
    ShippingManagerAuth.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selamat Datang, {manager?.name}!
          </h2>
          <p className="text-gray-600">
            Zona: <span className="font-semibold">Zona {manager?.zone}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pengiriman</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-blue-500">
                local_shipping
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-yellow-500">
                pending
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Diproses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.preparing}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-blue-500">
                inventory_2
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dalam Perjalanan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivering}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-purple-500">
                local_shipping
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Terkirim</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-green-500">
                check_circle
              </span>
            </div>
          </div>
        </div>

        {/* Manager Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Akun</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nama:</span>
              <span className="font-semibold">{manager?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{manager?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{manager?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Zona:</span>
              <span className="font-semibold">Zona {manager?.zone}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

