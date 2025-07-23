
import Hero from "@/components/home/Hero";
import ValueProposition from "@/components/home/ValueProposition";
import Services from "@/components/home/Services";
// import AffordableOptions from "@/components/home/AffordableOptions";
import GetStarted from "@/components/home/GetStarted";
import { generateSEOConfig } from '@/utils/seo'
import { Metadata } from 'next'

export const metadata: Metadata = generateSEOConfig({
  title: "Virtual Phone System for Businesses | OneNumber",
  description: "OneNumber is a virtual phone system that helps businesses manage calls, texts, and faxes from one number. Get started today!",
  keywords: "virtual phone system, business phone system, OneNumber, call management, text management, fax management, business communication, affordable phone system, virtual phone number, business phone number, call forwarding, voicemail, business texting, faxing, phone system for small business, phone system for startups, phone system for remote teams",
  path: "/"
})

export default function Home() {
  return (
    <>

      <main >
        <Hero />
        <div className="max-w-7xl mx-auto">
          <ValueProposition />
          <Services />
          {/* <AffordableOptions /> */}
        </div>
        <GetStarted />
      </main>
    </>
  );
}
