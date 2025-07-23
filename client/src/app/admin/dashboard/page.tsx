import AdminDashboardPage from "@/components/admin/home/AdminDashboard";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Admin DashBoard - OneNumber",
  description: "Admin dashboard for managing OneNumber Web app",
  keywords: "admin dashboard, OneNumber, management",
  path: "/login",
});

export default function Home() {
  return (
    <>
      <main className="max-w-7xl mx-auto">
        <AdminDashboardPage />
      </main>
    </>
  );
}
