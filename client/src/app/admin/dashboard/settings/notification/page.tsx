import React from 'react';
import { generateSEOConfig } from '@/utils/seo';
import NotificationSettingsPage from '@/components/admin/settings/notification';

export const metadata = generateSEOConfig({
  title: "Notification Settings - Admin Dashboard - OneNumber", 
  description: "Manage notification settings on OneNumber Web app",
  keywords: "notification settings, admin dashboard, OneNumber",
  path: "/admin/dashboard/settings/notification",
});


export default function NotificationPage() {
  return (
    <>

      <main className="max-w-7xl mx-auto">
        <NotificationSettingsPage />
      </main>
    </>
  );
}


