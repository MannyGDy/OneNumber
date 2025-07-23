import PersonalInformationForm from "@/components/Dashboard/home/UserDetailsForm";

import { generateSEOConfig } from "@/utils/seo";



export const metadata = generateSEOConfig({
  title: "Personal Information On OneNumber Web app",
  description: "View your personal information on OneNumber Web app",
  keywords: "personal information, OneNumber, user profile, user account, user details",
  path: "/create-account",
});
export default function PersonalInformationPage() {
  return (
    <main>
      <PersonalInformationForm />
    </main>
  );
}