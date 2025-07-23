"use client"
import "./globals.css";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Foooter";
import { usePathname } from "next/navigation";
import { store, persistor } from "@/redux/store";
import AuthProvider from '@/redux/features/auth/AuthProvider';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from 'react-hot-toast';


import { Inter, Syne, DM_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "./Analytics";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "700"] });
const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // You can add more weights as needed
  variable: '--font-dm-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Exclude Header and Footer on the dashboard
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  return (
    <html lang="en">

      <body
        className={`${inter.className} ${syne.className} ${dmSans.variable} `}
      >
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AuthProvider>
              <Toaster position="top-center" />
              {!isDashboard && !isAdmin && <Header />}
              {/* Google Analytics Scripts */}
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
              </Script>
              <Analytics />
              {children}
              {!isDashboard && !isAdmin && <Footer />}
            </AuthProvider>
          </PersistGate>
        </Provider>


      </body>
    </html>
  )
}
