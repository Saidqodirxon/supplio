import LegalDocumentPage from "@/components/LegalDocumentPage";
import { slugToLang, type Language } from "@/i18n/translations";

const copy: Record<Language, { title: string; subtitle: string }> = {
  en: {
    title: "Terms & Conditions",
    subtitle: "Rules for using Supplio services.",
  },
  uz: {
    title: "Foydalanish shartlari",
    subtitle: "Supplio xizmatlaridan foydalanish qoidalari.",
  },
  ru: {
    title: "Условия использования",
    subtitle: "Правила использования сервисов Supplio.",
  },
  tr: {
    title: "Kullanım Şartları",
    subtitle: "Supplio hizmetlerini kullanma kuralları.",
  },
  oz: {
    title: "Фойдаланиш шартлари",
    subtitle: "Supplio хизматларидан фойдаланиш қоидалари.",
  },
};

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = slugToLang(resolvedParams.lang);
  const text = copy[lang];

  return (
    <LegalDocumentPage
      type="terms"
      title={text.title}
      subtitle={text.subtitle}
    />
  );
}
