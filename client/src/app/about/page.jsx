import Head from "next/head";
import Hero from "../../components/about/Hero";
import AboutSection from "../../components/about/AboutSection";
import ValuePropositions from "../../components/about/ValuePropositions";
import GetStarted from "../../components/home/GetStarted";
import { generateSEOConfig } from "@/utils/seo";


export const metadata = generateSEOConfig({
  title: "About Us ",
  description: "Learn more about our company and what we do. We provide a virtual phone system for businesses.",
  keywords: "About Us, Company, Virtual Phone System",
  path: "/about",
});

export default function About() {
  return (
    <div className="min-h-screen  flex-col">
      <Hero
        title="The virtual phone system for businesses"
        subtitle="Your business phone number combined with a complete virtual phone system."
      />
      <main className="flex-grow max-w-7xl mx-auto">
        <AboutSection />
        <ValuePropositions />
        <GetStarted />
      </main>
    </div>
  );
}
