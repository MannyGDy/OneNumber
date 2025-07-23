// app/not-found.tsx
import { generateSEOConfig } from '@/utils/seo'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = generateSEOConfig({
  title: "Virtual Phone System for Businesses | OneNumber",
  description: "OneNumber is a virtual phone system that helps businesses manage calls, texts, and faxes from one number. Get started today!",
  keywords: "virtual phone system, business phone system, OneNumber, call management, text management, fax management, business communication, affordable phone system, virtual phone number, business phone number, call forwarding, voicemail, business texting, faxing, phone system for small business, phone system for startups, phone system for remote teams",
  path: "/"
})


export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary text-white">
      <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 max-w-md w-full">
        <div className="mb-6">
          <span className="text-7xl font-bold text-[#fd8500]">404</span>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Connection Not Found</h2>

        <p className="mb-6 text-gray-300">
          We couldn&apos;t establish a connection to the page you&apos;re looking for. Let&apos;s reconnect you to our main service.
        </p>

        <div className="mb-8 flex justify-center">
          <div className="w-16 h-1 bg-[#fd8500] rounded"></div>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#fd8500] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Return to OneNumber
        </Link>
      </div>

      <p className="mt-8 text-gray-300 text-sm">
        © {new Date().getFullYear()} OneNumber by Cedarview Communication Limited
      </p>

      <p className="mt-2 text-gray-400 text-xs">
        Stay Connected, Anywhere
      </p>
    </div>
  )
}