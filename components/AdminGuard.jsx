"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminAPI from "@/lib/adminApi";
import { ShippingManagerAuth } from "@/lib/shippingManagerAuth";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't check authentication on login page
    if (pathname === '/login') {
      setIsChecking(false);
      return;
    }

    // Check if it's shipping manager route (singular, not plural)
    // /shipping-manager/* = shipping manager routes
    // /shipping-managers = admin route (plural)
    const isShippingManagerRoute = pathname?.startsWith('/shipping-manager/') || pathname === '/shipping-manager';
    
    if (isShippingManagerRoute) {
      // Check shipping manager authentication
      const isAuthenticated = ShippingManagerAuth.isAuthenticated();
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    } else {
      // Check admin authentication (for all other routes including /shipping-managers)
      const isAuthenticated = AdminAPI.isAuthenticated();
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    }
  }, [pathname, router]);

  // Show loading while checking
  if (isChecking && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E00000] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

