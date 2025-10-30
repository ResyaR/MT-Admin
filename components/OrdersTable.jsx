"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";
import RestaurantAPI from "@/lib/restaurantApi";

export default function OrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const foodOrders = await RestaurantAPI.getAllOrders();
      
      // Transform food orders
      const transformedOrders = foodOrders.map(order => ({
        id: order.id,
        orderId: `#FOOD-${String(order.id).padStart(4, '0')}`,
        customer: order.user?.username || order.customerName || `User ${order.userId}`,
        restaurant: order.restaurant?.name || "Unknown Restaurant",
        items: order.items?.map(item => `${item.quantity}x ${item.menuName}`).join(', ') || "N/A",
        itemCount: order.items?.length || 0,
        amount: `Rp ${Math.round(order.total).toLocaleString('id-ID')}`,
        rawAmount: order.total,
        status: order.status || "pending",
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "N/A",
        rawOrder: order
      }));
      
      setAllOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleConfirmStatusUpdate = async () => {
    try {
      await RestaurantAPI.updateOrderStatus(selectedOrder.id, newStatus);
      setShowStatusModal(false);
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status');
    }
  };

  // Old hardcoded data (not used anymore)
  const oldOrders = [
    {
      id: "#ORD-2025-001",
      customer: "Budi Santoso",
      restaurant: "Mie Gacoan",
      items: "2x Mie Gacoan Pedas, 1x Es Teh",
      amount: "Rp 125,000",
      status: "delivered",
      driver: "Andi Kurniawan",
      date: "2025-10-22",
      time: "14:30"
    },
    {
      id: "#ORD-2025-002",
      customer: "Siti Nurhaliza",
      restaurant: "Mixue Ice Cream",
      items: "3x Ice Cream Cone, 1x Boba Tea",
      amount: "Rp 45,000",
      status: "preparing",
      driver: "-",
      date: "2025-10-22",
      time: "14:25"
    },
    {
      id: "#ORD-2025-003",
      customer: "Ahmad Wijaya",
      restaurant: "Geprek Bensu",
      items: "1x Ayam Geprek Level 5, 1x Nasi",
      amount: "Rp 78,000",
      status: "delivering",
      driver: "Bambang Sutejo",
      date: "2025-10-22",
      time: "14:22"
    },
    {
      id: "#ORD-2025-004",
      customer: "Dewi Lestari",
      restaurant: "Kebab Turki",
      items: "2x Kebab Ayam Premium",
      amount: "Rp 52,000",
      status: "pending",
      driver: "-",
      date: "2025-10-22",
      time: "14:18"
    },
    {
      id: "#ORD-2025-005",
      customer: "Rudi Hartono",
      restaurant: "Coffee Academy",
      items: "1x Cappuccino, 2x Croissant",
      amount: "Rp 89,000",
      status: "delivered",
      driver: "Dedi Setiawan",
      date: "2025-10-22",
      time: "14:15"
    },
    {
      id: "#ORD-2025-006",
      customer: "Rina Kusuma",
      restaurant: "Bakso Malang",
      items: "2x Bakso Komplit, 1x Es Jeruk",
      amount: "Rp 95,000",
      status: "cancelled",
      driver: "-",
      date: "2025-10-22",
      time: "14:10"
    },
    {
      id: "#ORD-2025-007",
      customer: "Fajar Nugroho",
      restaurant: "Sushi Tei",
      items: "1x Salmon Sushi Set, 1x Miso Soup",
      amount: "Rp 285,000",
      status: "delivered",
      driver: "Eko Prasetyo",
      date: "2025-10-22",
      time: "14:05"
    },
    {
      id: "#ORD-2025-008",
      customer: "Linda Wijayanti",
      restaurant: "Pizza Hut",
      items: "1x Large Pepperoni Pizza",
      amount: "Rp 165,000",
      status: "preparing",
      driver: "-",
      date: "2025-10-22",
      time: "14:00"
    }
  ];

  const filteredOrders = allOrders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = String(order.id).toLowerCase().includes(searchLower) ||
                         (order.orderId || '').toLowerCase().includes(searchLower) ||
                         (order.customer || '').toLowerCase().includes(searchLower) ||
                         (order.restaurant || '').toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      delivering: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };

    const labels = {
      pending: "Pending",
      preparing: "Preparing",
      delivering: "Delivering",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search by order ID, customer, or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="delivering">Delivering</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{order.orderId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.restaurant}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate" title={order.items}>
                    {order.itemCount} item(s)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{order.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.date}</div>
                  <div className="text-xs text-gray-500">{order.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewOrder(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-lg">visibility</span>
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(order)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Update Status"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? 'bg-[#E00000] text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Detail Order {selectedOrder.orderId}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-base font-semibold">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Restaurant</p>
                  <p className="text-base font-semibold">{selectedOrder.restaurant}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-base font-semibold text-[#E00000]">{selectedOrder.amount}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Items</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedOrder.rawOrder?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="font-medium">{item.menuName}</p>
                        <p className="text-sm text-gray-600">Rp {parseInt(item.price).toLocaleString('id-ID')} x {item.quantity}</p>
                      </div>
                      <p className="font-semibold">Rp {parseInt(item.subtotal).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Alamat Pengantaran</p>
                <p className="text-base">{selectedOrder.deliveryAddress}</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600">Catatan</p>
                  <p className="text-base">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="font-medium">Rp {parseInt(selectedOrder.rawOrder?.subtotal || 0).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Biaya Pengantaran</p>
                  <p className="font-medium">Rp {parseInt(selectedOrder.rawOrder?.deliveryFee || 0).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <p>Total</p>
                  <p className="text-[#E00000]">{selectedOrder.amount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Status Order</h2>
            <p className="text-sm text-gray-600 mb-4">Order: {selectedOrder.orderId}</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Baru</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="delivering">Delivering</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

