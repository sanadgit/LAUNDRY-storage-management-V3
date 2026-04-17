import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Search,
  Menu,
  X,
  Users,
  Mail,
  Phone,
  Shield,
  Power,
  UserPlus,
  ImagePlus,
  Trash2,
  Pencil,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore, type User, type UserPayload } from './store/useStore';
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

const emptyUserForm: UserPayload & { password: string } = {
  username: '',
  full_name: '',
  email: '',
  phone: '',
  avatar_url: '',
  role: 'cashier',
  is_active: true,
  password: '',
};

const roleOptions: Array<User['role']> = ['cashier', 'admin', 'super-admin'];

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

const getInitials = (name?: string | null) =>
  (name || '??')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const formatTimestamp = (value: string | null) =>
  value ? new Date(value).toLocaleString() : 'Never';

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
            Blanket Hub
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
  const [userForm, setUserForm] = useState<UserPayload & { password: string }>(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  const {
    users,
    currentUser,
    loginUser,
    logoutUser,
    addUser,
    updateUser,
    deleteUser,
  } = useStore();

  const isAdmin = ['admin', 'super-admin'].includes(currentUser?.role || '');
  const isSuperAdmin = currentUser?.role === 'super-admin';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Management', path: '/management', icon: Package },
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

  const startNewUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserFormError(null);
    setManagerOpen(true);
  };

  const startEditUser = (user: User) => {
    if (!isSuperAdmin && user.role === 'super-admin') {
      setUserFormError('Only a super-admin can edit another super-admin.');
      return;
    }

    setEditingUserId(user.id);
    setUserForm({
      username: user.username,
      full_name: user.full_name || user.username,
      email: user.email || '',
      phone: user.phone || '',
      avatar_url: user.avatar_url || '',
      role: user.role,
      is_active: user.is_active,
      password: '',
    });
    setUserFormError(null);
    setManagerOpen(true);
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserFormError(null);
  };

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

  const handleAvatarFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatarUrl = await readFileAsDataUrl(file);
      setUserForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
    } catch (error: any) {
      setUserFormError(error.message || 'Unable to load image');
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.username || !userForm.full_name || !userForm.email) {
      setUserFormError('Full name, username, and email are required.');
      return;
    }

    if (!editingUserId && !userForm.password) {
      setUserFormError('Password is required for new users.');
      return;
    }

    if (userForm.password && userForm.password.length < 6) {
      setUserFormError('Password must be at least 6 characters.');
      return;
    }

    if (editingUserId === currentUser?.id && !userForm.is_active) {
      setUserFormError('You cannot deactivate the account that is currently signed in.');
      return;
    }

    if (!isSuperAdmin && userForm.role === 'super-admin') {
      setUserFormError('Only a super-admin can assign the super-admin role.');
      return;
    }

    try {
      setSavingUser(true);
      setUserFormError(null);

      if (editingUserId) {
        const payload: Partial<UserPayload> & { password?: string } = {
          username: userForm.username,
          full_name: userForm.full_name,
          email: userForm.email,
          phone: userForm.phone,
          avatar_url: userForm.avatar_url,
          role: userForm.role,
          is_active: userForm.is_active,
        };

        if (userForm.password) {
          payload.password = userForm.password;
        }

        await updateUser(editingUserId, payload);
      } else {
        await addUser({
          ...userForm,
          password: userForm.password,
        });
      }

      resetUserForm();
    } catch (error: any) {
      setUserFormError(error.response?.data?.error || error.message || 'Failed to save user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      setUserFormError('Delete a different user first, then sign out if needed.');
      return;
    }

    if (!isSuperAdmin && user.role === 'super-admin') {
      setUserFormError('Only a super-admin can delete another super-admin.');
      return;
    }

    try {
      setUserFormError(null);
      await deleteUser(user.id);
      if (editingUserId === user.id) {
        resetUserForm();
      }
    } catch (error: any) {
      setUserFormError(error.response?.data?.error || error.message || 'Failed to delete user');
    }
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
            <span className="font-bold text-xl tracking-tight truncate">BLANKET HUB</span>
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

        {expanded && isAdmin && (
          <section className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-bold">User Management</div>
                <div className="text-xs text-slate-400 mt-1">Roles, activity, image, contact details, and password control.</div>
              </div>
              <button
                onClick={() => setManagerOpen((prev) => !prev)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {managerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <button
              onClick={startNewUser}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Add User
            </button>

            {managerOpen && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {users.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 space-y-3">
                      <div className="flex items-start gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700">
                            {getInitials(user.full_name || user.username)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold truncate">{user.full_name}</span>
                            <span
                              className={cn(
                                'text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border',
                                user.is_active
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                              )}
                            >
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 truncate">{user.email}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {user.role} • Last login: {formatTimestamp(user.last_login_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditUser(user)}
                          disabled={!isSuperAdmin && user.role === 'super-admin'}
                          className={cn(
                            'flex-1 rounded-2xl py-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                            !isSuperAdmin && user.role === 'super-admin'
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                          )}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === currentUser?.id || (!isSuperAdmin && user.role === 'super-admin')}
                          className={cn(
                            'flex-1 rounded-2xl py-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                            user.id === currentUser?.id || (!isSuperAdmin && user.role === 'super-admin')
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-rose-600 text-white hover:bg-rose-500'
                          )}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{editingUserId ? 'Edit User' : 'Create User'}</div>
                    {editingUserId && (
                      <button onClick={resetUserForm} className="text-xs text-slate-400 hover:text-white">
                        Cancel edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={userForm.full_name}
                      onChange={(event) => setUserForm((prev) => ({ ...prev, full_name: event.target.value }))}
                      className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-3 py-3 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={userForm.username}
                      onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
                      className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-3 py-3 text-sm"
                    />
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={userForm.email}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 pl-10 pr-3 py-3 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={userForm.phone}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 pl-10 pr-3 py-3 text-sm"
                      />
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        placeholder={editingUserId ? 'New password (optional)' : 'Password'}
                        value={userForm.password}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 pl-10 pr-3 py-3 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                          title="Role"
                          value={userForm.role}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value as User['role'] }))}
                          className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 pl-10 pr-3 py-3 text-sm appearance-none"
                        >
                          {roleOptions
                            .filter((role) => isSuperAdmin || role !== 'super-admin')
                            .map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                        </select>
                      </div>
                      <label className="rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-sm flex items-center gap-2 text-slate-100">
                        <Power size={16} className={userForm.is_active ? 'text-emerald-300' : 'text-rose-300'} />
                        <input
                          type="checkbox"
                          checked={userForm.is_active}
                          onChange={(event) => setUserForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                          className="accent-blue-500"
                        />
                        Active account
                      </label>
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-700 p-3 space-y-3">
                      <div className="flex items-center gap-3">
                        {userForm.avatar_url ? (
                          <img
                            src={userForm.avatar_url}
                            alt="Avatar preview"
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700">
                            {getInitials(userForm.full_name || userForm.username)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium">Profile image</div>
                          <div className="text-xs text-slate-400">Upload a small image or paste a direct URL below.</div>
                        </div>
                      </div>

                      <label className="w-full rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <ImagePlus size={16} />
                        Upload image
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste image URL / data URL"
                        value={userForm.avatar_url}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, avatar_url: event.target.value }))}
                        className="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 px-3 py-3 text-sm"
                      />
                    </div>
                  </div>

                  {userFormError && <div className="text-xs text-rose-300">{userFormError}</div>}

                  <button
                    onClick={handleSaveUser}
                    disabled={savingUser}
                    className={cn(
                      'w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all',
                      savingUser ? 'bg-slate-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'
                    )}
                  >
                    {savingUser ? 'Saving...' : editingUserId ? 'Save User Changes' : 'Create User'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      </aside>
    </>
  );
}

function AppLayout() {
  const { fetchStores, fetchBlankets, fetchLogs, fetchUsers } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchBlankets();
    fetchLogs();
    fetchUsers();
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        <MobileTopBar onOpenSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/management" element={<Management />} />
            <Route path="/search" element={<SearchPage />} />
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
