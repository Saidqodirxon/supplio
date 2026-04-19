type ApiErrorShape = {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
      resource?: string;
      limitReached?: boolean;
      max?: number;
      code?: string;
    };
  };
  message?: string;
};

const RESOURCE_LABELS: Record<string, Record<string, string>> = {
  customBot: {
    uz: 'Telegram bot',
    ru: 'Telegram бот',
    en: 'Telegram bot',
    tr: 'Telegram bot',
    oz: 'Telegram бот',
  },
  users: {
    uz: 'Xodim',
    ru: 'Сотрудник',
    en: 'Staff',
    tr: 'Personel',
    oz: 'Ходим',
  },
  dealers: {
    uz: 'Diler',
    ru: 'Дилер',
    en: 'Dealer',
    tr: 'Bayi',
    oz: 'Дилер',
  },
  branches: {
    uz: 'Filial',
    ru: 'Филиал',
    en: 'Branch',
    tr: 'Sube',
    oz: 'Филиал',
  },
  products: {
    uz: 'Mahsulot',
    ru: 'Товар',
    en: 'Product',
    tr: 'Urun',
    oz: 'Махсулот',
  },
};

function getResourceLabel(resource?: string, language = 'uz') {
  if (!resource) return '';
  return RESOURCE_LABELS[resource]?.[language] || RESOURCE_LABELS[resource]?.uz || resource;
}

export function getApiErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi', language = 'uz') {
  const e = error as ApiErrorShape;
  const payload = e?.response?.data;
  const rawMessage = payload?.message;
  const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;

  // Demo mode restriction
  if (e?.response?.status === 403 && typeof message === 'string' && message.includes('Demo rejimida')) {
    if (language === 'ru') return 'В демо-режиме это действие недоступно. Нельзя менять пароль, добавлять ботов и изменять настройки.';
    if (language === 'en') return 'This action is restricted in demo mode. Password, bots, and settings cannot be changed.';
    if (language === 'tr') return 'Demo modunda bu işlem kısıtlanmış. Şifre, bot ve ayarlar değiştirilemez.';
    if (language === 'oz') return "Демо режимида бу амал чекланган. Бот, парол ва созламаларни ўзгартириб бўлмайди.";
    return "Demo rejimida bu amal cheklangan. Bot, parol va sozlamalarni o'zgartirish mumkin emas.";
  }

  if (payload?.limitReached || e?.response?.status === 402 || payload?.code === 'PLAN_LIMIT_REACHED') {
    const label = getResourceLabel(payload?.resource, language);
    if (payload?.max && payload.max > 0) {
      if (language === 'ru') return `${label} лимит достигнут. Ваш тариф разрешает до ${payload.max}.`;
      if (language === 'en') return `${label} limit reached. Your plan allows up to ${payload.max}.`;
      if (language === 'tr') return `${label} limiti tugadi. Joriy tarif ${payload.max} tagacha ruxsat beradi.`;
      if (language === 'oz') return `${label} лимити тугади. Жорий тариф ${payload.max} тагача рухсат беради.`;
      return `${label} limiti tugadi. Joriy tarif ${payload.max} tagacha ruxsat beradi.`;
    }

    if (language === 'ru') return `${label} недоступен в вашем текущем тарифе.`;
    if (language === 'en') return `${label} is not available on your current plan.`;
    if (language === 'tr') return `${label} sizning joriy tarifingizda mavjud emas.`;
    if (language === 'oz') return `${label} сизнинг жорий тарифингизда мавжуд эмас.`;
    return `${label} sizning joriy tarifingizda mavjud emas.`;
  }

  return message || e?.message || fallback;
}
