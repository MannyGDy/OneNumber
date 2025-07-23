import SignupPage from "@/components/auth/signup/SignupPage";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Signup",
  path: "/signup",
});

export default function Home() {
  return (
    <>
      <main className="max-w-7xl mx-auto">
        <SignupPage />
      </main>
    </>
  );
}
