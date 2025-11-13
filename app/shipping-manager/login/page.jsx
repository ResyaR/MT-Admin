"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { ShippingManagerAuth } from '@/lib/shippingManagerAuth';

export default function ShippingManagerLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
      router.push('/shipping-manager/dashboard');
    } catch (err) {
      setError(err?.message || 'Gagal login. Pastikan token valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="MT Trans Logo" 
              className="h-16 w-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">MT Panel</h1>
            <p className="text-gray-600 mt-2">Login Shipping Manager</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Token Login
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E00000]"
                placeholder="Masukkan token login"
              />
              <p className="text-xs text-gray-500 mt-2">
                Token diberikan oleh admin saat shipping manager dibuat
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#E00000] text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

