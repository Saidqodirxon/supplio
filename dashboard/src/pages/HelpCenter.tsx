import { useMemo, useState, useEffect } from "react";
import { LifeBuoy, Phone, Mail, MapPin, Send, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

type LandingData = {
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactAddressUrl?: string;
  socialTelegram?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialTwitter?: string;
};

function normalizeTelegramLink(value?: string) {
  if (!value) return "";
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  if (v.startsWith("@")) return `https://t.me/${v.slice(1)}`;
  return `https://t.me/${v}`;
}

export default function HelpCenter() {
  const { language, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [landing, setLanding] = useState<LandingData | null>(null);
  const [form, setForm] = useState({
    category: "Bug",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setLoading(true);
    api
      .get("/public/home")
      .then((res) => {
        setLanding((res.data?.landing || null) as LandingData | null);
      })
      .catch(() => setLanding(null))
      .finally(() => setLoading(false));
  }, []);

  const text = useMemo(() => {
    if (language === "ru") {
      return {
        title: "Центр помощи",
        subtitle: "Все способы связи и отправка обращения об ошибке",
        methods: "Способы связи",
        report: "Отправить обращение",
        category: "Категория",
        subject: "Тема",
        message: "Описание",
        submit: "Отправить",
        sent: "Обращение отправлено",
        errorFields: "Тема и описание обязательны",
        errorSend: "Ошибка при отправке",
        categories: { Bug: "Ошибка", Question: "Вопрос", Access: "Доступ", Other: "Другое" },
        labels: { Phone: "Телефон", Email: "Email", Telegram: "Telegram", Instagram: "Instagram", LinkedIn: "LinkedIn", Twitter: "Twitter", Address: "Адрес" },
        open: "Открыть",
      };
    }
    if (language === "en") {
      return {
        title: "Help Center",
        subtitle: "All support channels and issue request form",
        methods: "Contact Methods",
        report: "Report an Issue",
        category: "Category",
        subject: "Subject",
        message: "Description",
        submit: "Submit",
        sent: "Request submitted",
        errorFields: "Subject and description are required",
        errorSend: "Failed to send request",
        categories: { Bug: "Bug", Question: "Question", Access: "Access", Other: "Other" },
        labels: { Phone: "Phone", Email: "Email", Telegram: "Telegram", Instagram: "Instagram", LinkedIn: "LinkedIn", Twitter: "Twitter", Address: "Address" },
        open: "Open",
      };
    }
    if (language === "tr") {
      return {
        title: "Yardım Merkezi",
        subtitle: "Tüm destek kanalları ve hata bildirim formu",
        methods: "İletişim Kanalları",
        report: "Hata Bildir",
        category: "Kategori",
        subject: "Konu",
        message: "Açıklama",
        submit: "Gönder",
        sent: "Talep gönderildi",
        errorFields: "Konu ve açıklama gereklidir",
        errorSend: "Talep gönderilemedi",
        categories: { Bug: "Hata", Question: "Soru", Access: "Erişim", Other: "Diğer" },
        labels: { Phone: "Telefon", Email: "Email", Telegram: "Telegram", Instagram: "Instagram", LinkedIn: "LinkedIn", Twitter: "Twitter", Address: "Adres" },
        open: "Aç",
      };
    }
    return {
      title: "Yordam markazi",
      subtitle: "Barcha aloqa usullari va xatolik arizasi formi",
      methods: "Yordam olish usullari",
      report: "Xatolik arizasi yuborish",
      category: "Kategoriya",
      subject: "Mavzu",
      message: "Tavsif",
      submit: "Yuborish",
      sent: "Ariza yuborildi",
      errorFields: "Mavzu va tavsif to'ldirilishi kerak",
      errorSend: "Ariza yuborishda xatolik",
      categories: { Bug: "Xatolik", Question: "Savol", Access: "Kirish muammosi", Other: "Boshqa" },
      labels: { Phone: "Telefon", Email: "Email", Telegram: "Telegram", Instagram: "Instagram", LinkedIn: "LinkedIn", Twitter: "Twitter", Address: "Manzil" },
      open: "Ochish",
    };
  }, [language]);

  const phone = (landing?.contactPhone || "+998901112233").trim();
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const email = landing?.contactEmail?.trim() || "";
  const emailHref = email ? `mailto:${email}` : "";
  const tg = normalizeTelegramLink(landing?.socialTelegram);
  const instagram = landing?.socialInstagram?.trim() || "";
  const linkedin = landing?.socialLinkedin?.trim() || "";
  const twitter = landing?.socialTwitter?.trim() || "";
  const address = landing?.contactAddress?.trim() || "";
  const addressUrl = landing?.contactAddressUrl?.trim() || "";

  const methods = [
    { label: text.labels.Phone, value: phone, href: phoneHref, icon: Phone },
    { label: text.labels.Email, value: email, href: emailHref, icon: Mail },
    { label: text.labels.Telegram, value: tg, href: tg, icon: Send },
    { label: text.labels.Instagram, value: instagram, href: instagram, icon: ExternalLink },
    { label: text.labels.LinkedIn, value: linkedin, href: linkedin, icon: ExternalLink },
    { label: text.labels.Twitter, value: twitter, href: twitter, icon: ExternalLink },
    { label: text.labels.Address, value: address, href: addressUrl, icon: MapPin },
  ].filter((m) => m.value);

  const submitIssue = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error(text.errorFields);
      return;
    }

    const info = [
      "SUPPORT_TICKET",
      `Source: Dashboard`,
      `Category: ${form.category}`,
      `Subject: ${form.subject.trim()}`,
      `Message: ${form.message.trim()}`,
      `UserRole: ${user?.roleType || "UNKNOWN"}`,
      `UserId: ${user?.id || "-"}`,
    ].join(" | ");

    setSending(true);
    try {
      await api.post("/leads", {
        fullName: user?.fullName || user?.phone || "Dashboard User",
        phone: user?.phone || "+998000000000",
        info,
      });
      toast.success(text.sent);
      setForm({ category: "Bug", subject: "", message: "" });
    } catch {
      toast.error(text.errorSend);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{text.title}</h1>
            <p className="text-slate-500 text-sm font-medium">{text.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{text.methods}</h2>
          {loading ? (
            <div className="py-10 flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {methods.map((m) => (
                <a
                  key={`${m.label}-${m.value}`}
                  href={m.href || "#"}
                  target={m.href?.startsWith("http") ? "_blank" : undefined}
                  rel={m.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-500/10 transition-all"
                >
                  <span className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
                    <m.icon className="w-4 h-4 text-blue-600" /> {m.label}
                  </span>
                  <span className="text-xs text-slate-500 truncate max-w-[60%]">{m.value}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{text.report}</h2>
          <div className="grid grid-cols-1 gap-3">
            <label className="text-xs font-bold text-slate-500">{text.category}</label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold"
            >
              <option value="Bug">{text.categories.Bug}</option>
              <option value="Question">{text.categories.Question}</option>
              <option value="Access">{text.categories.Access}</option>
              <option value="Other">{text.categories.Other}</option>
            </select>

            <label className="text-xs font-bold text-slate-500">{text.subject}</label>
            <input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder={text.subject}
              className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold"
            />

            <label className="text-xs font-bold text-slate-500">{text.message}</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              placeholder={text.message}
              className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold resize-none"
            />

            <button
              onClick={submitIssue}
              disabled={sending}
              className="mt-2 py-3 rounded-xl bg-blue-600 text-white font-black text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />} {text.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
