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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      "yandex-verification": process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ?? "",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Supplio",
  url: "https://supplio.uz",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  description:
    "All-in-one B2B SaaS platform for manufacturers and distributors. Manage dealers, track credit limits, automate orders via Telegram.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UZS",
  },
  author: {
    "@type": "Organization",
    name: "Supplio",
    url: "https://supplio.uz",
    logo: "https://supplio.uz/favicon.png",
    sameAs: [
      "https://www.instagram.com/supplio__app/",
      "https://www.linkedin.com/company/supplioapp",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+998901234567",
      contactType: "customer support",
      availableLanguage: ["Uzbek", "Russian", "English"],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.className} bg-white antialiased`}>{children}</body>
    </html>
  );
}
