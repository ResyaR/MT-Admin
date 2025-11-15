"use client";

import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import ShippingManagerSidebar from "@/components/ShippingManagerSidebar";
import AdminGuard from "@/components/AdminGuard";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  // /shipping-manager/* = shipping manager routes (singular)
  // /shipping-managers = admin route (plural)
  const isShippingManagerRoute = pathname?.startsWith('/shipping-manager/') || pathname === '/shipping-manager';

  // If it's login page, render without sidebar/header
  if (isLoginPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?display=swap&family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;700;900"
            rel="stylesheet"
          />
          <link 
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" 
            rel="stylesheet" 
          />
        </head>
        <body className="bg-white min-h-screen">
          <AdminGuard>{children}</AdminGuard>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?display=swap&family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;700;900"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-white min-h-screen">
        <AdminGuard>
          {isShippingManagerRoute ? (
            // Shipping manager routes - with sidebar
            <div className="flex h-screen bg-gray-100">
              {/* Sidebar */}
              <ShippingManagerSidebar />
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            // Admin routes - with sidebar/header
            <div className="flex h-screen bg-gray-100">
              {/* Sidebar */}
              <AdminSidebar />
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                  {children}
                </main>
              </div>
            </div>
          )}
        </AdminGuard>
      </body>
    </html>
  );
}

