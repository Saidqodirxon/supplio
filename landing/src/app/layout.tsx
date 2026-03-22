import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Supplio | B2B Distribution Platform",
  description: "All-in-one SaaS platform for manufacturers and distributors. Manage dealers, track credit limits, and streamline your supply chain.",
  keywords: ["B2B SaaS", "Distribution", "Dealer Management", "Credit Sales", "Telegram Bot", "Supplio"],
  openGraph: {
    title: "Supplio | Smart Distribution Starts Here",
    description: "Manage dealers, track credit, automate orders through Telegram. Built for manufacturers and distributors.",
    url: "https://supplio.uz",
    siteName: "Supplio",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
  metadataBase: new URL("https://supplio.uz"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${outfit.className} bg-white antialiased`}>{children}</body>
    </html>
  );
}
