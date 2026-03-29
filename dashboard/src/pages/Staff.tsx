import { useState, useEffect } from 'react';
import { Users, Plus, X, UserX, Shield, AlertTriangle, Pencil, Trash2, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { dashboardTranslations } from '../i18n/translations';
import { toast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useScrollLock } from '../utils/useScrollLock';
import { CustomSelect } from '../components/CustomSelect';
import type { SelectOption } from '../components/CustomSelect';
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
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

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

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  viewOrders: true,
  createOrders: false,
  viewPayments: false,
  createPayments: false,
  viewDealers: true,
  createDealers: false,
  viewProducts: true,
  viewExpenses: false,
  createExpenses: false,
  viewAnalytics: false,
  viewBranches: false,
  manageBranches: false,
};

const PERMISSION_LABELS: Record<string, Record<string, string>> = {
  uz: {
    viewOrders: "Buyurtmalarni ko'rish",
    createOrders: "Buyurtma yaratish",
    viewPayments: "To'lovlarni ko'rish",
    createPayments: "To'lov kiritish",
    viewDealers: "Dilerlarni ko'rish",
    createDealers: "Diler qo'shish",
    viewProducts: "Mahsulotlarni ko'rish",
    viewExpenses: "Xarajatlarni ko'rish",
    createExpenses: "Xarajat kiritish",
    viewAnalytics: "Tahlillar",
    viewBranches: "Filiallarni ko'rish",
    manageBranches: "Filiallarni boshqarish",
  },
  oz: {
    viewOrders: "Буюртмаларни кўриш",
    createOrders: "Буюртма яратиш",
    viewPayments: "Тўловларни кўриш",
    createPayments: "Тўлов киритиш",
    viewDealers: "Дилерларни кўриш",
    createDealers: "Дилер қўшиш",
    viewProducts: "Маҳсулотларни кўриш",
    viewExpenses: "Харажатларни кўриш",
    createExpenses: "Харажат киритиш",
    viewAnalytics: "Таҳлиллар",
    viewBranches: "Филиалларни кўриш",
    manageBranches: "Филиалларни бошқариш",
  },
  ru: {
    viewOrders: "Просмотр заказов",
    createOrders: "Создание заказов",
    viewPayments: "Просмотр платежей",
    createPayments: "Запись платежей",
    viewDealers: "Просмотр дилеров",
    createDealers: "Добавить дилера",
    viewProducts: "Просмотр товаров",
    viewExpenses: "Просмотр расходов",
    createExpenses: "Добавить расход",
    viewAnalytics: "Аналитика",
    viewBranches: "Просмотр филиалов",
    manageBranches: "Управление филиалами",
  },
  tr: {
    viewOrders: "Siparişleri gör",
    createOrders: "Sipariş oluştur",
    viewPayments: "Ödemeleri gör",
    createPayments: "Ödeme kaydet",
    viewDealers: "Bayileri gör",
    createDealers: "Bayi ekle",
    viewProducts: "Ürünleri gör",
    viewExpenses: "Giderleri gör",
    createExpenses: "Gider ekle",
    viewAnalytics: "Analitik",
    viewBranches: "Şubeleri gör",
    manageBranches: "Şubeleri yönet",
  },
  en: {
    viewOrders: "View Orders",
    createOrders: "Create Orders",
    viewPayments: "View Payments",
    createPayments: "Record Payments",
    viewDealers: "View Dealers",
    createDealers: "Add Dealers",
    viewProducts: "View Products",
    viewExpenses: "View Expenses",
    createExpenses: "Add Expenses",
    viewAnalytics: "Analytics",
    viewBranches: "View Branches",
    manageBranches: "Manage Branches",
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<CustomRole | null>(null);
  const [showRolesExpanded, setShowRolesExpanded] = useState(false);
  const [hasInitializedRolesPanel, setHasInitializedRolesPanel] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [staffForm, setStaffForm] = useState({
    fullName: '', phone: '', password: '', roleType: 'SALES', branchId: '', customRoleId: ''
  });
  const [roleForm, setRoleForm] = useState({ name: '', permissions: { ...DEFAULT_PERMISSIONS } });

  const { language, user } = useAuthStore();
  const t = dashboardTranslations[language];
  const canManage = user?.roleType === 'OWNER' || user?.roleType === 'MANAGER' || user?.roleType === 'SUPER_ADMIN';
  const { showUpgrade, setShowUpgrade, upgradeReason, handleApiError } = usePlanLimits();

  useScrollLock(showAddStaff || showRoleManager || !!deactivateId || !!deleteRoleId);

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
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (!hasInitializedRolesPanel && customRoles.length > 0) {
      setShowRolesExpanded(true);
      setHasInitializedRolesPanel(true);
    }
  }, [customRoles.length, hasInitializedRolesPanel]);

  // ── Staff form ────────────────────────────────────────────────────────────

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.phone || !staffForm.password || !staffForm.fullName) return toast.error(t.common.error);
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
      toast.success(t.common.add);
      setShowAddStaff(false);
      setStaffForm({ fullName: '', phone: '', password: '', roleType: 'SALES', branchId: '', customRoleId: '' });
      fetchAll();
    } catch (err: any) {
      if (!handleApiError(err)) {
        toast.error(err?.response?.data?.message || t.common.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await api.delete(`/company/users/${deactivateId}`);
      toast.success(t.common.delete);
      setDeactivateId(null);
      fetchAll();
    } catch { toast.error(t.common.error); }
  };

  // ── Custom role form ──────────────────────────────────────────────────────

  const openNewRole = () => {
    setRoleForm({ name: '', permissions: { ...DEFAULT_PERMISSIONS } });
    setEditRole(null);
    setShowRoleManager(true);
  };

  const closeRoleManager = () => {
    setShowRoleManager(false);
    setEditRole(null);
    setRoleForm({ name: '', permissions: { ...DEFAULT_PERMISSIONS } });
  };

  const openEditRole = (r: CustomRole) => {
    setRoleForm({ name: r.name, permissions: { ...DEFAULT_PERMISSIONS, ...(r.permissions as any) } });
    setEditRole(r);
    setShowRoleManager(true);
    setShowRolesExpanded(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return toast.error('Role name required');
    try {
      setSaving(true);
      if (editRole) {
        await api.patch(`/company/roles/${editRole.id}`, roleForm);
      } else {
        await api.post('/company/roles', roleForm);
      }
      toast.success(t.common.save);
      closeRoleManager();
      setShowRolesExpanded(true);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await api.delete(`/company/roles/${roleId}`);
      toast.success(t.common.delete);
      setDeleteRoleId(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t.common.error);
    }
  };

  // ── Select options ────────────────────────────────────────────────────────

  const roleTypeOptions: SelectOption[] = [
    ...BUILT_IN_ROLES.map(r => ({ value: r, label: r })),
    ...(customRoles.length > 0 ? [{ value: 'CUSTOM', label: '— Custom Role —', hint: '' }] : []),
  ];

  const customRoleOptions: SelectOption[] = customRoles.map(r => ({ value: r.id, label: r.name }));
  const branchOptions: SelectOption[] = [
    { value: '', label: `(${t.expenses?.branch || 'No branch'})` },
    ...branches.map(b => ({ value: b.id, label: b.name })),
  ];
  const selectedCustomRole = customRoles.find(r => r.id === staffForm.customRoleId);

  const visibleStaff = staff.filter(s => s.roleType !== 'OWNER' && s.roleType !== 'SUPER_ADMIN');

  const getRoleLabel = (member: StaffMember) => {
    if (member.roleType === 'CUSTOM' && member.customRole) return member.customRole.name;
    return member.roleType;
  };

  const getEnabledPermissions = (permissions?: Record<string, boolean>) =>
    Object.entries(permissions || {})
      .filter(([, allowed]) => !!allowed)
      .map(([key]) => (PERMISSION_LABELS[language] ?? PERMISSION_LABELS.en)[key] || key);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-900/50">
            <Users className="w-3 h-3" /> {t.sidebar?.staff || 'Staff'}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
            {t.sidebar?.staff || 'Staff'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold opacity-70 leading-relaxed uppercase tracking-widest text-[10px]">
            {visibleStaff.length} {language === 'uz' ? 'xodim' : language === 'ru' ? 'сотрудник' : language === 'tr' ? 'personel' : language === 'oz' ? 'ходим' : 'members'} · {customRoles.length} {language === 'uz' ? 'maxsus rol' : language === 'ru' ? 'ролей' : language === 'tr' ? 'özel rol' : language === 'oz' ? 'махсус рол' : 'custom roles'}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-3">
            <button onClick={openNewRole} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <Settings2 className="w-4 h-4" />
              {t.settings?.role || 'Roles'}
            </button>
            <button onClick={() => setShowAddStaff(true)} className="premium-button">
              <Plus className="w-4 h-4" />
              {t.common.add}
            </button>
          </div>
        )}
      </div>

      {/* Custom roles summary */}
      {canManage && (
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowRolesExpanded(v => !v)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t.settings?.role || 'Custom Roles'} <span className="text-slate-400 font-bold text-xs ml-1">({customRoles.length})</span>
              </span>
            </div>
            {showRolesExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showRolesExpanded && customRoles.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800">
              {customRoles.map(cr => (
                <div key={cr.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {cr.name}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {cr._count?.users || 0} {language === 'uz' ? 'xodim' : language === 'ru' ? 'сотр.' : language === 'tr' ? 'personel' : language === 'oz' ? 'ходим' : 'users'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditRole(cr)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {(!cr._count || cr._count.users === 0) && (
                      <button onClick={() => setDeleteRoleId(cr.id)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {showRolesExpanded && customRoles.length === 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                {language === 'uz' ? 'Maxsus rollar yo‘q' : language === 'ru' ? 'Пользовательских ролей нет' : language === 'tr' ? 'Ozel rol yok' : language === 'oz' ? 'Махсус роллар йук' : 'No custom roles yet'}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-semibold">
                {language === 'uz' ? 'Eski yoki yangi rollarni shu yerdan boshqarasiz.' : language === 'ru' ? 'Здесь можно управлять всеми ролями компании.' : language === 'tr' ? 'Tum roller buradan boshqariladi.' : language === 'oz' ? 'Барча роллар шу ердан бошкарилади.' : 'Manage all company roles here.'}
              </p>
              <button onClick={openNewRole} className="mt-5 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all">
                {language === 'uz' ? 'Rol qo‘shish' : language === 'ru' ? 'Добавить роль' : language === 'tr' ? 'Rol ekle' : language === 'oz' ? 'Рол кушиш' : 'Add role'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Staff grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : visibleStaff.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">{t.common.noData}</p>
          {canManage && (
            <button onClick={() => setShowAddStaff(true)} className="premium-button mt-6 mx-auto">
              <Plus className="w-4 h-4" /> {t.common.add}
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
              className="glass-card p-6 flex items-start justify-between gap-4 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-lg uppercase shadow-sm shrink-0">
                  {member.fullName?.charAt(0) || member.phone.charAt(1)}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight truncate">{member.fullName || '—'}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{member.phone}</p>
                  <span className={clsx('inline-block mt-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest', ROLE_COLORS[member.roleType] || ROLE_COLORS.CUSTOM)}>
                    {getRoleLabel(member)}
                  </span>
                  {member.branchId && branches.find(b => b.id === member.branchId) && (
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      {branches.find(b => b.id === member.branchId)?.name}
                    </p>
                  )}
                </div>
              </div>
              {canManage && (
                <button
                  onClick={() => setDeactivateId(member.id)}
                  className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100 shrink-0 mt-1"
                >
                  <UserX className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Add Staff Modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddStaff && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setShowAddStaff(false); }}
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{t.common.add} {t.sidebar?.staff || 'Staff'}</h3>
                </div>
                <button onClick={() => setShowAddStaff(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddStaff} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.settings?.fullName || 'Full Name'} *</label>
                  <input
                    value={staffForm.fullName}
                    onChange={e => setStaffForm(f => ({...f, fullName: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="To'liq ism"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.settings?.phone || 'Phone'} *</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={e => setStaffForm(f => ({...f, phone: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="+998901234567"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.settings?.password || 'Password'} *</label>
                  <input
                    type="password"
                    value={staffForm.password}
                    onChange={e => setStaffForm(f => ({...f, password: e.target.value}))}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.settings?.role || 'Role'}</label>
                  <CustomSelect
                    options={roleTypeOptions}
                    value={staffForm.roleType}
                    onChange={v => setStaffForm(f => ({...f, roleType: v, customRoleId: ''}))}
                  />
                </div>
                {staffForm.roleType === 'CUSTOM' && customRoles.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Custom Role *</label>
                    <CustomSelect
                      options={customRoleOptions}
                      value={staffForm.customRoleId}
                      onChange={v => setStaffForm(f => ({...f, customRoleId: v}))}
                      placeholder="Select custom role..."
                      searchable
                    />
                    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/60 dark:bg-indigo-900/10 p-4">
                      {selectedCustomRole ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                              {selectedCustomRole.name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {selectedCustomRole._count?.users || 0} {language === 'uz' ? 'biriktirilgan' : language === 'ru' ? 'назначено' : language === 'tr' ? 'atanmis' : language === 'oz' ? 'бириктирилган' : 'assigned'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {getEnabledPermissions(selectedCustomRole.permissions).length > 0 ? (
                              getEnabledPermissions(selectedCustomRole.permissions).map((permission) => (
                                <span key={permission} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                  {permission}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">
                                {language === 'uz' ? 'Bu rolda faol ruxsat tanlanmagan.' : language === 'ru' ? 'Для этой роли нет активных разрешений.' : language === 'tr' ? 'Bu rol icin aktif izin tanlanmagan.' : language === 'oz' ? 'Бу ролда фаол рухсат танланмаган.' : 'No active permissions selected for this role.'}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            {language === 'uz' ? 'Mavjud custom rollar va ularning vazifalari:' : language === 'ru' ? 'Существующие пользовательские роли и их возможности:' : language === 'tr' ? 'Mavjud custom roller va ularning vakolatlari:' : language === 'oz' ? 'Мавжуд custom роллар ва уларнинг ваколатлари:' : 'Existing custom roles and their permissions:'}
                          </p>
                          <div className="space-y-2">
                            {customRoles.map((role) => (
                              <div key={role.id} className="rounded-xl bg-white/80 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/20 p-3">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <span className="text-xs font-black text-slate-900 dark:text-white">{role.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{role._count?.users || 0}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                                  {getEnabledPermissions(role.permissions).slice(0, 4).join(', ') || (language === 'uz' ? 'Ruxsatlar belgilanmagan' : language === 'ru' ? 'Разрешения не указаны' : language === 'tr' ? 'Izinler belgilanmagan' : language === 'oz' ? 'Рухсатлар белгиланмаган' : 'No permissions specified')}
                                  {getEnabledPermissions(role.permissions).length > 4 ? '...' : ''}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {branches.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.expenses?.branch || 'Branch'}</label>
                    <CustomSelect
                      options={branchOptions}
                      value={staffForm.branchId}
                      onChange={v => setStaffForm(f => ({...f, branchId: v}))}
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddStaff(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300">
                    {t.common.cancel}
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 premium-button justify-center">
                    {saving ? t.common.loading : t.common.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Custom Role Manager Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showRoleManager && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setShowRoleManager(false); }}
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {editRole ? 'Edit Role' : 'New Custom Role'}
                  </h3>
                </div>
                <button onClick={closeRoleManager} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSaveRole} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Role Name *</label>
                  <input
                    value={roleForm.name}
                    onChange={e => setRoleForm(f => ({...f, name: e.target.value}))}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                    placeholder="e.g. Accountant, Branch Admin, Dispatcher..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                    {language === 'uz' ? "Ruxsatlar" : language === 'ru' ? "Разрешения" : language === 'tr' ? "İzinler" : language === 'oz' ? "Рухсатлар" : "Permissions"}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(PERMISSION_LABELS[language] ?? PERMISSION_LABELS.en).map(([key, label]) => (
                      <label key={key} className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all',
                        roleForm.permissions[key]
                          ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      )}>
                        <input
                          type="checkbox"
                          checked={!!roleForm.permissions[key]}
                          onChange={e => setRoleForm(f => ({
                            ...f,
                            permissions: { ...f.permissions, [key]: e.target.checked }
                          }))}
                          className="w-4 h-4 accent-indigo-600"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeRoleManager} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300">
                    {t.common.cancel}
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {saving ? t.common.loading : t.common.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Deactivate Confirm ────────────────────────────────────────────── */}
      <AnimatePresence>
        {deactivateId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.common.delete}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.settings?.deactivateConfirm || 'Deactivate this staff member?'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeactivateId(null)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300">
                  {t.common.cancel}
                </button>
                <button onClick={handleDeactivate} className="flex-1 px-6 py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                  {t.common.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteRoleId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) setDeleteRoleId(null); }}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {language === 'uz' ? 'Rolni o‘chirish' : language === 'ru' ? 'Удалить роль' : language === 'tr' ? 'Rolni ochirish' : language === 'oz' ? 'Ролни учириш' : 'Delete role'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {language === 'uz' ? 'Bu rol foydalanuvchiga biriktirilmagan bo‘lsa, uni o‘chirishingiz mumkin.' : language === 'ru' ? 'Роль можно удалить, если она не назначена пользователям.' : language === 'tr' ? 'Bu rol hech kimga biriktirilmagan bolsa, uni ochirish mumkin.' : language === 'oz' ? 'Рол хеч кимга бириктирилмаган булса, уни учириш мумкин.' : 'You can delete this role if no users are assigned to it.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteRoleId(null)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300">
                  {t.common.cancel}
                </button>
                <button onClick={() => handleDeleteRole(deleteRoleId)} className="flex-1 px-6 py-3 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all">
                  {t.common.delete}
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
