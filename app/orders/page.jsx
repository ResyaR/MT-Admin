"use client";

import React from "react";
import OrdersTable from "@/components/OrdersTable";

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1">Track and manage all food delivery orders</p>
      </div>
      <OrdersTable />
    </div>
  );
}

