import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from './store/useStore';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import SearchPage from './pages/Search';
import { isSupabaseEnabled } from './lib/supabaseClient';
import { Viewer3DSettingsProvider } from './context/Viewer3DSettings';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    if (location.pathname === '/search') return 'Search & Retrieval';
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
                isSupabaseEnabled
                  ? isDark
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
                  : isDark
                    ? 'border-slate-600 bg-slate-800 text-slate-200'
                    : 'border-slate-300 bg-white text-slate-600'
              )}
              title={isSupabaseEnabled ? 'Supabase enabled for stores/blankets/logs' : 'SQLite local database mode'}
            >
              {isSupabaseEnabled ? 'Supabase' : 'SQLite'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function LoginScreen() {
  const { loginUser } = useStore();
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
          <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">Secure Access</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Smart Storage Hub</h1>
          <p className="text-sm text-slate-400 font-semibold">
            Sign in to open the application. Edit actions are restricted to admin users.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void handleLogin();
            }}
            className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3.5 text-base font-semibold"
          />
          <input
            type="password"
            placeholder="Password"
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

  const isAdmin = ['admin', 'super-admin'].includes(currentUser?.role || '');

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    ...(isAdmin ? [{ name: 'Management', path: '/management', icon: Package }] : []),
    { name: 'Search & Retrieval', path: '/search', icon: Search },
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
          'bg-slate-900 text-white h-screen transition-all duration-300 flex flex-col overflow-hidden z-50',
          // Mobile drawer
          'fixed md:static inset-y-0 left-0 md:inset-auto',
          'w-[min(90vw,26rem)] md:w-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:translate-x-0',
          // Desktop collapse behavior
          isOpen ? 'md:w-[27rem]' : 'md:w-20'
        )}
      >
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {expanded && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-xl tracking-tight truncate">SMART STORAGE HUB</span>
            <span
              className={cn(
                'text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border shrink-0',
                isSupabaseEnabled
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-slate-700 bg-slate-800 text-slate-200'
              )}
              title={isSupabaseEnabled ? 'Supabase enabled for stores/blankets/logs' : 'SQLite local database mode'}
            >
              {isSupabaseEnabled ? 'Supabase' : 'SQLite'}
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
      </aside>
    </>
  );
}

function AppLayout() {
  const location = useLocation();
  const { fetchStores, fetchBlankets, fetchLogs, fetchUsers, currentUser, searchImmersive } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isAdmin = ['admin', 'super-admin'].includes(currentUser?.role || '');
  const hideMobileTopBar = location.pathname === '/search' && searchImmersive;

  useEffect(() => {
    void fetchUsers();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    void fetchStores();
    void fetchBlankets();
    void fetchLogs();
    if (isAdmin) void fetchUsers();
  }, [currentUser, isAdmin]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex w-full overflow-x-hidden bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {!hideMobileTopBar && <MobileTopBar onOpenSidebar={() => setMobileSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/management" element={isAdmin ? <Management /> : <Navigate to="/search" replace />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Viewer3DSettingsProvider>
        <AppLayout />
      </Viewer3DSettingsProvider>
    </Router>
  );
}
