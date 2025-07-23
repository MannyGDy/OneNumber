import PhoneNumberManagement from "@/components/admin/phone_number/PhoneNumberManagement";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Admin DashBoard - Phone Number Management",
  description: "Manage phone numbers on OneNumber Web app",
  keywords: "phone number management, admin dashboard, OneNumber",
  path: "/login",
});

export default function Home() {
  return (
    <>
      <main className="max-w-7xl mx-auto">
        <PhoneNumberManagement />
      </main>
    </>
  );
}
