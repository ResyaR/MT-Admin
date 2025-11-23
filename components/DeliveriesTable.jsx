"use client";

import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function DeliveriesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      const data = await AdminAPI.getAllDeliveries();
      
      // Transform API data
      const transformedDeliveries = data.map(delivery => ({
        id: `#DEL-${delivery.id}`,
        orderId: `#ORD-${delivery.id}`,
        driver: delivery.driverId ? `Driver ${delivery.driverId}` : "-",
        customer: delivery.userId ? `User ${delivery.userId}` : "Unknown",
        from: delivery.pickupAddress || "Not set",
        to: delivery.deliveryAddress || "Not set",
        distance: "N/A",
        status: delivery.status || "pending",
        eta: "N/A",
        progress: delivery.status === "delivered" ? 100 : delivery.status === "picked_up" ? 70 : 30
      }));
      
      setDeliveries(transformedDeliveries);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const oldDeliveries = [
    {
      id: "#DEL-001",
      orderId: "#ORD-2025-003",
      driver: "Andi Kurniawan",
      customer: "Ahmad Wijaya",
      from: "Geprek Bensu",
      to: "Jl. Sudirman No. 123",
      distance: "3.2 km",
      status: "in_transit",
      eta: "10 mins",
      progress: 65
    },
    {
      id: "#DEL-002",
      orderId: "#ORD-2025-008",
      driver: "Bambang Sutejo",
      customer: "Linda Wijayanti",
      from: "Pizza Hut",
      to: "Jl. Gatot Subroto No. 45",
      distance: "5.8 km",
      status: "picking_up",
      eta: "5 mins",
      progress: 30
    },
    {
      id: "#DEL-003",
      orderId: "#ORD-2025-012",
      driver: "Dedi Setiawan",
      customer: "Rina Kusuma",
      from: "Bakso Malang",
      to: "Jl. Thamrin No. 78",
      distance: "2.1 km",
      status: "in_transit",
      eta: "7 mins",
      progress: 80
    },
    {
      id: "#DEL-004",
      orderId: "#ORD-2025-015",
      driver: "Eko Prasetyo",
      customer: "Fajar Nugroho",
      from: "Coffee Academy",
      to: "Jl. HR Rasuna Said No. 99",
      distance: "4.5 km",
      status: "assigned",
      eta: "15 mins",
      progress: 10
    }
  ];

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      assigned: "bg-blue-100 text-blue-800",
      picking_up: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800"
    };

    const labels = {
      assigned: "Assigned",
      picking_up: "Picking Up",
      in_transit: "In Transit",
      delivered: "Delivered"
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Live Map */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Live Delivery Tracking</h2>
        <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613502864!3d-6.194981395493371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta!5e0!3m2!1sen!2sid!4v1234567890123!5m2!1sen!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Peta interaktif - dapat di-zoom dan di-pan</p>
      </div>

      {/* Deliveries Table */}
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
                  placeholder="Search deliveries..."
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
              <option value="assigned">Assigned</option>
              <option value="picking_up">Picking Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading deliveries...</p>
          </div>
        )}

        {/* List */}
        {!isLoading && (
          <div className="p-6 space-y-4">
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{delivery.id}</span>
                    {getStatusBadge(delivery.status)}
                  </div>
                  <p className="text-xs text-gray-500">Order: {delivery.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#E00000]">ETA: {delivery.eta}</p>
                  <p className="text-xs text-gray-500">{delivery.distance}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#E00000] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${delivery.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Driver</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-600 text-sm">person</span>
                    <p className="text-sm font-medium text-gray-900">{delivery.driver}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-600 text-sm">account_circle</span>
                    <p className="text-sm font-medium text-gray-900">{delivery.customer}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Restaurant</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-600 text-sm">restaurant</span>
                    <p className="text-sm font-medium text-gray-900">{delivery.from}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>Destination: {delivery.to}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

