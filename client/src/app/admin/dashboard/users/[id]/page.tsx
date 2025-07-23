
import React from 'react';
import { generateSEOConfig } from '@/utils/seo';
import UserDetailPage from '@/components/admin/usersdata/userData';

export const metadata = generateSEOConfig({
  title: "User Details - Admin Dashboard",
  path: "/admin/dashboard/users",
  description: "Detailed information about the user.",
  keywords: "user, admin, dashboard, details",
});


export default function DashboardPage() {
  return (
    <>

      <main className="max-w-7xl mx-auto">
        <UserDetailPage />
      </main>
    </>
  );
}