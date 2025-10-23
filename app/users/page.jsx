"use client";

import React from "react";
import UsersTable from "@/components/UsersTable";

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-1">Manage and monitor all registered users</p>
      </div>
      <UsersTable />
    </div>
  );
}

