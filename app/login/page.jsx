"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminAPI from "@/lib/adminApi";
import { API_BASE_URL } from "@/lib/config";
import { ShippingManagerAuth } from "@/lib/shippingManagerAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState("admin"); // "admin" or "shipping-manager"
  const [adminKey, setAdminKey] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (loginType === "admin") {
        // Login sebagai admin
        const success = await AdminAPI.login(adminKey);
        
        if (success) {
          router.push('/');
        } else {
          setError("Invalid admin key. Please try again.");
        }
      } else {
        // Login sebagai shipping manager
        const response = await fetch(`${API_BASE_URL}/shipping-managers/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Token tidak valid');
        }

        // Save to localStorage
        ShippingManagerAuth.login(token, data.data);

        // Redirect to dashboard
        window.location.href = '/shipping-manager/dashboard';
      }
    } catch (err) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="MT Trans Logo" 
              className="h-16 w-16 object-contain"
            />
            <div className="flex flex-col items-start">
              <h1 className="text-3xl font-bold text-black">MT TRANS</h1>
              <span className="text-sm text-[#E00000] font-semibold">
                {loginType === "admin" ? "ADMIN PANEL" : "SHIPPING MANAGER"}
              </span>
            </div>
          </div>
          <p className="text-gray-600">
            {loginType === "admin" 
              ? "Enter your admin key to continue" 
              : "Enter your token to continue"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Login Type Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setLoginType("admin");
                setError("");
                setAdminKey("");
                setToken("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                loginType === "admin"
                  ? "bg-[#E00000] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType("shipping-manager");
                setError("");
                setAdminKey("");
                setToken("");
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                loginType === "shipping-manager"
                  ? "bg-[#E00000] text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Shipping Manager
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Admin Key Input */}
            {loginType === "admin" ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Key
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    lock
                  </span>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Contact system administrator if you don't have access
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Token Login
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    key
                  </span>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Masukkan token login"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent font-mono text-sm"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Token diberikan oleh admin saat shipping manager dibuat
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#E00000] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#B70000] transition-colors flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  <span>{loginType === "admin" ? "Access Admin Panel" : "Login to MT Panel"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-white/50 backdrop-blur rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-yellow-600">shield</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Security Notice</h3>
              <p className="text-xs text-gray-600">
                This is a restricted area. All activities are logged and monitored. 
                Unauthorized access attempts will be reported.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

