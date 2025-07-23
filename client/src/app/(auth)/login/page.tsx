import LoginPage from "@/components/auth/login/LoginPage";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Login On OneNumber Web app",
  description: "Login to your OneNumber account", 
  keywords: "login, OneNumber, password, admin",
  path: "/login",
});

export default function Home() {
  return (
    <>
      <main className="max-w-7xl mx-auto">
        <LoginPage />
      </main>
    </>
  );
}
