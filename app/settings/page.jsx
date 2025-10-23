"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage platform settings and configurations</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab("general")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "general"
                  ? "border-[#E00000] text-[#E00000]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "notifications"
                  ? "border-[#E00000] text-[#E00000]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "payment"
                  ? "border-[#E00000] text-[#E00000]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Payment
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "security"
                  ? "border-[#E00000] text-[#E00000]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      defaultValue="MT Trans"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      defaultValue="support@mttrans.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+62 21 1234 5678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      defaultValue="06:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      defaultValue="23:00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
              <div className="space-y-4">
                {["New Order", "Order Cancelled", "New User Registration", "Payment Received", "Delivery Completed"].map((item) => (
                  <label key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{item}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#E00000] rounded focus:ring-[#E00000]" />
                  </label>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
              <div className="space-y-4">
                {["Cash on Delivery", "Credit/Debit Card", "E-Wallet (GoPay, OVO, Dana)", "Bank Transfer"].map((method) => (
                  <label key={method} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <span className="text-sm font-medium text-gray-900">{method}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-[#E00000] rounded focus:ring-[#E00000]" />
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="15"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver Commission (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="20"
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div>
                    <div className="text-xs text-gray-500">Add an extra layer of security</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-[#E00000] rounded focus:ring-[#E00000]" />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Login Alerts</div>
                    <div className="text-xs text-gray-500">Get notified of suspicious logins</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-[#E00000] rounded focus:ring-[#E00000]" />
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-6 py-2 bg-[#E00000] text-white rounded-lg hover:bg-[#B70000] transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

