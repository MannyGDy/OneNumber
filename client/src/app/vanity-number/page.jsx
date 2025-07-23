import { VanityNumberHero } from "../../components/vanity/VanityNumberHero";
import { VanityNumberSteps } from "../../components/vanity/VanityNumberSteps";
import { VanityNumberInfo } from "../../components/vanity/VanityNumberInfo";
import NumberGetStarted from "../../components/vanity/NumberGetStarted";
import VanityNumberBottomCTA from "../../components/vanity/VanityNumberBottomCTA";
import { WhyUseVanityNumber } from "../../components/vanity/WhyUseVanityNumber";
import { generateSEOConfig } from "@/utils/seo";
import { Metadata } from "next";
import FeatureCarousel from "@/components/shared/FeatureCarousel";
import VanityNumbersInfo from "@/components/shared/VanityNumbersInfo";

export const metadata = generateSEOConfig({
  title: "Vanity Number | Get a Custom Phone Number",
  description: "Get a custom phone number that spells out your business name or a memorable word. Stand out with a vanity number.",
  keywords: "Vanity Number, Custom Phone Number, Memorable Phone Number, Business Phone Number",
  path: "/vanity-number",
});
export default function VanityNumber() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <VanityNumberHero />
        <main className="flex-grow max-w-7xl mx-auto">
          {/* <VanityNumberSteps /> */}
          <VanityNumberInfo />
            <VanityNumbersInfo />
          <FeatureCarousel />
          <WhyUseVanityNumber />
          <NumberGetStarted />
        </main>
        <VanityNumberBottomCTA />
      </div>
    </>
  );
}










