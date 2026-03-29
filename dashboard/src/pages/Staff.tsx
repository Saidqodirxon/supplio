import { useState, useEffect, useMemo } from 'react';
import {
  Users, Plus, X, UserX, Shield, AlertTriangle, Pencil, Trash2,
  Settings2, Search, SortAsc, ChevronDown, Check, Eye, EyeOff,
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useScrollLock } from '../utils/useScrollLock';
import UpgradeModal from '../components/UpgradeModal';
import { usePlanLimits } from '../hooks/usePlanLimits';

// ── Types ────────────────────────────────────────────────────────────────────

interface CustomRole {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
  _count?: { users: number };
}

interface StaffMember {
  id: string;
  phone: string;
  fullName: string | null;
  roleType: string;
  branchId: string | null;
  customRoleId: string | null;
  customRole: CustomRole | null;
  isActive?: boolean;
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
}

// ── i18n ─────────────────────────────────────────────────────────────────────

type Lang = string;

const T = {
  title:           { uz: "Xodimlar", ru: "Сотрудники", tr: "Personel", oz: "Ходимлар", en: "Staff" },
  members:         { uz: "xodim", ru: "сотрудник", tr: "personel", oz: "ходим", en: "members" },
  customRoles:     { uz: "maxsus rol", ru: "ролей", tr: "özel rol", oz: "махсус рол", en: "custom roles" },
  addStaff:        { uz: "Xodim qo'shish", ru: "Добавить сотрудника", tr: "Personel ekle", oz: "Ходим қўшиш", en: "Add Staff" },
  manageRoles:     { uz: "Rollar", ru: "Роли", tr: "Roller", oz: "Роллар", en: "Roles" },
  newRole:         { uz: "Yangi rol", ru: "Новая роль", tr: "Yeni rol", oz: "Янги рол", en: "New Role" },
  editRole:        { uz: "Rolni tahrirlash", ru: "Редактировать роль", tr: "Rolü düzenle", oz: "Ролни таҳрирлаш", en: "Edit Role" },
  roleName:        { uz: "Rol nomi", ru: "Название роли", tr: "Rol adı", oz: "Рол номи", en: "Role name" },
  roleNamePlaceholder: { uz: "Masalan: Hisobchi, Filial menejer, Kuryer...", ru: "Например: Бухгалтер, Менеджер филиала...", tr: "Örn: Muhasebeci, Şube müdürü...", oz: "Масалан: Ҳисобчи, Филиал менежер...", en: "e.g. Accountant, Branch Manager, Courier..." },
  permissions:     { uz: "Ruxsatlar", ru: "Разрешения", tr: "İzinler", oz: "Рухсатлар", en: "Permissions" },
  selectAll:       { uz: "Hammasini tanlash", ru: "Выбрать все", tr: "Hepsini seç", oz: "Ҳаммасини танлаш", en: "Select all" },
  clearAll:        { uz: "Hammasini tozalash", ru: "Снять все", tr: "Hepsini temizle", oz: "Ҳаммасини тозалаш", en: "Clear all" },
  noRoles:         { uz: "Maxsus rollar yo'q", ru: "Нет пользовательских ролей", tr: "Özel rol yok", oz: "Махсус роллар йўқ", en: "No custom roles yet" },
  noRolesDesc:     { uz: "Yangi rol yarating va xodimlarga biriktiring", ru: "Создайте роль и назначьте сотрудникам", tr: "Rol oluşturun ve personele atayın", oz: "Янги рол яратинг ва ходимларга бириктиринг", en: "Create a role and assign it to staff" },
  addRole:         { uz: "Rol qo'shish", ru: "Добавить роль", tr: "Rol ekle", oz: "Рол қўшиш", en: "Add role" },
  deleteRole:      { uz: "Rolni o'chirish", ru: "Удалить роль", tr: "Rolü sil", oz: "Ролни ўчириш", en: "Delete role" },
  deleteRoleDesc:  { uz: "Bu rol hech bir xodimga biriktirilmagan. O'chirishni tasdiqlaysizmi?", ru: "Эта роль не назначена ни одному сотруднику. Подтверждаете удаление?", tr: "Bu rol hiç bir personele atanmamış. Silmeyi onaylıyor musunuz?", oz: "Бу рол ҳеч бир ходимга бириктирилмаган. Ўчиришни тасдиқлайсизми?", en: "This role has no users assigned. Confirm deletion?" },
  fullName:        { uz: "To'liq ism", ru: "Полное имя", tr: "Ad Soyad", oz: "Тўлиқ исм", en: "Full Name" },
  phone:           { uz: "Telefon", ru: "Телефон", tr: "Telefon", oz: "Телефон", en: "Phone" },
  password:        { uz: "Parol", ru: "Пароль", tr: "Şifre", oz: "Парол", en: "Password" },
  role:            { uz: "Rol", ru: "Роль", tr: "Rol", oz: "Рол", en: "Role" },
  selectRole:      { uz: "Rolni tanlang", ru: "Выберите роль", tr: "Rol seçin", oz: "Ролни танланг", en: "Select role" },
  selectCustomRole:{ uz: "Maxsus rolni tanlang", ru: "Выберите пользовательскую роль", tr: "Özel rol seçin", oz: "Махсус ролни танланг", en: "Select custom role" },
  branch:          { uz: "Filial", ru: "Филиал", tr: "Şube", oz: "Филиал", en: "Branch" },
  noBranch:        { uz: "Filialsiz", ru: "Без филиала", tr: "Şubesiz", oz: "Филиалсиз", en: "No branch" },
  assigned:        { uz: "ta xodim", ru: "сотр.", tr: "personel", oz: "та ходим", en: "users" },
  noData:          { uz: "Ma'lumotlar mavjud emas", ru: "Данные отсутствуют", tr: "Veri bulunamadı", oz: "Маълумотлар мавжуд эмас", en: "No data available" },
  noStaff:         { uz: "Xodimlar yo'q", ru: "Нет сотрудников", tr: "Personel yok", oz: "Ходимлар йўқ", en: "No staff members" },
  search:          { uz: "Qidirish...", ru: "Поиск...", tr: "Ara...", oz: "Қидириш...", en: "Search..." },
  sortNewest:      { uz: "Yangi birinchi", ru: "Сначала новые", tr: "Önce yeni", oz: "Янги биринчи", en: "Newest first" },
  sortOldest:      { uz: "Eski birinchi", ru: "Сначала старые", tr: "Önce eski", oz: "Эски биринчи", en: "Oldest first" },
  sortName:        { uz: "Ism bo'yicha", ru: "По имени", tr: "Ada göre", oz: "Исм бўйича", en: "By name" },
  removeStaff:     { uz: "Xodimni o'chirish", ru: "Удалить сотрудника", tr: "Personeli sil", oz: "Ходимни ўчириш", en: "Remove staff" },
  removeStaffDesc: { uz: "Bu xodim tizimdan o'chiriladi. Tasdiqlaysizmi?", ru: "Этот сотрудник будет удалён из системы. Подтвердите.", tr: "Bu personel sistemden silinecek. Onaylıyor musunuz?", oz: "Бу ходим тизимдан ўчирилади. Тасдиқлайсизми?", en: "This staff member will be removed from the system. Confirm?" },
  editStaff:       { uz: "Xodimni tahrirlash", ru: "Редактировать сотрудника", tr: "Personeli düzenle", oz: "Ходимни таҳрирлаш", en: "Edit staff" },
  save:            { uz: "Saqlash", ru: "Сохранить", tr: "Kaydet", oz: "Сақлаш", en: "Save" },
  cancel:          { uz: "Bekor qilish", ru: "Отмена", tr: "İptal", oz: "Бекор қилиш", en: "Cancel" },
  confirm:         { uz: "Tasdiqlash", ru: "Подтвердить", tr: "Onayla", oz: "Тасдиқлаш", en: "Confirm" },
  loading:         { uz: "Yuklanmoqda...", ru: "Загрузка...", tr: "Yükleniyor...", oz: "Юкланмоқда...", en: "Loading..." },
  saving:          { uz: "Saqlanmoqda...", ru: "Сохранение...", tr: "Kaydediliyor...", oz: "Сақланмоқда...", en: "Saving..." },
  builtinRole:     { uz: "Standart rol", ru: "Стандартная роль", tr: "Standart rol", oz: "Стандарт рол", en: "Built-in role" },
  customRole:      { uz: "Maxsus rol", ru: "Пользовательская роль", tr: "Özel rol", oz: "Махсус рол", en: "Custom role" },
  permissionsPreview: { uz: "Ruxsatlar ro'yxati", ru: "Список разрешений", tr: "İzin listesi", oz: "Рухсатлар рўйхати", en: "Permissions list" },
  noPermissions:   { uz: "Ruxsatlar belgilanmagan", ru: "Разрешения не указаны", tr: "İzin belirtilmemiş", oz: "Рухсатлар белгиланмаган", en: "No permissions set" },
  error:           { uz: "Xatolik yuz berdi", ru: "Произошла ошибка", tr: "Bir hata oluştu", oz: "Хатолик юз берди", en: "An error occurred" },
};

