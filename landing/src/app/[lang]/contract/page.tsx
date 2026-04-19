import LegalDocumentPage from "@/components/LegalDocumentPage";
import { slugToLang, type Language } from "@/i18n/translations";

const copy: Record<Language, { title: string; subtitle: string }> = {
  en: {
    title: "Service Agreement",
    subtitle: "The service contract between Supplio and the customer.",
  },
  uz: {
    title: "Shartnoma",
    subtitle: "Supplio va mijoz o'rtasidagi xizmat shartnomasi.",
  },
  ru: {
    title: "Договор",
    subtitle: "Договор на обслуживание между Supplio и клиентом.",
  },
  tr: {
    title: "Hizmet Sözleşmesi",
    subtitle: "Supplio ile müşteri arasındaki hizmet sözleşmesi.",
  },
  oz: {
    title: "Шартнома",
    subtitle: "Supplio ва мижоз ўртасидаги хизмат шартномаси.",
  },
};

export default async function ContractPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = await params;
  const lang = slugToLang(resolvedParams.lang);
  const text = copy[lang];

  return (
    <LegalDocumentPage
      type="contract"
      title={text.title}
      subtitle={text.subtitle}
    />
  );
}
