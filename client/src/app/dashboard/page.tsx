import React from 'react';
import Dashboard from '../../components/Dashboard/home/Dashboard';
import { generateSEOConfig } from '@/utils/seo';

export const metadata = generateSEOConfig({
  title: "User Dashboard - OneNumber",
  description: "Manage your account settings, view notifications, and more on OneNumber Web app",
  keywords: "user dashboard, OneNumber, user, settings, notifications",
  path: "/dashboard",
});


export default function DashboardPage() {
  return (
    <>

      <main>
        <Dashboard />
      </main>
    </>
  );
}