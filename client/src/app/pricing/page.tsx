import Pricing from "@/components/shared/Pricing";
import FAQS from "@/components/shared/FAQS";
import { generateSEOConfig } from "@/utils/seo";

export const metadata = generateSEOConfig({
  title: "Pricing On OneNumber Web app",
  description: "Pricing On OneNumber Web app",
  keywords: "pricing, OneNumber, pricing plans, subscription",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>

      <main >
        <section className="flex flex-col gap-8 mx-auto max-w-7xl">
          <Pricing />
        </section>
        <FAQS />
      </main>
    </>
  );
}