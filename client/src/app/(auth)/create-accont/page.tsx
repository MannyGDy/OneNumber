import { generateSEOConfig } from "@/utils/seo";
import RegisterForm from "@/components/auth/signup/SignupPage";

export const metadata = generateSEOConfig({
  title: "Register On OneNumber Web app",
  description: "Create your OneNumber account",
  keywords: "register, create account, OneNumber",
  path: "/create-account",
});

export default function CreateAccount() {
  return (
    <main>
      <RegisterForm />
    </main>
  );
}