import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooter environment={process.env.NODE_ENV} />
      </body>
    </html>
  );
}
