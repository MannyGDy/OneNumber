import React from 'react';
import { generateSEOConfig } from '@/utils/seo';
import TransactionHistory from '@/components/admin/transactions/transcations';

export const metadata = generateSEOConfig({
  title: "Dashboard",
  path: "/dashboard",
});


export default function DashboardPage() {
  return (
    <>

      <main className="max-w-7xl mx-auto">
        <TransactionHistory />
      </main>
    </>
  );
}