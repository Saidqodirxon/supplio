import { toast as baseToast } from 'sonner';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from './apiError';

type Lang = 'uz' | 'ru' | 'en' | 'tr' | 'oz';

type ToastInput = unknown;

const MESSAGE_MAP: Record<string, Record<Lang, string>> = {
  'Error': {
    uz: 'Xatolik yuz berdi',
    ru: 'Произошла ошибка',
    en: 'Something went wrong',
    tr: 'Bir hata oluştu',
    oz: 'Хатолик юз берди',
  },
  'Something went wrong': {
    uz: 'Xatolik yuz berdi',
    ru: 'Произошла ошибка',
    en: 'Something went wrong',
    tr: 'Bir hata oluştu',
    oz: 'Хатолик юз берди',
  },
  'Failed to load': {
    uz: 'Yuklashda xatolik',
    ru: 'Ошибка загрузки',
    en: 'Failed to load',
    tr: 'Yuklashda xatolik',
    oz: 'Юклашда хатолик',
  },
  'Failed to load form data': {
    uz: 'Forma maʼlumotlarini yuklashda xatolik',
    ru: 'Ошибка загрузки данных формы',
    en: 'Failed to load form data',
    tr: 'Form maʼlumotlarini yuklashda xatolik',
    oz: 'Форма маълумотларини юклашда хатолик',
  },
  'Failed to load reports': {
    uz: 'Hisobotlarni yuklashda xatolik',
    ru: 'Ошибка загрузки отчетов',
    en: 'Failed to load reports',
    tr: 'Hisobotlarni yuklashda xatolik',
    oz: 'Ҳисоботларни юклашда хатолик',
  },
  'Saved': {
    uz: 'Saqlandi',
    ru: 'Сохранено',
    en: 'Saved',
    tr: 'Kaydedildi',
    oz: 'Сакланди',
  },
  'Deleted': {
    uz: "O'chirildi",
    ru: 'Удалено',
    en: 'Deleted',
    tr: 'Silindi',
    oz: 'Учирилди',
  },
  'Copied!': {
    uz: 'Nusxalandi',
    ru: 'Скопировано',
    en: 'Copied!',
    tr: 'Kopyalandi',
    oz: 'Нусхаланди',
  },
  'Only image files are allowed': {
    uz: 'Faqat rasm fayllariga ruxsat beriladi',
    ru: 'Разрешены только изображения',
    en: 'Only image files are allowed',
    tr: 'Faqat rasm fayllariga ruxsat beriladi',
    oz: 'Факат расм файлларига рухсат берилади',
  },
  'File size must be under 5MB': {
    uz: "Fayl hajmi 5MB dan kichik bo'lishi kerak",
    ru: 'Размер файла должен быть меньше 5MB',
    en: 'File size must be under 5MB',
    tr: "Fayl hajmi 5MB dan kichik bo'lishi kerak",
    oz: 'Файл хажми 5MB дан кичик булиши керак',
  },
  'Upload failed. Try again.': {
    uz: 'Yuklash muvaffaqiyatsiz bo‘ldi. Qayta urinib ko‘ring.',
    ru: 'Ошибка загрузки. Попробуйте снова.',
    en: 'Upload failed. Try again.',
    tr: 'Yuklash muvaffaqiyatsiz bo‘ldi. Qayta urinib ko‘ring.',
    oz: 'Юклаш муваффақиятсиз булди. Кайта уриниб куринг.',
  },
  'Ism kiritilmadi': {
    uz: 'Ism kiritilmadi',
    ru: 'Имя не указано',
    en: 'Name is required',
    tr: 'Ism kiritilmadi',
    oz: 'Исм киритилмади',
  },
  "Telefon raqami noto'g'ri": {
    uz: "Telefon raqami noto'g'ri",
    ru: 'Неверный номер телефона',
    en: 'Phone number is invalid',
    tr: "Telefon raqami noto'g'ri",
    oz: 'Телефон раками нотугри',
  },
  'Filial tanlanmadi': {
    uz: 'Filial tanlanmadi',
    ru: 'Филиал не выбран',
    en: 'Branch is required',
    tr: 'Filial tanlanmadi',
    oz: 'Филиал танланмади',
  },
  "Diler qo'shildi": {
    uz: "Diler qo'shildi",
    ru: 'Дилер добавлен',
    en: 'Dealer added',
    tr: "Diler qo'shildi",
    oz: 'Дилер кушилди',
  },
  'Diler yangilandi': {
    uz: 'Diler yangilandi',
    ru: 'Дилер обновлен',
    en: 'Dealer updated',
    tr: 'Diler yangilandi',
    oz: 'Дилер янгиланди',
  },
  "Diler o'chirildi": {
    uz: "Diler o'chirildi",
    ru: 'Дилер удален',
    en: 'Dealer deleted',
    tr: "Diler o'chirildi",
    oz: 'Дилер учирилди',
  },
  "O'chirishda xatolik": {
    uz: "O'chirishda xatolik",
    ru: 'Ошибка удаления',
    en: 'Failed to delete',
    tr: "O'chirishda xatolik",
    oz: 'Учиришда хатолик',
  },
  'Blok olib tashlandi': {
    uz: 'Blok olib tashlandi',
    ru: 'Блок снят',
    en: 'Block removed',
    tr: 'Blok olib tashlandi',
    oz: 'Блок олиб ташланди',
  },
  'Diler bloklandi': {
    uz: 'Diler bloklandi',
    ru: 'Дилер заблокирован',
    en: 'Dealer blocked',
    tr: 'Diler bloklandi',
    oz: 'Дилер блокланди',
  },
  'Branch name is required': {
    uz: 'Filial nomi majburiy',
    ru: 'Название филиала обязательно',
    en: 'Branch name is required',
    tr: 'Filial nomi majburiy',
    oz: 'Филиал номи мажбурий',
  },
  'Branch updated': {
    uz: 'Filial yangilandi',
    ru: 'Филиал обновлен',
    en: 'Branch updated',
    tr: 'Filial yangilandi',
    oz: 'Филиал янгиланди',
  },
  'Branch created': {
    uz: 'Filial yaratildi',
    ru: 'Филиал создан',
    en: 'Branch created',
    tr: 'Filial yaratildi',
    oz: 'Филиал яратилди',
  },
  'Branch deleted': {
    uz: "Filial o'chirildi",
    ru: 'Филиал удален',
    en: 'Branch deleted',
    tr: "Filial o'chirildi",
    oz: 'Филиал учирилди',
  },
  'Failed to delete branch': {
    uz: "Filialni o'chirishda xatolik",
    ru: 'Ошибка удаления филиала',
    en: 'Failed to delete branch',
    tr: "Filialni o'chirishda xatolik",
    oz: 'Филиални учиришда хатолик',
  },
  'Marked all read': {
    uz: "Barchasi o'qilgan deb belgilandi",
    ru: 'Все отмечены как прочитанные',
    en: 'Marked all read',
    tr: "Barchasi o'qilgan deb belgilandi",
    oz: 'Барчаси укилган деб белгиланди',
  },
  'Notification sent': {
    uz: 'Bildirishnoma yuborildi',
    ru: 'Уведомление отправлено',
    en: 'Notification sent',
    tr: 'Bildirishnoma yuborildi',
    oz: 'Билдиришнома юборилди',
  },
  'Nom kiritilmadi': {
    uz: 'Nom kiritilmadi',
    ru: 'Название не указано',
    en: 'Name is required',
    tr: 'Nom kiritilmadi',
    oz: 'Ном киритилмади',
  },
  'Template yangilandi': {
    uz: 'Template yangilandi',
    ru: 'Шаблон обновлен',
    en: 'Template updated',
    tr: 'Template yangilandi',
    oz: 'Темплейт янгиланди',
  },
  'Template yaratildi': {
    uz: 'Template yaratildi',
    ru: 'Шаблон создан',
    en: 'Template created',
    tr: 'Template yaratildi',
    oz: 'Темплейт яратилди',
  },
  "Yoqildi": {
    uz: 'Yoqildi',
    ru: 'Включено',
    en: 'Enabled',
    tr: 'Yoqildi',
    oz: 'Ёкилди',
  },
  'Default templatelar yaratildi': {
    uz: 'Default template lar yaratildi',
    ru: 'Шаблоны по умолчанию созданы',
    en: 'Default templates created',
    tr: 'Default template lar yaratildi',
    oz: 'Default темплейтлар яратилди',
  },
  'Select a dealer': {
    uz: 'Diler tanlang',
    ru: 'Выберите дилера',
    en: 'Select a dealer',
    tr: 'Diler tanlang',
    oz: 'Дилер танланг',
  },
  'Select a branch': {
    uz: 'Filial tanlang',
    ru: 'Выберите филиал',
    en: 'Select a branch',
    tr: 'Filial tanlang',
    oz: 'Филиал танланг',
  },
  'Select a product for each line': {
    uz: 'Har bir qator uchun mahsulot tanlang',
    ru: 'Выберите товар для каждой строки',
    en: 'Select a product for each line',
    tr: 'Har bir qator uchun mahsulot tanlang',
    oz: 'Хар бир катор учун махсулот танланг',
  },
  'Order created': {
    uz: 'Buyurtma yaratildi',
    ru: 'Заказ создан',
    en: 'Order created',
    tr: 'Buyurtma yaratildi',
    oz: 'Буюртма яратилди',
  },
  'Failed to create order': {
    uz: 'Buyurtma yaratishda xatolik',
    ru: 'Ошибка создания заказа',
    en: 'Failed to create order',
    tr: 'Buyurtma yaratishda xatolik',
    oz: 'Буюртма яратишда хатолик',
  },
  'Status updated': {
    uz: 'Status yangilandi',
    ru: 'Статус обновлен',
    en: 'Status updated',
    tr: 'Status yangilandi',
    oz: 'Статус янгиланди',
  },
  'Failed to update status': {
    uz: 'Statusni yangilashda xatolik',
    ru: 'Ошибка обновления статуса',
    en: 'Failed to update status',
    tr: 'Statusni yangilashda xatolik',
    oz: 'Статусни янгилашда хатолик',
  },
  'Failed to approve': {
    uz: 'Tasdiqlashda xatolik',
    ru: 'Ошибка подтверждения',
    en: 'Failed to approve',
    tr: 'Tasdiqlashda xatolik',
    oz: 'Тасдиклашда хатолик',
  },
  'Rejected': {
    uz: 'Rad etildi',
    ru: 'Отклонено',
    en: 'Rejected',
    tr: 'Rad etildi',
    oz: 'Рад этилди',
  },
  'Failed to reject': {
    uz: 'Rad etishda xatolik',
    ru: 'Ошибка отклонения',
    en: 'Failed to reject',
    tr: 'Rad etishda xatolik',
    oz: 'Рад этишда хатолик',
  },
  'Role name required': {
    uz: 'Rol nomi majburiy',
    ru: 'Название роли обязательно',
    en: 'Role name required',
    tr: 'Rol nomi majburiy',
    oz: 'Рол номи мажбурий',
  },
  'Bot added successfully': {
    uz: "Bot muvaffaqiyatli qo'shildi",
    ru: 'Бот успешно добавлен',
    en: 'Bot added successfully',
    tr: "Bot muvaffaqiyatli qo'shildi",
    oz: 'Бот муваффакиятли кушилди',
  },
  'Failed to add bot': {
    uz: "Bot qo'shishda xatolik",
    ru: 'Ошибка добавления бота',
    en: 'Failed to add bot',
    tr: "Bot qo'shishda xatolik",
    oz: 'Бот кушишда хатолик',
  },
  'Failed to save': {
    uz: 'Saqlashda xatolik',
    ru: 'Ошибка сохранения',
    en: 'Failed to save',
    tr: 'Saqlashda xatolik',
    oz: 'Саклашда хатолик',
  },
  'Bot removed': {
    uz: "Bot o'chirildi",
    ru: 'Бот удален',
    en: 'Bot removed',
    tr: "Bot o'chirildi",
    oz: 'Бот учирилди',
  },
  'Failed to remove bot': {
    uz: "Botni o'chirishda xatolik",
    ru: 'Ошибка удаления бота',
    en: 'Failed to remove bot',
    tr: "Botni o'chirishda xatolik",
    oz: 'Ботни учиришда хатолик',
  },
  'Xabar matnini kiriting': {
    uz: 'Xabar matnini kiriting',
    ru: 'Введите текст сообщения',
    en: 'Enter the message text',
    tr: 'Xabar matnini kiriting',
    oz: 'Хабар матнини киритинг',
  },
  'Xabar yuborishda xatolik': {
    uz: 'Xabar yuborishda xatolik',
    ru: 'Ошибка отправки сообщения',
    en: 'Failed to send message',
    tr: 'Xabar yuborishda xatolik',
    oz: 'Хабар юборишда хатолик',
  },
  "Do'kon yoqildi": {
    uz: "Do'kon yoqildi",
    ru: 'Магазин включен',
    en: 'Store enabled',
    tr: "Do'kon yoqildi",
    oz: 'Дукон ёкилди',
  },
  "Do'kon o'chirildi": {
    uz: "Do'kon o'chirildi",
    ru: 'Магазин отключен',
    en: 'Store disabled',
    tr: "Do'kon o'chirildi",
    oz: 'Дукон учирилди',
  },
  'Demo rejimida bu amalni bajarib bo\'lmaydi. Parolni, bot va tashkilot sozlamalarini o\'zgartirish cheklangan.': {
    uz: "Demo rejimida bu amal cheklangan. Bot, parol va sozlamalarni o'zgartirish mumkin emas.",
    ru: 'В демо-режиме это действие недоступно. Нельзя менять пароль, добавлять ботов и изменять настройки.',
    en: 'This action is restricted in demo mode. Password, bots, and settings cannot be changed.',
    tr: "Demo modunda bu işlem kısıtlanmış. Şifre, bot ve ayarlar değiştirilemez.",
    oz: "Демо режимида бу амал чекланган. Бот, парол ва созламаларни ўзгартириб бўлмайди.",
  },
  'Demo rejimida bot o\'chirib bo\'lmaydi.': {
    uz: "Demo rejimida bot o'chirib bo'lmaydi.",
    ru: 'В демо-режиме нельзя удалить бота.',
    en: 'Cannot delete bot in demo mode.',
    tr: "Demo modunda bot silinemez.",
    oz: "Демо режимида ботни учириб бўлмайди.",
  },
  'Plan limit reached': {
    uz: "Tarif limiti to'ldi. Tarifni oshiring.",
    ru: 'Достигнут лимит тарифа. Повысьте тариф.',
    en: 'Plan limit reached. Please upgrade your plan.',
    tr: 'Tarif limiti doldu. Tarifı yükseltin.',
    oz: "Тариф лимити тулди. Тарифни оширинг.",
  },
};

