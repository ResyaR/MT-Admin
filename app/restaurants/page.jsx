"use client";

import React from "react";
import RestaurantsTable from "@/components/RestaurantsTable";

export default function RestaurantsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurants Management</h1>
        <p className="text-gray-600 mt-1">Manage partner restaurants and their menus</p>
      </div>
      <RestaurantsTable />
    </div>
  );
}

