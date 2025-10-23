"use client";

import { useState } from "react";

export default function RestaurantsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const restaurants = [
    {
      id: 1,
      name: "Mie Gacoan",
      category: "Noodles",
      rating: 4.8,
      totalOrders: 1234,
      revenue: "Rp 15,450,000",
      status: "active",
      image: "/mie-gacoan-restaurant.jpg"
    },
    {
      id: 2,
      name: "Mixue Ice Cream",
      category: "Desserts",
      rating: 4.6,
      totalOrders: 892,
      revenue: "Rp 8,920,000",
      status: "active",
      image: "/mixue-ice-cream-shop.jpg"
    },
    {
      id: 3,
      name: "Geprek Bensu",
      category: "Indonesian",
      rating: 4.7,
      totalOrders: 1056,
      revenue: "Rp 12,340,000",
      status: "active",
      image: "/geprek-chicken-restaurant.jpg"
    },
    {
      id: 4,
      name: "Coffee Academy",
      category: "Cafe",
      rating: 4.9,
      totalOrders: 678,
      revenue: "Rp 18,560,000",
      status: "active",
      image: "/coffee-academy-cafe.jpg"
    },
    {
      id: 5,
      name: "Kebab Turki",
      category: "Middle Eastern",
      rating: 4.5,
      totalOrders: 445,
      revenue: "Rp 6,230,000",
      status: "inactive",
      image: "/kebab-food-stall.jpg"
    }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                placeholder="Search restaurants..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="px-4 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">add</span>
            Add Restaurant
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {filteredRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{restaurant.name}</h3>
                {getStatusBadge(restaurant.status)}
              </div>
              <p className="text-sm text-gray-600 mb-3">{restaurant.category}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
                <span className="text-sm font-semibold text-gray-900">{restaurant.rating}</span>
                <span className="text-sm text-gray-500">({restaurant.totalOrders} orders)</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="text-sm font-bold text-gray-900">{restaurant.revenue}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-lg">visibility</span>
                  View
                </button>
                <button className="flex-1 px-3 py-2 bg-[#E00000] text-white rounded-lg text-sm font-medium hover:bg-[#B70000] transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

