// utils/seo.ts
import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
  path?: string
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://onenumber.com"

export function generateSEOConfig({
  title = "Virtual Phone System for Businesses",
  description = "A comprehensive VOIP-based virtual phone system...",
  keywords = "virtual phone, VOIP, business communication...",
  ogImage = "/assets/svgs/logos/OneNumber Orange logo.svg",
  noIndex = false,
  path = "/"
}: SEOProps): Metadata {
  const fullTitle = `OneNumber | ${title}`
  const imageUrl = `${siteUrl}${ogImage}`

  return {
    title: fullTitle,
    description,
    keywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: path
    },
    openGraph: {
      title: fullTitle,
      description,
      images: imageUrl,
      type: 'website',
      url: `${siteUrl}${path}`
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: imageUrl
    },
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
      other: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png' }
      ]
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1
    }
  }
}