const tx = (key: keyof typeof T, lang: Lang): string =>
  (T[key] as Record<string, string>)[lang] ?? (T[key] as Record<string, string>).en ?? key;

// ── Permission labels ─────────────────────────────────────────────────────────

const PERMISSION_LABELS: Record<string, Record<string, string>> = {
  uz: {
    viewOrders:     "Buyurtmalarni ko'rish",
    createOrders:   "Buyurtma yaratish",
    viewPayments:   "To'lovlarni ko'rish",
    createPayments: "To'lov kiritish",
    viewDealers:    "Dilerlarni ko'rish",
    createDealers:  "Diler qo'shish",
    viewProducts:   "Mahsulotlarni ko'rish",
    viewExpenses:   "Xarajatlarni ko'rish",
    createExpenses: "Xarajat kiritish",
    viewAnalytics:  "Tahlillar",
    viewBranches:   "Filiallarni ko'rish",
    manageBranches: "Filiallarni boshqarish",
  },
  oz: {
    viewOrders:     "Буюртмаларни кўриш",
    createOrders:   "Буюртма яратиш",
    viewPayments:   "Тўловларни кўриш",
    createPayments: "Тўлов киритиш",
    viewDealers:    "Дилерларни кўриш",
    createDealers:  "Дилер қўшиш",
    viewProducts:   "Маҳсулотларни кўриш",
    viewExpenses:   "Харажатларни кўриш",
    createExpenses: "Харажат киритиш",
    viewAnalytics:  "Таҳлиллар",
    viewBranches:   "Филиалларни кўриш",
    manageBranches: "Филиалларни бошқариш",
  },
  ru: {
    viewOrders:     "Просмотр заказов",
    createOrders:   "Создание заказов",
    viewPayments:   "Просмотр платежей",
    createPayments: "Запись платежей",
    viewDealers:    "Просмотр дилеров",
    createDealers:  "Добавить дилера",
    viewProducts:   "Просмотр товаров",
    viewExpenses:   "Просмотр расходов",
    createExpenses: "Добавить расход",
    viewAnalytics:  "Аналитика",
    viewBranches:   "Просмотр филиалов",
    manageBranches: "Управление филиалами",
  },
  tr: {
    viewOrders:     "Siparişleri gör",
    createOrders:   "Sipariş oluştur",
    viewPayments:   "Ödemeleri gör",
    createPayments: "Ödeme kaydet",
    viewDealers:    "Bayileri gör",
    createDealers:  "Bayi ekle",
    viewProducts:   "Ürünleri gör",
    viewExpenses:   "Giderleri gör",
    createExpenses: "Gider ekle",
    viewAnalytics:  "Analitik",
    viewBranches:   "Şubeleri gör",
    manageBranches: "Şubeleri yönet",
  },
  en: {
    viewOrders:     "View Orders",
    createOrders:   "Create Orders",
    viewPayments:   "View Payments",
    createPayments: "Record Payments",
    viewDealers:    "View Dealers",
    createDealers:  "Add Dealers",
    viewProducts:   "View Products",
    viewExpenses:   "View Expenses",
    createExpenses: "Add Expenses",
    viewAnalytics:  "Analytics",
    viewBranches:   "View Branches",
    manageBranches: "Manage Branches",
  },
};

