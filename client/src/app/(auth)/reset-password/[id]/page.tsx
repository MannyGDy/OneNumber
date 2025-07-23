import PasswordReset from "@/components/auth/reset-password/PasswordReset";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Reset Password",
  path: "/reset-password",
});

export default function ResetPasswordPage() {
  return (
    <main>
      <PasswordReset />
    </main>
  );
}