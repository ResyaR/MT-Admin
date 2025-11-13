"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShippingManagerAuth } from '@/lib/shippingManagerAuth';
import ShippingManagerOrderAPI from '@/lib/shippingManagerOrderApi';

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
      
      // Get orders by zone
      const data = await ShippingManagerOrderAPI.getOrdersByZone(
        manager.zone,
        statusFilter || undefined
      );
      setOrders(data);
    } catch (err) {
      setError(err?.message || 'Gagal memuat orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      delivering: 'bg-purple-100 text-purple-800',
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
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Semua order di zona Anda</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="delivering">Delivering</option>
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
            <p className="text-gray-600 mt-4">Memuat orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">shopping_bag</span>
            <p className="text-gray-600">Belum ada orders di zona Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-500">Termasuk ongkir</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Restaurant</p>
                    <p className="font-semibold text-gray-900">{order.restaurant?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="font-semibold text-gray-900">{order.customerName || order.user?.fullName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone || order.user?.phone || ''}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-900">
                    {order.deliveryAddress}
                    {order.deliveryCity && `, ${order.deliveryCity}`}
                    {order.deliveryProvince && `, ${order.deliveryProvince}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Zona {order.deliveryZone} • {order.deliveryType}
                  </p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.menuName}
                          </span>
                          <span className="text-gray-900 font-semibold">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Catatan:</p>
                    <p className="text-sm text-gray-700">{order.notes}</p>
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

