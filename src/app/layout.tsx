import type { Metadata } from "next";
import { Bricolage_Grotesque, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteBrandMark } from "@/components/layout/site-brand-mark";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ikwetha Platform",
  description:
    "Premium brand, commerce, content, and ticketing platform for Lilitha Ntsundwani under Ikwetha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${cormorant.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(circle_at_top,rgba(223,168,115,0.24),transparent_55%),radial-gradient(circle_at_top_right,rgba(13,148,136,0.14),transparent_35%)]" />
            <SiteHeader />
            <div className="mx-auto flex w-full max-w-7xl justify-center px-4 pt-6 md:px-8 md:pt-8">
              <Link href="/" className="inline-flex">
                <SiteBrandMark size="hero" />
              </Link>
            </div>
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
