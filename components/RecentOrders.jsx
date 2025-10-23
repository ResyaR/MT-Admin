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
      const deliveries = await AdminAPI.getAllDeliveries();
      
      // Transform to orders format and take latest 5
      const recentOrders = deliveries
        .slice(0, 5)
        .map((delivery, index) => ({
          id: `#ORD-2025-${String(delivery.id).padStart(3, '0')}`,
          customer: `User ${delivery.userId}`,
          restaurant: delivery.type || "Delivery Service",
          amount: "Rp 0",
          status: delivery.status || "pending",
          time: getRelativeTime(new Date(delivery.createdAt || Date.now()))
        }));
      
      setOrders(recentOrders);
    } catch (error) {
      console.error('Error loading recent orders:', error);
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
    const styles = {
      delivered: "bg-green-100 text-green-800",
      preparing: "bg-blue-100 text-blue-800",
      delivering: "bg-orange-100 text-orange-800",
      pending: "bg-yellow-100 text-yellow-800"
    };

    const labels = {
      delivered: "Delivered",
      preparing: "Preparing",
      delivering: "Delivering",
      pending: "Pending"
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
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