const PERMISSION_GROUPS: { groupKey: string; group: Record<string, string>; keys: string[] }[] = [
  { groupKey: 'orders',   group: { uz: "Buyurtmalar", ru: "Заказы",    tr: "Siparişler", oz: "Буюртмалар", en: "Orders"   }, keys: ['viewOrders', 'createOrders'] },
  { groupKey: 'payments', group: { uz: "To'lovlar",   ru: "Платежи",   tr: "Ödemeler",   oz: "Тўловлар",   en: "Payments" }, keys: ['viewPayments', 'createPayments'] },
  { groupKey: 'dealers',  group: { uz: "Dilerlar",    ru: "Дилеры",    tr: "Bayiler",    oz: "Дилерлар",   en: "Dealers"  }, keys: ['viewDealers', 'createDealers'] },
  { groupKey: 'products', group: { uz: "Mahsulotlar", ru: "Товары",    tr: "Ürünler",    oz: "Маҳсулотлар", en: "Products" }, keys: ['viewProducts'] },
  { groupKey: 'expenses', group: { uz: "Xarajatlar",  ru: "Расходы",   tr: "Giderler",   oz: "Харажатлар",  en: "Expenses" }, keys: ['viewExpenses', 'createExpenses'] },
  { groupKey: 'other',    group: { uz: "Boshqalar",   ru: "Прочее",    tr: "Diğerleri",  oz: "Бошқалар",   en: "Other"    }, keys: ['viewAnalytics', 'viewBranches', 'manageBranches'] },
];

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  viewOrders: true, createOrders: false,
  viewPayments: false, createPayments: false,
  viewDealers: true, createDealers: false,
  viewProducts: true,
  viewExpenses: false, createExpenses: false,
  viewAnalytics: false,
  viewBranches: false, manageBranches: false,
};

