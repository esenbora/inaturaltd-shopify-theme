import type { Metadata } from "next";
import { Fraunces, Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";

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

/*
 * The brand lockup has a face of its own.
 *
 * It used to borrow Fraunces, the same face the page titles and the stat
 * figures wear, so the word "INature" read as one more heading rather than as
 * a mark. Instrument Serif is a display face at a single weight: higher
 * contrast, narrower, and nothing else on the screen uses it, which is what
 * makes it read as a signature instead of a title.
 */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
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
      className={`${inter.variable} ${fraunces.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooter environment={process.env.NODE_ENV} />
      </body>
    </html>
  );
}