function getLanguage(): Lang {
  const language = useAuthStore.getState().language;
  return (language || 'uz') as Lang;
}

function localizeText(input: string, language: Lang): string {
  const trimmed = input.trim();
  const direct = MESSAGE_MAP[trimmed];
  if (direct) return direct[language] || direct.uz || trimmed;

  const sentMatch = trimmed.match(/^Yuborildi:\s*(\d+)\s*ta$/i);
  if (sentMatch) {
    const count = sentMatch[1];
    if (language === 'ru') return `Отправлено: ${count}`;
    if (language === 'en') return `Sent: ${count}`;
    if (language === 'tr') return `Yuborildi: ${count} ta`;
    if (language === 'oz') return `Юборилди: ${count} та`;
    return `Yuborildi: ${count} ta`;
  }

  return trimmed;
}

function localizeMessage(input: ToastInput, fallback = 'Xatolik yuz berdi') {
  const language = getLanguage();
  if (typeof input === 'string') {
    return localizeText(input, language);
  }
  return getApiErrorMessage(input, fallback, language);
}

export const toast = {
  ...baseToast,
  success(message: ToastInput, ...args: unknown[]) {
    return baseToast.success(localizeMessage(message, 'Saved'), ...(args as []));
  },
  error(message: ToastInput, ...args: unknown[]) {
    return baseToast.error(localizeMessage(message, 'Xatolik yuz berdi'), ...(args as []));
  },
  info(message: ToastInput, ...args: unknown[]) {
    return baseToast.info(localizeMessage(message, 'Maʼlumot'), ...(args as []));
  },
  warning(message: ToastInput, ...args: unknown[]) {
    return (baseToast as any).warning(localizeMessage(message, 'Ogohlantirish'), ...(args as []));
  },
  message(message: ToastInput, ...args: unknown[]) {
    return baseToast(localizeMessage(message, ''), ...(args as []));
  },
};
