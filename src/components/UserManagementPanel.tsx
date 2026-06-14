import { useEffect, useMemo, useState } from 'react';
import { Building2, ImagePlus, KeyRound, Mail, Pencil, Phone, Power, Shield, Trash2, UserPlus } from 'lucide-react';
import { useStore, type User, type UserPayload } from '../store/useStore';
import { canManageUsers as hasUsersPermission } from '../lib/roleAccess';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const emptyUserForm: UserPayload & { password: string } = {
  branch_id: 1,
  username: '',
  full_name: '',
  email: '',
  phone: '',
  avatar_url: '',
  role: 'cashier',
  is_active: true,
  password: '',
};

const roleOptions: Array<User['role']> = [
  'cashier',
  'sorter',
  'packer',
  'branch-manager',
  'manager',
  'admin',
  'super-admin',
];

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

export default function UserManagementPanel() {
  const { users, branches, currentUser, addUser, updateUser, deleteUser, fetchBranches } = useStore();
  const isAdmin = hasUsersPermission(currentUser?.role);
  const isSuperAdmin = currentUser?.role === 'super-admin';
  const [userForm, setUserForm] = useState<UserPayload & { password: string }>(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  const canManageUsers = isAdmin;
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [users]
  );

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const startNewUser = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserFormError(null);
  };

  const startEditUser = (user: User) => {
    if (!isSuperAdmin && user.role === 'super-admin') {
      setUserFormError('Only a super-admin can edit another super-admin.');
      return;
    }

    setEditingUserId(user.id);
    setUserForm({
      branch_id: user.branch_id ?? 1,
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
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(emptyUserForm);
    setUserFormError(null);
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
    if (!canManageUsers) return;
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
          branch_id: userForm.branch_id ?? 1,
        };

        if (userForm.password) {
          payload.password = userForm.password;
        }

        await updateUser(editingUserId, payload);
      } else {
        await addUser({
          ...userForm,
          branch_id: userForm.branch_id ?? 1,
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
    if (!canManageUsers) return;
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
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black">User Management</div>
            <div className="text-sm text-slate-500 mt-2">Roles, activity, image, contact details, and password control.</div>
          </div>
          <button
            onClick={startNewUser}
            disabled={!canManageUsers}
            className={cn(
              'rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2',
              canManageUsers
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Users</div>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {sortedUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 border border-slate-300">
                      {getInitials(user.full_name || user.username)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate text-slate-900">{user.full_name}</span>
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border',
                          user.is_active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                        )}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 truncate">{user.email}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {user.role} • Last login: {formatTimestamp(user.last_login_at)}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-blue-700">
                      <Building2 size={13} />
                      {user.branch_name || branches.find((branch) => branch.id === user.branch_id)?.name || 'No branch'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEditUser(user)}
                    disabled={!canManageUsers || (!isSuperAdmin && user.role === 'super-admin')}
                    className={cn(
                      'flex-1 rounded-2xl py-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      !canManageUsers || (!isSuperAdmin && user.role === 'super-admin')
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    disabled={!canManageUsers || user.id === currentUser?.id || (!isSuperAdmin && user.role === 'super-admin')}
                    className={cn(
                      'flex-1 rounded-2xl py-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      !canManageUsers || user.id === currentUser?.id || (!isSuperAdmin && user.role === 'super-admin')
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
              {editingUserId ? 'Edit User' : 'Create User'}
            </div>
            {editingUserId && (
              <button onClick={resetUserForm} className="text-xs text-slate-500 hover:text-slate-900 font-bold">
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
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-3 py-3 text-sm"
            />
            <input
              type="text"
              placeholder="Username"
              value={userForm.username}
              onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-3 py-3 text-sm"
            />
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-3 py-3 text-sm"
              />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="tel"
                placeholder="Phone number"
                value={userForm.phone}
                onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-3 py-3 text-sm"
              />
            </div>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder={editingUserId ? 'New password (optional)' : 'Password'}
                value={userForm.password}
                onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-3 py-3 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  title="Role"
                  value={userForm.role}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value as User['role'] }))}
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-3 py-3 text-sm appearance-none"
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
              <label className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 text-sm flex items-center gap-2 text-slate-800">
                <Power size={16} className={userForm.is_active ? 'text-emerald-600' : 'text-rose-600'} />
                <input
                  type="checkbox"
                  checked={userForm.is_active}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                  className="accent-blue-500"
                />
                Active account
              </label>
            </div>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                title="Branch"
                value={userForm.branch_id ?? 1}
                onChange={(event) => setUserForm((prev) => ({ ...prev, branch_id: Number(event.target.value) }))}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-3 py-3 text-sm appearance-none"
              >
                {branches.length === 0 && <option value={1}>فرع الفلاح</option>}
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} - {branch.city || 'No city'}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 p-3 space-y-3">
              <div className="flex items-center gap-3">
                {userForm.avatar_url ? (
                  <img
                    src={userForm.avatar_url}
                    alt="Avatar preview"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-slate-700 border border-slate-300">
                    {getInitials(userForm.full_name || userForm.username)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">Profile image</div>
                  <div className="text-xs text-slate-500">Upload a small image or paste a direct URL below.</div>
                </div>
              </div>

              <label className="w-full rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <ImagePlus size={16} />
                Upload image
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              </label>
              <input
                type="text"
                placeholder="Or paste image URL / data URL"
                value={userForm.avatar_url}
                onChange={(event) => setUserForm((prev) => ({ ...prev, avatar_url: event.target.value }))}
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 px-3 py-3 text-sm"
              />
            </div>
          </div>

          {userFormError && <div className="text-xs text-rose-600 font-semibold">{userFormError}</div>}

          <button
            onClick={handleSaveUser}
            disabled={savingUser || !canManageUsers}
            className={cn(
              'w-full rounded-2xl py-3 text-sm font-black uppercase tracking-widest transition-all',
              !canManageUsers
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : savingUser
                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            {savingUser ? 'Saving...' : editingUserId ? 'Save User Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
