import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import {
  Building2,
  BarChart3,
  Flame,
  LayoutDashboard,
  Package,
  PackageCheck,
  Search,
  Trophy,
  BellRing,
  ClipboardCheck,
  GraduationCap,
  History,
  ListChecks,
  Menu,
  MessageCircle,
  Phone,
  ReceiptText,
  X,
  Wifi,
} from 'lucide-react';
import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useStore, type AppThemeMode } from './store/useStore';
import { backendDbLabel, backendDbProvider } from './lib/supabaseClient';
import { Viewer3DSettingsProvider } from './context/Viewer3DSettings';
import {
  canAccessDashboard,
  canAccessManagement,
  canAccessSearch,
  canAccessSorting,
  canAccessAchievements,
  canAccessCustomerAlerts,
  canAccessTrainingAcademy,
  canAccessBranches,
  allowedSortingTabs,
  defaultRouteForRole,
} from './lib/roleAccess';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Management = lazy(() => import('./pages/Management'));
const BranchesPage = lazy(() => import('./pages/Branches'));
const CashierSearchPage = lazy(() => import('./pages/CashierSearch'));
const PickupSearchPage = lazy(() => import('./pages/PickupSearch'));
const OrderReviewPage = lazy(() => import('./pages/OrderReview'));
const SearchPage = lazy(() => import('./pages/SearchNew'));
const ClothesSortingPage = lazy(() => import('./pages/ClothesSortingPage'));
const SortingPage = lazy(() => import('./pages/Sorting'));
const ActiveSortingOrdersPage = lazy(() => import('./pages/ActiveSortingOrders'));
const AchievementsPage = lazy(() => import('./pages/Achievements'));
const CustomerAlertsPage = lazy(() => import('./pages/CustomerAlerts'));
const AiConversationsPage = lazy(() => import('./pages/AiConversations'));
const TrainingAcademyPage = lazy(() => import('./pages/TrainingAcademyPage'));
const TrainingTranslationsPage = lazy(() => import('./pages/TrainingTranslationsPage'));
const POSConnectPage = lazy(() => import('./pages/POSConnect'));
const ReportPage = lazy(() => import('./pages/Report'));
const OperationsReportPage = lazy(() => import('./pages/OperationsReport'));
const ExpenseTestPage = lazy(() => import('./pages/ExpenseTest'));
const ActivityLogPage = lazy(() => import('./pages/ActivityLog'));

const resolveAppTheme = (mode: AppThemeMode, now = new Date()): 'night' | 'light' => {
  if (mode === 'night') return 'night';
  if (mode === 'light') return 'light';
  const hour = now.getHours();
  return hour >= 18 || hour < 6 ? 'night' : 'light';
};

