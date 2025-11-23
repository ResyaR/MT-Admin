"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AdminAPI from "@/lib/adminApi";

export default function RecentOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      setIsLoading(true);
      // Try to get all delivery services first (admin endpoint)
      let deliveries = [];
      try {
        deliveries = await AdminAPI.getAllDeliveryServices();
      } catch (error) {
        // Fallback to regular deliveries endpoint
        console.warn('Failed to fetch from admin endpoint, trying regular endpoint:', error);
        try {
          deliveries = await AdminAPI.getAllDeliveries();
        } catch (err) {
          console.error('Failed to fetch deliveries:', err);
          setOrders([]);
          return;
        }
      }
      
      // Sort by createdAt (latest first) and take top 5
      const sortedDeliveries = deliveries
        .filter(d => d && d.createdAt) // Filter out invalid entries
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Latest first
        })
        .slice(0, 5);
      
      // Transform to orders format
      const recentOrders = sortedDeliveries.map((delivery) => {
        const resiCode = delivery.resiCode || delivery.orderNumber || `MT-DEL-${String(delivery.id).padStart(6, '0')}`;
        const customerName = delivery.customerName || delivery.user?.fullName || delivery.user?.email || `User ${delivery.userId || 'N/A'}`;
        const deliveryType = delivery.type ? delivery.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Delivery Service";
        const price = delivery.price || delivery.total || 0;
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
        const status = delivery.status || "pending";
        
        return {
          id: resiCode,
          customer: customerName,
          restaurant: deliveryType,
          amount: formattedPrice,
          status: status,
          time: getRelativeTime(new Date(delivery.createdAt || Date.now()))
        };
      });
      
      setOrders(recentOrders);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const oldOrders = [
    {
      id: "#ORD-2025-001",
      customer: "Budi Santoso",
      restaurant: "Mie Gacoan",
      amount: "Rp 125,000",
      status: "delivered",
      time: "2 mins ago"
    },
    {
      id: "#ORD-2025-002",
      customer: "Siti Nurhaliza",
      restaurant: "Mixue Ice Cream",
      amount: "Rp 45,000",
      status: "preparing",
      time: "5 mins ago"
    },
    {
      id: "#ORD-2025-003",
      customer: "Ahmad Wijaya",
      restaurant: "Geprek Bensu",
      amount: "Rp 78,000",
      status: "delivering",
      time: "8 mins ago"
    },
    {
      id: "#ORD-2025-004",
      customer: "Dewi Lestari",
      restaurant: "Kebab Turki",
      amount: "Rp 52,000",
      status: "pending",
      time: "12 mins ago"
    },
    {
      id: "#ORD-2025-005",
      customer: "Rudi Hartono",
      restaurant: "Coffee Academy",
      amount: "Rp 89,000",
      status: "delivered",
      time: "15 mins ago"
    }
  ];

  const getStatusBadge = (status) => {
    const statusLower = (status || 'pending').toLowerCase();
    const styles = {
      delivered: "bg-green-100 text-green-800",
      accepted: "bg-blue-100 text-blue-800",
      picked_up: "bg-purple-100 text-purple-800",
      in_transit: "bg-orange-100 text-orange-800",
      preparing: "bg-blue-100 text-blue-800",
      delivering: "bg-orange-100 text-orange-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800"
    };

    const labels = {
      delivered: "Delivered",
      accepted: "Accepted",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      preparing: "Preparing",
      delivering: "Delivering",
      pending: "Pending",
      cancelled: "Cancelled"
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[statusLower] || styles.pending}`}>
        {labels[statusLower] || status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        <button 
          onClick={() => router.push('/orders')}
          className="text-sm text-[#E00000] font-semibold hover:underline"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E00000] mx-auto"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">receipt_long</span>
          <p className="text-gray-600">Belum ada orders</p>
        </div>
      ) : (
        <div className="space-y-4">
        {orders.map((order, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900">{order.id}</span>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm text-gray-600">{order.customer}</p>
              <p className="text-xs text-gray-500">{order.restaurant}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{order.amount}</p>
              <p className="text-xs text-gray-500">{order.time}</p>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

