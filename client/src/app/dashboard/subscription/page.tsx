import SubscriptionPage from "@/components/home/Subscription";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Subscription - Dashboard - OneNumber",
  description: "Manage your subscription on OneNumber Web app",
  keywords: "subscription, user dashboard, OneNumber, user, settings",
  path: "/dashboard/subscription",
});
export default function Subscription() {
  return (
    <main>
      <SubscriptionPage />
    </main>
  );
}
