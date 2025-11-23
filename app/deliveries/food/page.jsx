"use client";

import React from "react";
import DeliveriesTable from "@/components/DeliveriesTable";

export default function FoodDeliveriesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Food Delivery</h1>
        <p className="text-gray-600 mt-1">Track and manage food deliveries</p>
      </div>

      <DeliveriesTable />
    </div>
  );
}

