"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingManagerAuth } from '@/lib/shippingManagerAuth';
import ShippingManagerDeliveryAPI from '@/lib/shippingManagerDeliveryApi';

export default function ShippingManagerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!ShippingManagerAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadOrders();
  }, [router, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const manager = ShippingManagerAuth.getManagerData();
      
      console.log('[OrdersPage] Loading deliveries for manager:', manager);
      
      if (!manager || !manager.zone) {
        throw new Error('Manager data tidak ditemukan');
      }
      
      console.log(`[OrdersPage] Fetching deliveries for zone ${manager.zone}${statusFilter ? ` with status ${statusFilter}` : ''}`);
      
      // Get deliveries by zone
      const data = await ShippingManagerDeliveryAPI.getDeliveriesByZone(
        manager.zone,
        statusFilter || undefined
      );
      
      console.log(`[OrdersPage] Received ${data?.length || 0} deliveries:`, data);
      setOrders(data || []);
    } catch (err) {
      console.error('[OrdersPage] Error loading deliveries:', err);
      setError(err?.message || 'Gagal memuat pengiriman');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengiriman</h1>
              <p className="text-gray-600 mt-1">Semua pengiriman di zona Anda</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat pengiriman...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">local_shipping</span>
            <p className="text-gray-600">Belum ada pengiriman di zona Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((delivery) => (
              <div key={delivery.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Pengiriman #{delivery.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(delivery.createdAt)}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{delivery.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(delivery.price)}</p>
                    <p className="text-xs text-gray-500">Total biaya</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="font-semibold text-gray-900">{delivery.user?.fullName || delivery.user?.email || 'N/A'}</p>
                  </div>
                  {delivery.deliveryZone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Zona</p>
                      <p className="font-semibold text-gray-900">Zona {delivery.deliveryZone}</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Alamat Penjemputan</p>
                  <p className="text-sm text-gray-900">{delivery.pickupLocation}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Alamat Tujuan</p>
                  <p className="text-sm text-gray-900">{delivery.dropoffLocation}</p>
                  {delivery.scheduledDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Jadwal: {new Date(delivery.scheduledDate).toLocaleDateString('id-ID')} {delivery.scheduleTimeSlot}
                    </p>
                  )}
                </div>

                {delivery.barang && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Barang</p>
                    <p className="text-sm text-gray-900">{delivery.barang.itemName} ({delivery.barang.scale})</p>
                  </div>
                )}

                {delivery.packageDetails && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Detail Paket</p>
                    <div className="text-sm text-gray-900 space-y-1">
                      <p>Berat: {delivery.packageDetails.weight} kg</p>
                      <p>Dimensi: {delivery.packageDetails.length} x {delivery.packageDetails.width} x {delivery.packageDetails.height} cm</p>
                      {delivery.packageDetails.category && <p>Kategori: {delivery.packageDetails.category}</p>}
                      {delivery.packageDetails.isFragile && <p className="text-red-600">⚠️ Mudah Pecah</p>}
                      {delivery.packageDetails.requiresHelper && <p className="text-blue-600">👷 Perlu Bantuan</p>}
                    </div>
                  </div>
                )}

                {delivery.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-700">{delivery.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
