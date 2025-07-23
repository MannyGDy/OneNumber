import NumberGetStarted from "../../components/vanity/NumberGetStarted";
import VanityNumberBottomCTA from "../../components/vanity/VanityNumberBottomCTA";
import { TollFreeNumberHero } from "@/components/toll-free/TollFreeNumberHero";
import { TollFreeNumberSteps } from "@/components/toll-free/TollFreeNumberSteps";
import { TollFreeNumberInfo } from "@/components/toll-free/TollFreeNumberInfo";
import { WhyUseTollFreeNumber } from "@/components/toll-free/WhyUseTollFreeNumber";
import { generateSEOConfig } from "@/utils/seo";
import FeatureCarousel from "@/components/shared/FeatureCarousel";
import VanityNumbersInfo from "@/components/shared/VanityNumbersInfo";

export const metadata = generateSEOConfig({
  title: "Toll Free Number - OneNumber",
  description: "Get a toll-free number for your business with OneNumber. Enhance customer support and boost your brand's credibility.",
  keywords: "toll-free number, business phone number, customer support, OneNumber",
  path: "/toll-free",
});

export default function VanityNumber() {
  return (
    <>

      <div className="min-h-screen  flex flex-col">
        <TollFreeNumberHero />
        <main className="flex-grow max-w-7xl mx-auto">
          <TollFreeNumberSteps />
          <TollFreeNumberInfo />
           <VanityNumbersInfo />
          <FeatureCarousel />
          <WhyUseTollFreeNumber />
          <NumberGetStarted />
        </main>
        <VanityNumberBottomCTA />
      </div>
    </>
  );
}
