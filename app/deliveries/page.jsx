"use client";

import React from "react";
import DeliveriesTable from "@/components/DeliveriesTable";

export default function DeliveriesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries Management</h1>
        <p className="text-gray-600 mt-1">Track active deliveries and driver assignments</p>
      </div>
      <DeliveriesTable />
    </div>
  );
}

