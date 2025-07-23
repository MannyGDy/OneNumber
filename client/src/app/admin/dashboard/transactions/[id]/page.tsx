
import React from 'react';
import { generateSEOConfig } from '@/utils/seo';
import TransactionDetailsPage from '@/components/admin/transactions/transcationData';

export const metadata = generateSEOConfig({
  title: "Dashboard",
  path: "/dashboard",
});


export default function DashboardPage() {
  return (
    <>

      <main className="max-w-7xl mx-auto">
        <TransactionDetailsPage />
      </main>
    </>
  );
}