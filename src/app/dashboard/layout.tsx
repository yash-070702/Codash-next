// app/dashboard/layout.tsx
'use client';

import React, { useState } from 'react';
import Header from '../components/Dashboard/Header';
import PrivateRoute from '../components/PrivateRoute';
import Sidebar from '../components/Dashboard/Sidebar';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PrivateRoute>
    <div className="min-h-screen bg-gray-900 text-white">
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="lg:ml-64 p-4 md:p-6">
        <Header
          setSidebarOpen={setSidebarOpen}
          isUserDropdownOpen={isUserDropdownOpen}
          setIsUserDropdownOpen={setIsUserDropdownOpen}
        />
        {children} 
      </div>
    </div>
    </PrivateRoute>
  );
}