const ROLE_COLORS: Record<string, string> = {
  MANAGER:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SALES:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  DELIVERY:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  SELLER:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  OWNER:      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  CUSTOM:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SUPER_ADMIN:'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const BUILT_IN_ROLES = ['MANAGER', 'SALES', 'DELIVERY', 'SELLER'];

const BUILTIN_ROLE_LABELS: Record<string, Record<string, string>> = {
  MANAGER:  { uz: "Menejer",    ru: "Менеджер",    tr: "Yönetici",    oz: "Менежер",    en: "Manager"  },
  SALES:    { uz: "Savdo",      ru: "Продажи",     tr: "Satış",       oz: "Савдо",      en: "Sales"    },
  DELIVERY: { uz: "Yetkazish",  ru: "Доставка",    tr: "Teslimat",    oz: "Етказиш",    en: "Delivery" },
  SELLER:   { uz: "Sotuvchi",   ru: "Продавец",    tr: "Satıcı",      oz: "Сотувчи",    en: "Seller"   },
};

// ── Sort dropdown ─────────────────────────────────────────────────────────────

type SortKey = 'newest' | 'oldest' | 'name';

function SortDropdown({ value, onChange, lang }: { value: SortKey; onChange: (v: SortKey) => void; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const options: { value: SortKey; label: string }[] = [
    { value: 'newest', label: tx('sortNewest', lang) },
    { value: 'oldest', label: tx('sortOldest', lang) },
    { value: 'name',   label: tx('sortName', lang) },
  ];
  const current = options.find(o => o.value === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
      >
        <SortAsc className="w-4 h-4 text-slate-400" />
        <span>{current?.label}</span>
        <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
          >
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={clsx(
                  "w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                  o.value === value ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300"
                )}
              >
                {o.label}
                {o.value === value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  // Modals
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showRolesPanel, setShowRolesPanel] = useState(true);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editRoleItem, setEditRoleItem] = useState<CustomRole | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  const [staffForm, setStaffForm] = useState({
    fullName: '', phone: '', password: '', roleType: 'SALES', branchId: '', customRoleId: '',
  });
  const [editForm, setEditForm] = useState({
    roleType: 'SALES', branchId: '', customRoleId: '',
  });
  const [roleForm, setRoleForm] = useState({ name: '', permissions: { ...DEFAULT_PERMISSIONS } });

  const { language, user } = useAuthStore();
  const lang = language;
  const canManage = user?.roleType === 'OWNER' || user?.roleType === 'MANAGER' || user?.roleType === 'SUPER_ADMIN';
  const { showUpgrade, setShowUpgrade, upgradeReason, handleApiError } = usePlanLimits();

  useScrollLock(showAddStaff || showRoleManager || !!deactivateId || !!deleteRoleId || !!editStaffId);

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes, brRes] = await Promise.all([
        api.get<StaffMember[]>('/company/users'),
        api.get<CustomRole[]>('/company/roles'),
        api.get<Branch[]>('/branches'),
      ]);
      setStaff(staffRes.data);
      setCustomRoles(rolesRes.data);
      setBranches(brRes.data);
    } catch {
      toast.error(tx('error', lang));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filtered + sorted staff ───────────────────────────────────────────────

  const visibleStaff = useMemo(() => {
    let list = staff.filter(s => s.roleType !== 'OWNER' && s.roleType !== 'SUPER_ADMIN');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.fullName || '').toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.roleType.toLowerCase().includes(q) ||
        (s.customRole?.name || '').toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return (a.fullName || a.phone).localeCompare(b.fullName || b.phone);
    });
    return list;
  }, [staff, search, sort]);

  // ── Staff CRUD ────────────────────────────────────────────────────────────

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.phone || !staffForm.password || !staffForm.fullName) return toast.error(tx('error', lang));
    try {
      setSaving(true);
      await api.post('/company/users', {
        fullName: staffForm.fullName,
        phone: staffForm.phone,
        password: staffForm.password,
        roleType: staffForm.roleType,
        branchId: staffForm.branchId || undefined,
        customRoleId: staffForm.customRoleId || undefined,
      });
      toast.success(tx('save', lang));
      setShowAddStaff(false);
      setStaffForm({ fullName: '', phone: '', password: '', roleType: 'SALES', branchId: '', customRoleId: '' });
      fetchAll();
    } catch (err: any) {
      if (!handleApiError(err)) toast.error(err?.response?.data?.message || tx('error', lang));
    } finally {
      setSaving(false);
    }
  };

  const openEditStaff = (member: StaffMember) => {
    setEditStaffId(member.id);
    setEditForm({
      roleType: member.roleType,
      branchId: member.branchId || '',
      customRoleId: member.customRoleId || '',
    });
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffId) return;
    try {
      setSaving(true);
      await api.patch(`/company/users/${editStaffId}`, {
        roleType: editForm.roleType,
        branchId: editForm.branchId || undefined,
        customRoleId: editForm.customRoleId || undefined,
      });
      toast.success(tx('save', lang));
      setEditStaffId(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tx('error', lang));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await api.delete(`/company/users/${deactivateId}`);
      toast.success(tx('save', lang));
      setDeactivateId(null);
      fetchAll();
    } catch { toast.error(tx('error', lang)); }
  };

  // ── Role CRUD ─────────────────────────────────────────────────────────────

  const openNewRole = () => {
    setRoleForm({ name: '', permissions: { ...DEFAULT_PERMISSIONS } });
    setEditRoleItem(null);
    setShowRoleManager(true);
  };

  const openEditRole = (r: CustomRole) => {
    setRoleForm({ name: r.name, permissions: { ...DEFAULT_PERMISSIONS, ...(r.permissions as Record<string, boolean>) } });
    setEditRoleItem(r);
    setShowRoleManager(true);
  };

  const closeRoleManager = () => {
    setShowRoleManager(false);
    setEditRoleItem(null);
    setRoleForm({ name: '', permissions: { ...DEFAULT_PERMISSIONS } });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return toast.error(tx('roleName', lang));
    try {
      setSaving(true);
      if (editRoleItem) {
        await api.patch(`/company/roles/${editRoleItem.id}`, roleForm);
      } else {
        await api.post('/company/roles', roleForm);
      }
      toast.success(tx('save', lang));
      closeRoleManager();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tx('error', lang));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await api.delete(`/company/roles/${roleId}`);
      toast.success(tx('save', lang));
      setDeleteRoleId(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || tx('error', lang));
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getRoleLabel = (member: StaffMember) => {
    if (member.roleType === 'CUSTOM' && member.customRole) return member.customRole.name;
    const builtinLabel = BUILTIN_ROLE_LABELS[member.roleType];
    return builtinLabel ? (builtinLabel[lang] ?? builtinLabel.en) : member.roleType;
  };

  const getEnabledPermissions = (permissions: Record<string, boolean>) =>
    Object.entries(permissions).filter(([, v]) => !!v).map(([k]) =>
      (PERMISSION_LABELS[lang] ?? PERMISSION_LABELS.en)[k] || k
    );

  const permAll = Object.keys(DEFAULT_PERMISSIONS);
  const allChecked = permAll.every(k => !!roleForm.permissions[k]);
  const noneChecked = permAll.every(k => !roleForm.permissions[k]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-blue-100 dark:border-blue-900/50">
            <Users className="w-3 h-3" /> {tx('title', lang)}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {tx('title', lang)}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            {visibleStaff.length} {tx('members', lang)} · {customRoles.length} {tx('customRoles', lang)}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openNewRole}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
            >
              <Settings2 className="w-4 h-4" /> {tx('newRole', lang)}
            </button>
            <button
              onClick={() => setShowAddStaff(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> {tx('addStaff', lang)}
            </button>
          </div>
        )}
      </div>

      {/* ── Custom Roles Panel ────────────────────────────────────────────── */}
      {canManage && (
        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowRolesPanel(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 dark:hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {tx('manageRoles', lang)}
                <span className="ml-2 text-[10px] font-bold text-slate-400">({customRoles.length})</span>
              </span>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform duration-200", showRolesPanel && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showRolesPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-slate-100 dark:border-white/5">
                  {customRoles.length === 0 ? (
                    <div className="py-10 flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-indigo-400" />
                      </div>
                      <p className="text-sm font-black text-slate-700 dark:text-white">{tx('noRoles', lang)}</p>
                      <p className="text-xs text-slate-400 font-medium">{tx('noRolesDesc', lang)}</p>
                      <button
                        onClick={openNewRole}
                        className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                      >
                        {tx('addRole', lang)}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-white/5">
                      {customRoles.map(cr => {
                        const perms = getEnabledPermissions(cr.permissions as Record<string, boolean>);
                        return (
                          <div key={cr.id} className="flex items-start justify-between px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                  {cr.name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {cr._count?.users || 0} {tx('assigned', lang)}
                                </span>
                              </div>
                              {perms.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {perms.map(p => (
                                    <span key={p} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400">{tx('noPermissions', lang)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditRole(cr)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {(!cr._count || cr._count.users === 0) && (
                                <button
                                  onClick={() => setDeleteRoleId(cr.id)}
                                  className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tx('search', lang)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
        </div>
        <SortDropdown value={sort} onChange={setSort} lang={lang} />
      </div>

      {/* ── Staff Grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : visibleStaff.length === 0 ? (
        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-black text-slate-400 dark:text-slate-500 text-sm uppercase tracking-widest">
            {tx('noStaff', lang)}
          </p>
          {canManage && !search && (
            <button
              onClick={() => setShowAddStaff(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" /> {tx('addStaff', lang)}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleStaff.map(member => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex items-start justify-between gap-4 group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-base uppercase shadow-sm shrink-0">
                  {(member.fullName?.charAt(0) || member.phone.charAt(1) || '?').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight truncate">
                    {member.fullName || '—'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{member.phone}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider',
                      ROLE_COLORS[member.roleType] || ROLE_COLORS.CUSTOM
                    )}>
                      {getRoleLabel(member)}
                    </span>
                    {member.branchId && branches.find(b => b.id === member.branchId) && (
                      <span className="text-[9px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {branches.find(b => b.id === member.branchId)?.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {canManage && (
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEditStaff(member)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-300 hover:text-blue-600 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeactivateId(member.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-600 transition-all"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── Add Staff Modal ───────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddStaff && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowAddStaff(false); }}
          >
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{tx('addStaff', lang)}</h3>
                </div>
                <button onClick={() => setShowAddStaff(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{tx('fullName', lang)} *</label>
                  <input
                    value={staffForm.fullName}
                    onChange={e => setStaffForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder={tx('fullName', lang)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{tx('phone', lang)} *</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={e => setStaffForm(f => ({ ...f, phone: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    placeholder="+998901234567"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{tx('password', lang)} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={staffForm.password}
                      onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role selection */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tx('role', lang)}</label>

                  {/* Built-in roles */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {BUILT_IN_ROLES.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setStaffForm(f => ({ ...f, roleType: r, customRoleId: '' }))}
                        className={clsx(
                          "px-3 py-2.5 rounded-xl border text-xs font-black transition-all text-center",
                          staffForm.roleType === r
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700"
                        )}
                      >
                        {(BUILTIN_ROLE_LABELS[r]?.[lang] ?? BUILTIN_ROLE_LABELS[r]?.en ?? r)}
                      </button>
                    ))}
                  </div>

                  {/* Custom roles */}
                  {customRoles.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{tx('customRole', lang)}</span>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="space-y-1.5">
                        {customRoles.map(cr => {
                          const isSelected = staffForm.roleType === 'CUSTOM' && staffForm.customRoleId === cr.id;
                          const perms = getEnabledPermissions(cr.permissions as Record<string, boolean>);
                          return (
                            <button
                              key={cr.id}
                              type="button"
                              onClick={() => setStaffForm(f => ({ ...f, roleType: 'CUSTOM', customRoleId: cr.id }))}
                              className={clsx(
                                "w-full text-left px-4 py-3 rounded-xl border transition-all",
                                isSelected
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                  : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={clsx("text-xs font-black", isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-200")}>
                                  {cr.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{cr._count?.users || 0} {tx('assigned', lang)}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                                </div>
                              </div>
                              {perms.length > 0 && (
                                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">
                                  {perms.slice(0, 3).join(' · ')}{perms.length > 3 ? ` +${perms.length - 3}` : ''}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Branch */}
                {branches.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{tx('branch', lang)}</label>
                    <div className="space-y-1">
                      {[{ id: '', name: tx('noBranch', lang) }, ...branches].map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setStaffForm(f => ({ ...f, branchId: b.id }))}
                          className={clsx(
                            "w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                            staffForm.branchId === b.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700"
                          )}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddStaff(false)} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
                    {tx('cancel', lang)}
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-5 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20">
                    {saving ? tx('saving', lang) : tx('save', lang)}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Staff Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {editStaffId && (() => {
          const member = staff.find(s => s.id === editStaffId);
          if (!member) return null;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={e => { if (e.target === e.currentTarget) setEditStaffId(null); }}
            >
              <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{tx('editStaff', lang)}</h3>
                      <p className="text-xs text-slate-400 font-medium">{member.fullName || member.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditStaffId(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleEditStaff} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
                  {/* Role */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tx('role', lang)}</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {BUILT_IN_ROLES.map(r => (
                        <button key={r} type="button"
                          onClick={() => setEditForm(f => ({ ...f, roleType: r, customRoleId: '' }))}
                          className={clsx("px-3 py-2.5 rounded-xl border text-xs font-black transition-all",
                            editForm.roleType === r ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300"
                          )}
                        >
                          {BUILTIN_ROLE_LABELS[r]?.[lang] ?? BUILTIN_ROLE_LABELS[r]?.en ?? r}
                        </button>
                      ))}
                    </div>
                    {customRoles.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 my-2">
                          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{tx('customRole', lang)}</span>
                          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                        </div>
                        <div className="space-y-1.5">
                          {customRoles.map(cr => {
                            const isSelected = editForm.roleType === 'CUSTOM' && editForm.customRoleId === cr.id;
                            return (
                              <button key={cr.id} type="button"
                                onClick={() => setEditForm(f => ({ ...f, roleType: 'CUSTOM', customRoleId: cr.id }))}
                                className={clsx("w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between",
                                  isSelected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700"
                                )}
                              >
                                <span className={clsx("text-xs font-black", isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-200")}>{cr.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Branch */}
                  {branches.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{tx('branch', lang)}</label>
                      <div className="space-y-1">
                        {[{ id: '', name: tx('noBranch', lang) }, ...branches].map(b => (
                          <button key={b.id} type="button"
                            onClick={() => setEditForm(f => ({ ...f, branchId: b.id }))}
                            className={clsx("w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all",
                              editForm.branchId === b.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                            )}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setEditStaffId(null)} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
                      {tx('cancel', lang)}
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 px-5 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">
                      {saving ? tx('saving', lang) : tx('save', lang)}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Custom Role Manager Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showRoleManager && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) closeRoleManager(); }}
          >
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <Settings2 className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editRoleItem ? tx('editRole', lang) : tx('newRole', lang)}
                  </h3>
                </div>
                <button onClick={closeRoleManager} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Role name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{tx('roleName', lang)} *</label>
                  <input
                    value={roleForm.name}
                    onChange={e => setRoleForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    placeholder={tx('roleNamePlaceholder', lang)}
                  />
                </div>

                {/* Permissions by group */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tx('permissions', lang)}</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRoleForm(f => ({ ...f, permissions: Object.fromEntries(permAll.map(k => [k, true])) }))}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        disabled={allChecked}
                      >
                        {tx('selectAll', lang)}
                      </button>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={() => setRoleForm(f => ({ ...f, permissions: Object.fromEntries(permAll.map(k => [k, false])) }))}
                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 hover:underline"
                        disabled={noneChecked}
                      >
                        {tx('clearAll', lang)}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map(group => (
                      <div key={group.groupKey}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          {(group.group as Record<string, string>)[lang] ?? group.group.en}
                        </p>
                        <div className="space-y-1.5">
                          {group.keys.map(key => {
                            const label = (PERMISSION_LABELS[lang] ?? PERMISSION_LABELS.en)[key] || key;
                            const checked = !!roleForm.permissions[key];
                            return (
                              <label key={key} className={clsx(
                                'flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none',
                                checked
                                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                              )}>
                                <div className={clsx(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                                  checked ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-600"
                                )}>
                                  {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  onChange={e => setRoleForm(f => ({ ...f, permissions: { ...f.permissions, [key]: e.target.checked } }))}
                                />
                                <span className={clsx("text-xs font-semibold", checked ? "text-indigo-700 dark:text-indigo-300" : "text-slate-600 dark:text-slate-300")}>
                                  {label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeRoleManager} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
                    {tx('cancel', lang)}
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-5 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20">
                    {saving ? tx('saving', lang) : tx('save', lang)}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Remove Staff Confirm ──────────────────────────────────────────── */}
      <AnimatePresence>
        {deactivateId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">{tx('removeStaff', lang)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tx('removeStaffDesc', lang)}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeactivateId(null)} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
                  {tx('cancel', lang)}
                </button>
                <button onClick={handleDeactivate} className="flex-1 px-5 py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                  {tx('confirm', lang)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Role Confirm ───────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteRoleId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setDeleteRoleId(null); }}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1.5">{tx('deleteRole', lang)}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tx('deleteRoleDesc', lang)}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteRoleId(null)} className="flex-1 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
                  {tx('cancel', lang)}
                </button>
                <button onClick={() => handleDeleteRole(deleteRoleId)} className="flex-1 px-5 py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                  {tx('confirm', lang)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
        language={language}
      />
    </div>
  );
}
