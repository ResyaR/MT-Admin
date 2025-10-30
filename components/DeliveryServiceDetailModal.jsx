"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function DeliveryServiceDetailModal({ delivery, isOpen, onClose, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(delivery?.status || 'pending');
  const [driverId, setDriverId] = useState(delivery?.driverId || '');
  const [dropLocations, setDropLocations] = useState([]);
  const [loadingDrops, setLoadingDrops] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen && delivery) {
      setSelectedStatus(delivery.status);
      setDriverId(delivery.driverId || '');
      
      // Load drop locations if multi-drop
      if (delivery.type === 'MULTI_DROP' && delivery.multiDropLocations) {
        setDropLocations(delivery.multiDropLocations);
      }
    }
  }, [isOpen, delivery]);

  if (!isOpen || !delivery) return null;

  const handleUpdateStatus = async () => {
    if (selectedStatus === delivery.status) {
      setToast({ type: 'info', message: 'Status is already ' + selectedStatus });
      return;
    }

    try {
      setIsUpdating(true);
      await AdminAPI.updateDeliveryServiceStatus(delivery.id, selectedStatus);
      setToast({ type: 'success', message: 'Status updated successfully!' });
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update status: ' + error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!driverId) {
      setToast({ type: 'error', message: 'Please enter a driver ID' });
      return;
    }

    try {
      setIsUpdating(true);
      await AdminAPI.assignDriverToDeliveryService(delivery.id, Number(driverId));
      setToast({ type: 'success', message: 'Driver assigned successfully!' });
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to assign driver: ' + error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      JADWAL: { color: 'bg-blue-100 text-blue-800', label: 'Jadwal Pengiriman' },
      MULTI_DROP: { color: 'bg-green-100 text-green-800', label: 'Multi Drop' },
      PAKET_BESAR: { color: 'bg-orange-100 text-orange-800', label: 'Paket Besar' },
      KIRIM_SEKARANG: { color: 'bg-red-100 text-red-800', label: 'Kirim Sekarang' },
      TITIP_BELI: { color: 'bg-purple-100 text-purple-800', label: 'Titip Beli' }
    };
    const badge = badges[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>{badge.label}</span>;
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
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Delivery Detail #{delivery.id}</h2>
              <div className="flex gap-2 mt-2">
                {getTypeBadge(delivery.type)}
                {getStatusBadge(delivery.status)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">person</span>
                Customer Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-medium">#{delivery.userId}</span>
                </div>
                {delivery.user && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{delivery.user.email}</span>
                    </div>
                    {delivery.user.username && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username:</span>
                        <span className="font-medium">{delivery.user.username}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Locations */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">location_on</span>
                Locations
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Pickup</span>
                  <p className="text-gray-900 font-medium mt-1">{delivery.pickupLocation}</p>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Dropoff</span>
                  <p className="text-gray-900 font-medium mt-1">{delivery.dropoffLocation}</p>
                </div>
              </div>
            </div>

            {/* Type-Specific Sections */}
            {delivery.type === 'MULTI_DROP' && dropLocations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">list</span>
                  Drop Locations ({dropLocations.length} points)
                </h3>
                <div className="space-y-3">
                  {dropLocations.sort((a, b) => a.sequence - b.sequence).map((loc, idx) => (
                    <div key={loc.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {loc.sequence}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{loc.locationName}</p>
                          <p className="text-sm text-gray-600 mt-1">{loc.address}</p>
                          {loc.recipientName && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Recipient:</span> {loc.recipientName}
                              {loc.recipientPhone && ` (${loc.recipientPhone})`}
                            </p>
                          )}
                          {loc.notes && (
                            <p className="text-sm text-gray-500 italic mt-1">{loc.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {delivery.totalDistance && (
                  <p className="text-sm text-gray-600 mt-2">
                    Total Distance: <span className="font-semibold">{delivery.totalDistance} km</span>
                  </p>
                )}
              </div>
            )}

            {delivery.type === 'PAKET_BESAR' && delivery.packageDetails && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">inventory_2</span>
                  Package Details
                </h3>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Weight</span>
                      <p className="font-medium text-gray-900">{delivery.packageDetails.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Dimensions</span>
                      <p className="font-medium text-gray-900">
                        {delivery.packageDetails.length} × {delivery.packageDetails.width} × {delivery.packageDetails.height} cm
                      </p>
                    </div>
                  </div>
                  {delivery.packageDetails.volumeWeight && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Volume Weight</span>
                      <p className="font-medium text-gray-900">{delivery.packageDetails.volumeWeight.toFixed(2)} kg</p>
                    </div>
                  )}
                  {delivery.packageDetails.category && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Category</span>
                      <p className="font-medium text-gray-900">{delivery.packageDetails.category}</p>
                    </div>
                  )}
                  <div className="flex gap-4 mt-2">
                    {delivery.packageDetails.isFragile && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        Fragile
                      </span>
                    )}
                    {delivery.packageDetails.requiresHelper && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">group</span>
                        Requires Helper
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {delivery.type === 'JADWAL' && delivery.scheduledDate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">schedule</span>
                  Schedule Information
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Scheduled Date</span>
                    <p className="font-medium text-gray-900">{formatDate(delivery.scheduledDate)}</p>
                  </div>
                  {delivery.scheduleTimeSlot && (
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-semibold">Time Slot</span>
                      <p className="font-medium text-gray-900">{delivery.scheduleTimeSlot}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {delivery.type === 'TITIP_BELI' && delivery.titipDeskripsi && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">shopping_bag</span>
                  Shopping Description
                </h3>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-gray-900">{delivery.titipDeskripsi}</p>
                </div>
              </div>
            )}

            {delivery.barang && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">category</span>
                  Item Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item Name:</span>
                    <span className="font-medium">{delivery.barang.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{delivery.barang.scale} kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">payments</span>
                Price
              </h3>
              <div className="bg-[#E00000] bg-opacity-10 rounded-lg p-4 border border-[#E00000] border-opacity-30">
                <p className="text-3xl font-bold text-[#E00000]">{formatCurrency(delivery.price)}</p>
              </div>
            </div>

            {/* Notes */}
            {delivery.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-600">description</span>
                  Notes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900">{delivery.notes}</p>
                </div>
              </div>
            )}

            {/* Driver Assignment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">badge</span>
                Driver Assignment
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {delivery.driverId ? (
                  <p className="text-gray-900 mb-3">
                    <span className="font-semibold">Current Driver:</span> Driver #{delivery.driverId}
                  </p>
                ) : (
                  <p className="text-gray-500 mb-3">No driver assigned yet</p>
                )}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    placeholder="Enter Driver ID"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  />
                  <button
                    onClick={handleAssignDriver}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#C00000] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">swap_horiz</span>
                Status Management
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={isUpdating || selectedStatus === delivery.status}
                    className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#C00000] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-600">access_time</span>
                Timestamps
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(delivery.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(delivery.updatedAt)}</span>
                </div>
                {delivery.estimatedArrival && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Arrival:</span>
                    <span className="font-medium">{formatDate(delivery.estimatedArrival)}</span>
                  </div>
                )}
                {delivery.actualArrival && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual Arrival:</span>
                    <span className="font-medium">{formatDate(delivery.actualArrival)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[60] animate-slide-down">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          } text-white`}>
            <span className="material-symbols-outlined">
              {toast.type === 'success' ? 'check_circle' :
               toast.type === 'error' ? 'error' :
               'info'}
            </span>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