const getInitials = (name?: string | null) =>
  (name || '??')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function MobileTopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const location = useLocation();
  const title = useMemo(() => {
    if (location.pathname === '/management') return 'Warehouse Management';
    if (location.pathname === '/branches') return 'Branch';
    if (location.pathname === '/activity-log') return 'Activity Log';
    if (location.pathname === '/cashier-search') return 'Cashier Search';
    if (location.pathname === '/pickup-search') return 'Phone Pickup Search';
    if (location.pathname === '/order-review') return 'Order Review & Verification';
    if (location.pathname === '/search') return 'Stores';
    if (location.pathname === '/sorting') return 'CLOTHES SORTING';
    if (location.pathname === '/ironing') return 'Iron';
    if (location.pathname === '/blanket-packing') return 'Blankets Packing';
    if (location.pathname === '/sorting-orders') return 'Active Sorting Orders';
    if (location.pathname === '/achievements') return 'Achievements';
    if (location.pathname === '/customer-alerts') return 'Customer Alerts';
    if (location.pathname === '/ai-conversations') return 'AI Conversations';
    if (location.pathname === '/pos-connect') return 'POS Connect';
    if (location.pathname === '/report') return 'Report';
    if (location.pathname === '/performance-report') return 'Performance Report';
    if (location.pathname === '/operations-report') return 'Operations Report';
    if (location.pathname === '/expense-test') return 'Expense Test';
    if (location.pathname.startsWith('/training-academy')) return 'Training Academy';
    return 'Warehouse Dashboard';
  }, [location.pathname]);

  const isDark = location.pathname === '/search';

  return (
    <header
      className={cn(
        'md:hidden sticky top-0 z-30 border-b backdrop-blur',
        isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-slate-50/90 border-slate-200 text-slate-900'
      )}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className={cn(
            'p-2 rounded-xl border transition-colors',
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          )}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <div className={cn('text-xs font-black uppercase tracking-[0.25em]', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Smart Storage Hub
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('text-base font-extrabold truncate', isDark ? 'text-white' : 'text-slate-900')}>
              {title}
            </div>
            <span
              className={cn(
                'shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border',
                backendDbProvider === 'postgres'
                  ? isDark
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
                  : isDark
                    ? 'border-slate-600 bg-slate-800 text-slate-200'
                    : 'border-slate-300 bg-white text-slate-600'
              )}
              title={backendDbProvider === 'postgres' ? 'PostgreSQL database mode' : 'SQLite local database mode'}
            >
              {backendDbLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function LoginScreen() {
  const { loginUser, sessionNotice, clearSessionNotice } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }
    try {
      setBusy(true);
      setError(null);
      await loginUser(username.trim(), password);
      setPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="space-y-2 text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400">POS Employee Access</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Smart Storage Hub</h1>
          <p className="text-sm text-slate-400 font-semibold">
            Sign in with the same username and password you use in AIPSoft POS.
          </p>
        </div>

        <div className="space-y-3">
          {sessionNotice && (
            <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 font-semibold flex items-start justify-between gap-3">
              <span>{sessionNotice}</span>
              <button
                type="button"
                onClick={clearSessionNotice}
                className="shrink-0 text-amber-200 hover:text-white text-xs uppercase tracking-wider font-black"
              >
                Dismiss
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="POS Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleLogin();
            }}
            className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3.5 text-base font-semibold"
          />
          <input
            type="password"
            placeholder="POS Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleLogin();
            }}
            className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3.5 text-base font-semibold"
          />
          <button
            type="button"
            onClick={handleLogin}
            disabled={busy}
            className={cn(
              'w-full rounded-2xl py-3.5 text-base font-black uppercase tracking-widest transition-all',
              busy ? 'bg-slate-700 text-slate-300 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
          {error && <div className="text-sm text-rose-300 font-semibold">{error}</div>}
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const expanded = isOpen || mobileOpen;
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    users,
    currentUser,
    loginUser,
    logoutUser,
  } = useStore();

  const role = currentUser?.role;
  const currentUserId = currentUser?.id ?? null;
  const showDashboard = canAccessDashboard(role);
  const showManagement = canAccessManagement(role);
  const showBranches = canAccessBranches(role);
  const showSearch = canAccessSearch(role);
  const showSorting = canAccessSorting(role);
  const showAchievements = canAccessAchievements(role);
  const showCustomerAlerts = canAccessCustomerAlerts(role);
  const showTrainingAcademy = canAccessTrainingAcademy(role);
  const sortingWorkflows = allowedSortingTabs(role);

  const navItems = [
    ...(showDashboard ? [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }] : []),
    ...(showBranches ? [{ name: 'Branch', path: '/branches', icon: Building2 }] : []),
    ...(showManagement ? [{ name: 'Management', path: '/management', icon: Package }] : []),
    ...(showManagement ? [{ name: 'Activity Log', path: '/activity-log', icon: History }] : []),
    ...(showSearch ? [{ name: 'Cashier Search', path: '/cashier-search', icon: Search }] : []),
    ...(showSearch ? [{ name: 'Pickup Search', path: '/pickup-search', icon: Phone }] : []),
    ...(showSearch ? [{ name: 'Order Review', path: '/order-review', icon: ClipboardCheck }] : []),
    ...(showSearch ? [{ name: 'Stores', path: '/search', icon: Search }] : []),
    ...(showSorting && sortingWorkflows.includes('sorting')
      ? [{ name: 'CLOTHES SORTING', path: '/sorting', icon: Package }]
      : []),
    ...(showSorting && sortingWorkflows.includes('packing')
      ? [{ name: 'Ironing', path: '/ironing', icon: Flame }]
      : []),
    ...(showSorting && sortingWorkflows.includes('blanket_packing')
      ? [{ name: 'Blankets Packing ', path: '/blanket-packing', icon: PackageCheck }]
      : []),
    ...(showSorting ? [{ name: 'Active Sorting Orders', path: '/sorting-orders', icon: ListChecks }] : []),
    ...(showAchievements ? [{ name: 'Achievements', path: '/achievements', icon: Trophy }] : []),
    ...(showCustomerAlerts ? [{ name: 'Alerts', path: '/customer-alerts', icon: BellRing }] : []),
    ...(showManagement ? [{ name: 'AI Conversations', path: '/ai-conversations', icon: MessageCircle }] : []),
    ...(showSearch ? [{ name: 'POS Connect', path: '/pos-connect', icon: Wifi }] : []),
    ...(showManagement ? [{ name: 'Report', path: '/report', icon: ReceiptText }] : []),
    ...(showManagement ? [{ name: 'Operations Report', path: '/operations-report', icon: BarChart3 }] : []),
    ...(showManagement ? [{ name: 'Expense Test', path: '/expense-test', icon: ReceiptText }] : []),
    ...(showTrainingAcademy ? [{ name: 'Training Academy', path: '/training-academy', icon: GraduationCap }] : []),
  ];

  const activeLoginUsers = useMemo(
    () => users.filter((user) => user.is_active),
    [users]
  );

  useEffect(() => {
    if (currentUser) {
      setSelectedUserId(currentUser.id);
    }
  }, [currentUser]);

  const handleSignIn = async () => {
    if (!selectedUserId) return;
    const user = users.find((item) => item.id === Number(selectedUserId));
    if (!user) return;

    if (!user.is_active) {
      setLoginError('This account is inactive and cannot sign in.');
      return;
    }

    try {
      setLoginError(null);
      await loginUser(user.username, password);
      setPassword('');
    } catch (error: any) {
      setLoginError(error.response?.data?.error || error.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setPassword('');
    setLoginError(null);
    setSelectedUserId('');
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          aria-label="Close navigation menu"
        />
      )}
      <aside
        className={cn(
          'bg-slate-900 text-white h-[100dvh] md:h-screen transition-all duration-300 flex flex-col overflow-hidden z-50',
          // Mobile drawer
          'fixed md:static inset-y-0 left-0 md:inset-auto',
          'w-[min(90vw,26rem)] md:w-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:translate-x-0',
          // Desktop collapse behavior
          isOpen ? 'md:w-[27rem]' : 'md:w-20'
        )}
      >
      <div className="shrink-0 p-4 flex items-center justify-between border-b border-slate-800">
        {expanded && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-xl tracking-tight truncate">SMART STORAGE HUB</span>
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border shrink-0',
                backendDbProvider === 'postgres'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-slate-700 bg-slate-800 text-slate-200'
              )}
              title={backendDbProvider === 'postgres' ? 'PostgreSQL database mode' : 'SQLite local database mode'}
            >
              {backendDbLabel}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:inline-flex p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle sidebar size"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [touch-action:pan-y]">
      <nav className="p-4 space-y-2 border-b border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={22} className={cn(isActive ? 'text-white' : 'group-hover:text-white')} />
              {expanded && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
        <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4 space-y-4">
          <div className="flex items-center gap-3">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700">
                {getInitials(currentUser?.full_name || currentUser?.username)}
              </div>
            )}

            {expanded && (
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{currentUser?.full_name || 'Guest'}</div>
                <div className="text-xs text-slate-500 truncate">
                  {currentUser ? `${currentUser.role} • ${currentUser.email}` : 'Not signed in'}
                </div>
              </div>
            )}
          </div>

          {expanded && (
            <div className="space-y-3">
              {currentUser ? (
                <>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-bold">Session</div>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl bg-slate-700 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-600 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-bold">Sign In</div>
                  <select
                    title="Choose user"
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value === '' ? '' : Number(event.target.value))}
                    className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-3 py-3 text-sm"
                  >
                    <option value="">Select active user</option>
                    {activeLoginUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-3 py-3 text-sm"
                  />
                  <button
                    onClick={handleSignIn}
                    className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-all"
                  >
                    Sign In
                  </button>
                  {loginError && <div className="text-xs text-rose-300">{loginError}</div>}
                </>
              )}
            </div>
          )}
        </section>

      </div>
      </div>
      </aside>
    </>
  );
}

