import VerificationCodeInput from "@/components/auth/verification/VerificationCodeInput";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Verification",
  path: "/verification",
});

export default function VerificationPage() {
  return (
    <main>
      <VerificationCodeInput />
    </main>
  );
}