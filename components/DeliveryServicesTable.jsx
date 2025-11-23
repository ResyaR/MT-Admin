"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";
import DeliveryServiceDetailModal from "./DeliveryServiceDetailModal";

export default function DeliveryServicesTable() {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    resiCode: true,
    customer: true,
    pickupLocation: true,
    dropoffLocation: true,
    type: true,
    status: true,
    price: true,
    action: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  useEffect(() => {
    loadDeliveries();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  // Filter deliveries based on search term
  useEffect(() => {
    let filtered = [...deliveries];

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(d => d.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(d => {
        const resiCode = (d.resiCode || `MT-DEL-${String(d.id).padStart(6, '0')}`).toLowerCase();
        const customerName = (d.user?.fullName || d.user?.email || d.user?.username || '').toLowerCase();
        const pickupLocation = (d.pickupLocation || '').toLowerCase();
        const dropoffLocation = (d.dropoffLocation || '').toLowerCase();
        
        return resiCode.includes(searchLower) ||
               customerName.includes(searchLower) ||
               pickupLocation.includes(searchLower) ||
               dropoffLocation.includes(searchLower);
      });
    }

    setFilteredDeliveries(filtered);
    setCurrentPage(1);
  }, [deliveries, searchTerm, typeFilter, statusFilter]);

  const loadDeliveries = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await AdminAPI.getAllDeliveryServices({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter || undefined
    });
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setDeliveries([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDeliveries(true);
  };

  const handleViewDetails = async (delivery) => {
    try {
      const fullDetails = await AdminAPI.getDeliveryServiceDetail(delivery.id);
      setSelectedDelivery(fullDetails);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading delivery details:', error);
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
    if (!dateString) return '-';
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    const labels = {
      JADWAL: 'Jadwal',
      MULTI_DROP: 'Multi Drop',
      PAKET_BESAR: 'Paket Besar',
      KIRIM_SEKARANG: 'Kirim Sekarang',
      TITIP_BELI: 'Titip Beli'
    };
    return labels[type] || type;
  };

  const handleExportCSV = () => {
    const headers = ['Kode Resi', 'Customer', 'Alamat Penjemputan', 'Alamat Tujuan', 'Jenis', 'Status', 'Total', 'Tanggal'];
    const rows = filteredDeliveries.map(d => [
      d.resiCode || `MT-DEL-${String(d.id).padStart(6, '0')}`,
      d.user?.fullName || d.user?.email || 'N/A',
      d.pickupLocation || '',
      d.dropoffLocation || '',
      getTypeLabel(d.type),
      d.status,
      formatCurrency(d.price || 0),
      formatDate(d.createdAt)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.setAttribute('download', `delivery_services_${dateStr}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delivery Services</h1>
              <p className="text-gray-600 mt-1">Kelola semua layanan pengiriman</p>
          </div>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari kode resi, customer, alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
            </div>

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

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing || isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>

              {/* Column Visibility Button */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-semibold"
                  title="Pilih kolom yang ditampilkan"
                >
                  <span className="material-symbols-outlined text-lg">view_column</span>
                  Kolom
                </button>
                
                {showColumnMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowColumnMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-3">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Tampilkan Kolom</div>
                      <div className="space-y-2">
                        {Object.entries({
                          resiCode: 'Kode Resi',
                          customer: 'Customer',
                          pickupLocation: 'Alamat Penjemputan',
                          dropoffLocation: 'Alamat Tujuan',
                          type: 'Jenis',
                          status: 'Status',
                          price: 'Total',
                          action: 'Aksi'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={visibleColumns[key]}
                              onChange={(e) => setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="w-4 h-4 text-[#E00000] border-gray-300 rounded focus:ring-[#E00000]"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
          </div>
        </div>
                  </>
                )}
          </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                title="Export ke CSV"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export CSV
              </button>
                  </div>
                  </div>
                </div>
      </header>

      {/* Type Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              typeFilter === "all"
                ? "bg-[#E00000] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({deliveries.length})
          </button>
          {['JADWAL', 'MULTI_DROP', 'PAKET_BESAR', 'KIRIM_SEKARANG', 'TITIP_BELI'].map(type => {
            const count = deliveries.filter(d => d.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  typeFilter === type
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {getTypeLabel(type)} ({count})
              </button>
            );
          })}
                  </div>
                </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto"></div>
            <p className="text-gray-600 mt-4">Memuat data...</p>
                    </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">local_shipping</span>
            <p className="text-gray-600">
              {searchTerm || statusFilter || typeFilter !== 'all'
                ? 'Tidak ada data yang sesuai dengan filter' 
                : 'Belum ada delivery services'}
            </p>
                  </div>
        ) : (
          <>
            {/* Items Per Page Selector */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
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
                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredDeliveries.length)} dari {filteredDeliveries.length} data
                  </div>
                </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {visibleColumns.resiCode && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kode Resi</th>
                    )}
                    {visibleColumns.customer && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    )}
                    {visibleColumns.pickupLocation && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat Penjemputan</th>
                    )}
                    {visibleColumns.dropoffLocation && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Alamat Tujuan</th>
                    )}
                    {visibleColumns.type && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jenis</th>
                    )}
                    {visibleColumns.status && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    )}
                    {visibleColumns.price && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                    )}
                    {visibleColumns.action && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                      {visibleColumns.resiCode && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-mono font-bold text-gray-900">
                              {delivery.resiCode || `MT-DEL-${String(delivery.id).padStart(6, '0')}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(delivery.createdAt)}</p>
                          </div>
                        </td>
                      )}
                      {visibleColumns.customer && (
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {delivery.user?.fullName || delivery.user?.email || delivery.user?.username || 'N/A'}
                            </p>
                            {delivery.user?.email && delivery.user?.fullName && (
                              <p className="text-xs text-gray-500">{delivery.user.email}</p>
                  )}
                </div>
                        </td>
                      )}
                      {visibleColumns.pickupLocation && (
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900 max-w-xs truncate" title={delivery.pickupLocation}>
                            {delivery.pickupLocation}
                          </p>
                        </td>
                      )}
                      {visibleColumns.dropoffLocation && (
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
                      )}
                      {visibleColumns.type && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-600">{getTypeLabel(delivery.type)}</span>
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                      )}
                      {visibleColumns.price && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(delivery.price || 0)}</p>
                        </td>
                      )}
                      {visibleColumns.action && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewDetails(delivery)}
                            className="px-3 py-1.5 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors text-sm font-medium"
                          >
                            Detail
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>

        {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-[#E00000] text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDelivery && (
        <DeliveryServiceDetailModal
          delivery={selectedDelivery}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDelivery(null);
          }}
          onUpdate={() => {
            loadDeliveries();
          }}
        />
      )}
    </div>
  );
}