function AppLayout() {
  const location = useLocation();
  const { fetchStores, fetchBlankets, fetchLogs, fetchUsers, fetchBranches, currentUser, searchImmersive, themeMode } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [clockTick, setClockTick] = useState(() => Date.now());
  const role = currentUser?.role;
  const currentUserId = currentUser?.id ?? null;
  const isManager = canAccessManagement(role);
  const canOpenDashboard = canAccessDashboard(role);
  const canOpenBranches = canAccessBranches(role);
  const canOpenManagement = canAccessManagement(role);
  const canOpenActivityLog = canOpenManagement;
  const canOpenSearch = canAccessSearch(role);
  const canOpenSorting = canAccessSorting(role);
  const canOpenSortingOrders = canOpenSorting;
  const sortingWorkflows = useMemo(() => allowedSortingTabs(role), [role]);
  const canOpenClothesSorting = canOpenSorting && sortingWorkflows.includes('sorting');
  const canOpenIroning = canOpenSorting && sortingWorkflows.includes('packing');
  const canOpenBlanketPacking = canOpenSorting && sortingWorkflows.includes('blanket_packing');
  const canOpenAchievements = canAccessAchievements(role);
  const canOpenCustomerAlerts = canAccessCustomerAlerts(role);
  const canOpenAiConversations = canOpenManagement;
  const canOpenTrainingAcademy = canAccessTrainingAcademy(role);
  const canOpenReport = canOpenManagement;
  const canOpenExpenseTest = canOpenManagement;
  const defaultPath = defaultRouteForRole(role);
  const hideMobileTopBar = location.pathname === '/search' && searchImmersive;
  const resolvedTheme = useMemo(
    () => resolveAppTheme(themeMode, new Date(clockTick)),
    [themeMode, clockTick]
  );

  useEffect(() => {
    if (themeMode !== 'auto') return;
    const timer = window.setInterval(() => setClockTick(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [themeMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-app-theme', resolvedTheme);
    return () => {
      root.removeAttribute('data-app-theme');
    };
  }, [resolvedTheme]);

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    void fetchBranches();
    void fetchStores();
    void fetchBlankets();
    void fetchLogs();
  }, [currentUserId]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className={cn(
      "flex w-full overflow-x-hidden min-h-screen font-sans",
      resolvedTheme === 'night' ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {!hideMobileTopBar && <MobileTopBar onOpenSidebar={() => setMobileSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Suspense
            fallback={
              <div className="min-h-full p-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-black text-slate-600 shadow-xl">
                  Loading workspace...
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={canOpenDashboard ? <Dashboard /> : <Navigate to={defaultPath} replace />} />
              <Route
                path="/branches"
                element={canOpenBranches ? <BranchesPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/management"
                element={canOpenManagement ? <Management /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/activity-log"
                element={canOpenActivityLog ? <ActivityLogPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/cashier-search"
                element={canOpenSearch ? <CashierSearchPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/pickup-search"
                element={canOpenSearch ? <PickupSearchPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/order-review"
                element={canOpenSearch ? <OrderReviewPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route path="/search" element={canOpenSearch ? <SearchPage /> : <Navigate to={defaultPath} replace />} />
              <Route
                path="/sorting"
                element={
                  canOpenClothesSorting ? (
                    <ClothesSortingPage />
                  ) : (
                    <Navigate to={defaultPath} replace />
                  )
                }
              />
              <Route
                path="/ironing"
                element={
                  canOpenIroning ? (
                    <SortingPage workflow="packing" showWorkflowTabs={false} />
                  ) : (
                    <Navigate to={defaultPath} replace />
                  )
                }
              />
              <Route
                path="/blanket-packing"
                element={
                  canOpenBlanketPacking ? (
                    <SortingPage workflow="blanket_packing" showWorkflowTabs={false} />
                  ) : (
                    <Navigate to={defaultPath} replace />
                  )
                }
              />
              <Route
                path="/sorting-orders"
                element={canOpenSortingOrders ? <ActiveSortingOrdersPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/achievements"
                element={canOpenAchievements ? <AchievementsPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/customer-alerts"
                element={canOpenCustomerAlerts ? <CustomerAlertsPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/ai-conversations"
                element={canOpenAiConversations ? <AiConversationsPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/training-academy"
                element={canOpenTrainingAcademy ? <TrainingAcademyPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/training-academy/translations"
                element={canOpenTrainingAcademy ? <TrainingTranslationsPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/pos-connect"
                element={canOpenSearch ? <POSConnectPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/report"
                element={canOpenReport ? <ReportPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/performance-report"
                element={canOpenReport ? <ReportPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/operations-report"
                element={canOpenReport ? <OperationsReportPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route
                path="/expense-test"
                element={canOpenExpenseTest ? <ExpenseTestPage /> : <Navigate to={defaultPath} replace />}
              />
              <Route path="*" element={<Navigate to={defaultPath} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const configuredBase = import.meta.env.BASE_URL || '/';
  const normalizedConfiguredBase = configuredBase.endsWith('/')
    ? configuredBase.slice(0, -1) || '/'
    : configuredBase;
  const runtimePath = typeof window !== 'undefined' ? window.location.pathname : '';
  const routerBasename =
    normalizedConfiguredBase !== '/' && runtimePath.startsWith(normalizedConfiguredBase)
      ? normalizedConfiguredBase
      : '/';

  return (
    <Router basename={routerBasename}>
      <Viewer3DSettingsProvider>
        <AppLayout />
      </Viewer3DSettingsProvider>
    </Router>
  );
}
