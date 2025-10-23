"use client";

import React from "react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Detailed insights and performance metrics</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}

