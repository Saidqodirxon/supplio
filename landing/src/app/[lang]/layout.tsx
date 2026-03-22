import { Metadata } from "next";
import { translations, slugToLang } from "@/i18n/translations";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: langParam } = await params;
  const lang = slugToLang(langParam);
  const t = translations[lang];

  return {
    title: `Supplio | ${t.hero.title}`,
    description: t.hero.subtitle,
    openGraph: {
      title: `Supplio | ${t.hero.title}`,
      description: t.hero.subtitle,
      url: `https://supplio.uz/${langParam}`,
      siteName: "Supplio Enterprise",
      locale: lang === 'en' ? 'en_US' : lang === 'ru' ? 'ru_RU' : lang === 'tr' ? 'tr_TR' : 'uz_UZ',
      type: "website",
    },
    alternates: {
      canonical: `https://supplio.uz/${langParam}`,
      languages: {
        'en': 'https://supplio.uz/en',
        'ru': 'https://supplio.uz/ru',
        'uz': 'https://supplio.uz/uz',
        'tr': 'https://supplio.uz/tr',
      },
    },
  };
}

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
