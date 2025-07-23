import ForgotPassword from "@/components/auth/forgot-password/ForgotPassword";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Forgot Password On OneNumber Web app",
  description: "Reset your password on OneNumber Web app",
  keywords: "forgot password, reset password, OneNumber admin, admin, password",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <main>
      <ForgotPassword />
    </main>
  );
}