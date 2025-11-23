"use client";

import React from "react";
import DeliveryServicesTable from "@/components/DeliveryServicesTable";

export default function DeliveryServicesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Services</h1>
        <p className="text-gray-600 mt-1">Track and manage delivery services</p>
      </div>

      <DeliveryServicesTable />
    </div>
  );
}

