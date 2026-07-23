import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { LogoutButton } from "@/components/logout-button";
import { NavTabs } from "@/components/nav-tabs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "INature Admin",
  description: "Content management for the INature UK Shopify store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-3">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="u-serif text-lg font-semibold text-ink">
                INature
              </span>
              <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sage-dark">
                Admin
              </span>
            </Link>
            <NavTabs />
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
