import React from 'react';
import { generateSEOConfig } from '@/utils/seo';
import UserManagement from '@/components/admin/usersdata/UserManagement';

export const metadata = generateSEOConfig({
  title: "User Management Dashboard | Admin",
  description: "Manage users, view details, and perform actions. Admin dashboard for user management.",
  keywords: "user management, admin dashboard, user details view, user actions",
  path: "/admin/dashboard/users",
});


export default function DashboardPage() {
  return (
    <>

      <main className="max-w-7xl mx-auto">
        <UserManagement />
      </main>
    </>
  );
}