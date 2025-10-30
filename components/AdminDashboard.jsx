"use client";

import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import RecentOrders from "./RecentOrders";
import RecentUsers from "./RecentUsers";
import RevenueChart from "./RevenueChart";
import AdminAPI from "@/lib/adminApi";
import RestaurantAPI from "@/lib/restaurantApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState([
    {
      title: "Total User",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: "people",
      color: "bg-purple-500"
    },
    {
      title: "Total Penghasilan",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: "payments",
      color: "bg-green-500"
    },
    {
      title: "Total Provinsi",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: "map",
      color: "bg-blue-500"
    },
    {
      title: "Total Kota",
      value: "Loading...",
      change: "...",
      changeType: "increase",
      icon: "location_city",
      color: "bg-orange-500"
    }
  ]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch users, food orders, cities, and provinces from API
      const [usersData, foodOrders, cities, provinces] = await Promise.all([
        AdminAPI.getAllUsers().catch(() => []),
        RestaurantAPI.getAllOrders().catch(() => []),
        AdminAPI.getCities().catch(() => []),
        AdminAPI.getProvinces().catch(() => [])
      ]);
      
      // Save users to state for chart
      setUsers(usersData);

      // Calculate total revenue from food orders
      const totalRevenue = foodOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
      }, 0);

      // Calculate stats from real data
      const totalUsers = usersData.length;
      const totalCities = cities.length;
      const totalProvinces = provinces.length;
      
      setStats([
        {
          title: "Total User",
          value: totalUsers.toLocaleString('id-ID'),
          change: totalUsers > 0 ? `${totalUsers} users` : "No users yet",
          changeType: "increase",
          icon: "people",
          color: "bg-purple-500"
        },
        {
          title: "Total Penghasilan",
          value: `Rp ${totalRevenue.toLocaleString('id-ID')}`,
          change: foodOrders.length > 0 ? `${foodOrders.length} orders` : "No orders yet",
          changeType: "increase",
          icon: "payments",
          color: "bg-green-500"
        },
        {
          title: "Total Provinsi",
          value: totalProvinces.toLocaleString('id-ID'),
          change: `${totalProvinces} provinces`,
          changeType: "increase",
          icon: "map",
          color: "bg-blue-500"
        },
        {
          title: "Total Kota",
          value: totalCities.toLocaleString('id-ID'),
          change: `${totalCities} cities`,
          changeType: "increase",
          icon: "location_city",
          color: "bg-orange-500"
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E00000] to-[#B70000] rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-white/90">Monitor and manage your MT Trans food delivery platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* User Overview Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Overview User</h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E00000]">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <RevenueChart users={users} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentUsers />
      </div>
    </div>
  );
}

