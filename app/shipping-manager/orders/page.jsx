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
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (!ShippingManagerAuth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadOrders();
    setCurrentPage(1); // Reset to first page when filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const manager = ShippingManagerAuth.getManagerData();
      
      if (!manager || !manager.zone) {
        throw new Error('Manager data tidak ditemukan');
      }
      
      // Get deliveries by zone
      const data = await ShippingManagerDeliveryAPI.getDeliveriesByZone(
        manager.zone,
        statusFilter || undefined
      );
      
      setOrders(data || []);
    } catch (err) {
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

  const getAllValidStatuses = (currentStatus) => {
    // Shipping manager can change to any status except cancelled (cancelled is handled separately)
    // Allow changing to any status for flexibility in tracking
    const allStatuses = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered'];
    
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return []; // Cannot change from delivered or cancelled
    }
    
    // Return all statuses except current status
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Diterima',
      picked_up: 'Diambil',
      in_transit: 'Dalam Perjalanan',
      delivered: 'Terkirim',
      cancelled: 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const handleUpdateStatus = async (deliveryId, newStatus) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi "${getStatusLabel(newStatus)}"?`)) {
      return;
    }

    try {
      setUpdatingStatus(deliveryId);
      setError('');
      setSuccessMessage('');
      
      // Optimistic update - update UI immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === deliveryId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Update in backend
      await ShippingManagerDeliveryAPI.updateStatus(deliveryId, newStatus);
      
      setSuccessMessage('Status berhasil diupdate!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reload orders to ensure data is in sync
      await loadOrders();
    } catch (err) {
      // Revert optimistic update on error
      await loadOrders();
      setError(err?.message || 'Gagal mengupdate status');
    } finally {
      setUpdatingStatus(null);
    }
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

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
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
          <>
            {/* Items Per Page Selector */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Tampilkan:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per halaman</span>
              </div>
              <div className="text-sm text-gray-600">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, orders.length)} dari {orders.length} pengiriman
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kode Resi</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat Penjemputan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat Tujuan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jenis</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-mono font-bold text-gray-900">
                            {delivery.resiCode || `MT-DEL-${String(delivery.id).padStart(6, '0')}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatDate(delivery.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {delivery.user?.fullName || delivery.user?.email || 'N/A'}
                          </p>
                          {delivery.deliveryZone && (
                            <p className="text-xs text-gray-500">Zona {delivery.deliveryZone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900 max-w-xs truncate" title={delivery.pickupLocation}>
                          {delivery.pickupLocation}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-gray-900 max-w-xs truncate" title={delivery.dropoffLocation}>
                            {delivery.dropoffLocation}
                          </p>
                          {delivery.scheduledDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(delivery.scheduledDate).toLocaleDateString('id-ID')} {delivery.scheduleTimeSlot}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-600 capitalize">{delivery.type.replace('_', ' ')}</span>
                        {delivery.barang && (
                          <p className="text-xs text-gray-500 mt-1">{delivery.barang.itemName}</p>
                        )}
                        {delivery.packageDetails && (
                          <p className="text-xs text-gray-500 mt-1">
                            {delivery.packageDetails.weight} kg
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(delivery.price)}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' ? (
                          <div className="flex items-center gap-2">
                            <select
                              key={`status-${delivery.id}-${delivery.status}`}
                              onChange={(e) => {
                                if (e.target.value && e.target.value !== delivery.status) {
                                  handleUpdateStatus(delivery.id, e.target.value);
                                }
                              }}
                              disabled={updatingStatus === delivery.id}
                              value={delivery.status}
                              className="px-2 py-1 border border-gray-300 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E00000] disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value={delivery.status}>
                                {getStatusLabel(delivery.status)}
                              </option>
                              {getAllValidStatuses(delivery.status).map((status) => (
                                <option key={status} value={status}>
                                  {getStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                            {updatingStatus === delivery.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#E00000]"></div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {orders.length > 0 && (() => {
            const totalPages = Math.ceil(orders.length / itemsPerPage);
            const getPageNumbers = () => {
              const pages = [];
              const maxVisible = 10; // Show max 10 page numbers
              
              if (totalPages <= maxVisible) {
                // Show all pages if total is less than maxVisible
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                // Calculate start and end of visible range
                let start = Math.max(2, currentPage - 2);
                let end = Math.min(totalPages - 1, currentPage + 2);
                
                // Adjust if we're near the start
                if (currentPage <= 4) {
                  end = Math.min(6, totalPages - 1);
                }
                
                // Adjust if we're near the end
                if (currentPage >= totalPages - 3) {
                  start = Math.max(2, totalPages - 5);
                }
                
                // Add ellipsis before range if needed
                if (start > 2) {
                  pages.push('...');
                }
                
                // Add visible range
                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }
                
                // Add ellipsis after range if needed
                if (end < totalPages - 1) {
                  pages.push('...');
                }
                
                // Always show last page
                pages.push(totalPages);
              }
              
              return pages;
            };
            
            const pageNumbers = getPageNumbers();
            
            return (
              <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || totalPages <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sebelumnya
                  </button>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {pageNumbers.map((page, index) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-w-[40px] ${
                              currentPage === page
                                ? 'bg-[#E00000] text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {totalPages === 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        disabled
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#E00000] text-white min-w-[40px] cursor-default"
                      >
                        1
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
              </div>
            );
          })()}
        </>
        )}
      </main>
    </div>
  );
}
