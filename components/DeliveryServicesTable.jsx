"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";
import DeliveryServiceDetailModal from "./DeliveryServiceDetailModal";
import DeliveryServicesStats from "./DeliveryServicesStats";

export default function DeliveryServicesTable() {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [deliveries, searchTerm, typeFilter, statusFilter]);

  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      const data = await AdminAPI.getAllDeliveryServices();
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveries];

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(d => d.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.id.toString().includes(search) ||
        d.pickupLocation.toLowerCase().includes(search) ||
        d.dropoffLocation.toLowerCase().includes(search) ||
        (d.user?.email && d.user.email.toLowerCase().includes(search)) ||
        (d.user?.username && d.user.username.toLowerCase().includes(search))
      );
    }

    setFilteredDeliveries(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewDetails = async (delivery) => {
    try {
      // Fetch full details including drop locations if needed
      const fullDetails = await AdminAPI.getDeliveryServiceDetail(delivery.id);
      setSelectedDelivery(fullDetails);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading delivery details:', error);
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      JADWAL: { color: 'bg-blue-100 text-blue-800', label: 'Jadwal', icon: 'schedule' },
      MULTI_DROP: { color: 'bg-green-100 text-green-800', label: 'Multi Drop', icon: 'place' },
      PAKET_BESAR: { color: 'bg-orange-100 text-orange-800', label: 'Paket Besar', icon: 'inventory_2' },
      KIRIM_SEKARANG: { color: 'bg-red-100 text-red-800', label: 'Kirim Sekarang', icon: 'flash_on' },
      TITIP_BELI: { color: 'bg-purple-100 text-purple-800', label: 'Titip Beli', icon: 'shopping_bag' }
    };
    const badge = badges[type] || { color: 'bg-gray-100 text-gray-800', label: type, icon: 'help' };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color} flex items-center gap-1`}>
        <span className="material-symbols-outlined text-sm">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
      picked_up: { color: 'bg-indigo-100 text-indigo-800', label: 'Picked Up' },
      in_transit: { color: 'bg-purple-100 text-purple-800', label: 'In Transit' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>{badge.label}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get type counts
  const typeCounts = {
    all: deliveries.length,
    JADWAL: deliveries.filter(d => d.type === 'JADWAL').length,
    MULTI_DROP: deliveries.filter(d => d.type === 'MULTI_DROP').length,
    PAKET_BESAR: deliveries.filter(d => d.type === 'PAKET_BESAR').length,
    KIRIM_SEKARANG: deliveries.filter(d => d.type === 'KIRIM_SEKARANG').length,
    TITIP_BELI: deliveries.filter(d => d.type === 'TITIP_BELI').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <DeliveryServicesStats />

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Type Filter Tabs */}
        <div className="border-b border-gray-200 px-6 pt-6">
          <div className="flex gap-2 overflow-x-auto pb-4">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                typeFilter === "all"
                  ? "bg-[#E00000] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({typeCounts.all})
            </button>
            <button
              onClick={() => setTypeFilter("JADWAL")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                typeFilter === "JADWAL"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              Jadwal ({typeCounts.JADWAL})
            </button>
            <button
              onClick={() => setTypeFilter("MULTI_DROP")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                typeFilter === "MULTI_DROP"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              Multi Drop ({typeCounts.MULTI_DROP})
            </button>
            <button
              onClick={() => setTypeFilter("PAKET_BESAR")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                typeFilter === "PAKET_BESAR"
                  ? "bg-orange-600 text-white"
                  : "bg-orange-100 text-orange-800 hover:bg-orange-200"
              }`}
            >
              Paket Besar ({typeCounts.PAKET_BESAR})
            </button>
            <button
              onClick={() => setTypeFilter("KIRIM_SEKARANG")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                typeFilter === "KIRIM_SEKARANG"
                  ? "bg-red-600 text-white"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              Kirim Sekarang ({typeCounts.KIRIM_SEKARANG})
            </button>
            <button
              onClick={() => setTypeFilter("TITIP_BELI")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                typeFilter === "TITIP_BELI"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-800 hover:bg-purple-200"
              }`}
            >
              Titip Beli ({typeCounts.TITIP_BELI})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by ID, customer, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {currentDeliveries.length} of {filteredDeliveries.length} deliveries
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading deliveries...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentDeliveries.length === 0 && (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">inbox</span>
            <p className="text-gray-600 text-lg font-medium">No deliveries found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}

        {/* Deliveries List */}
        {!isLoading && currentDeliveries.length > 0 && (
          <div className="p-6 space-y-4">
            {currentDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(delivery)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">#{delivery.id}</span>
                    {getTypeBadge(delivery.type)}
                    {getStatusBadge(delivery.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#E00000]">{formatCurrency(delivery.price)}</p>
                    <p className="text-xs text-gray-500">{formatDate(delivery.createdAt)}</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-gray-600 text-base">person</span>
                    <span className="text-gray-900 font-medium">
                      {delivery.user?.username || delivery.user?.email || `User #${delivery.userId}`}
                    </span>
                    {delivery.user?.email && !delivery.user?.username && (
                      <span className="text-gray-500">({delivery.user.email})</span>
                    )}
                  </div>
                </div>

                {/* Locations */}
                <div className="mb-3">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="material-symbols-outlined text-green-600 text-base mt-0.5">radio_button_checked</span>
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs">Pickup</p>
                      <p className="text-gray-900 font-medium">{delivery.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm mt-2">
                    <span className="material-symbols-outlined text-red-600 text-base mt-0.5">location_on</span>
                    <div className="flex-1">
                      <p className="text-gray-600 text-xs">Dropoff</p>
                      <p className="text-gray-900 font-medium">{delivery.dropoffLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Type-specific info */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {delivery.type === 'MULTI_DROP' && delivery.totalDropPoints && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">list</span>
                      {delivery.totalDropPoints} drop points
                    </span>
                  )}
                  {delivery.type === 'PAKET_BESAR' && delivery.packageDetails && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      {delivery.packageDetails.weight}kg • {delivery.packageDetails.length}×{delivery.packageDetails.width}×{delivery.packageDetails.height}cm
                    </span>
                  )}
                  {delivery.type === 'JADWAL' && delivery.scheduledDate && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Scheduled: {formatDate(delivery.scheduledDate)}
                      {delivery.scheduleTimeSlot && ` (${delivery.scheduleTimeSlot})`}
                    </span>
                  )}
                  {delivery.driverId && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">badge</span>
                      Driver #{delivery.driverId}
                    </span>
                  )}
                </div>

                {/* Actions hint */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Click to view details and manage</span>
                  <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredDeliveries.length > itemsPerPage && (
          <div className="p-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
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

