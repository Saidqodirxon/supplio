import LegalDocumentPage from "@/components/LegalDocumentPage";
import { slugToLang, type Language } from "@/i18n/translations";

const copy: Record<Language, { title: string; subtitle: string }> = {
  en: {
    title: "Privacy Policy",
    subtitle: "How Supplio collects, uses and protects your data.",
  },
  uz: {
    title: "Maxfiylik siyosati",
    subtitle: "Supplio ma'lumotlarni qanday to'playdi, ishlatadi va himoya qiladi.",
  },
  ru: {
    title: "Политика конфиденциальности",
    subtitle: "Как Supplio собирает, использует и защищает ваши данные.",
  },
  tr: {
    title: "Gizlilik Politikası",
    subtitle: "Supplio verilerinizi nasıl toplar, kullanır ve korur.",
  },
  oz: {
    title: "Махфийлик сиёсати",
    subtitle: "Supplio маълумотларни қандай тўплайди, ишлатади ва ҳимоя қилади.",
  },
};

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = slugToLang(resolvedParams.lang);
  const text = copy[lang];

  return (
    <LegalDocumentPage
      type="privacy"
      title={text.title}
      subtitle={text.subtitle}
    />
  );
}
