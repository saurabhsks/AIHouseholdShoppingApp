import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GharCart",
  description:
    "An AI shopping assistant for household essentials. Review the cart before checkout.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <header className="border-b border-stone-200 bg-card px-6 py-4 text-sm font-semibold tracking-wide text-accent uppercase dark:border-stone-700">
              GharCart
            </header>
          }
        >
          <SiteHeader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
