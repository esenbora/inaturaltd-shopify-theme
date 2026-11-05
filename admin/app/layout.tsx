import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

/*
 * Headings and the brand mark share one face, at different weights.
 *
 * Fraunces used to carry both, which made the word "INature" read as one more
 * heading rather than as a mark. Space Grotesk is a grotesk with enough
 * character to hold a lockup and enough plainness to set a column of figures:
 * the mark takes the bold cut and tightened tracking, headings take semibold,
 * and nothing on the screen needs a third family to tell them apart.
 */
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
      className={`${inter.variable} ${heading.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooter environment={process.env.NODE_ENV} />
      </body>
    </html>
  );
}
