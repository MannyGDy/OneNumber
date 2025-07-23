"use client"

import Header from '@/components/admin/layout/Header';
import Sidebar from '@/components/admin/layout/Sidebar';
import { ReactNode, useState } from 'react';

type LayoutProps = {
  children: ReactNode;
};
export default function DashboardLayout({ children }: LayoutProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);


  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <div className="flex-1  transition-all duration-300">
        <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />
        <main
          className={`pt-16 min-h-screen  transition-all mt-15 duration-300 ${!isSidebarExpanded ? 'ml-12' : 'ml-76'
            }`}
        >{children}</main>
      </div>
    </div>
  );
};


