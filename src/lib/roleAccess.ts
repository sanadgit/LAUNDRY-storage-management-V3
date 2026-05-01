export type AppRole =
  | 'super-admin'
  | 'admin'
  | 'manager'
  | 'branch-manager'
  | 'cashier'
  | 'sorter'
  | 'packer';

const toRole = (role: unknown): AppRole | null => {
  const normalized = String(role ?? '').trim().toLowerCase();
  const roles: AppRole[] = [
    'super-admin',
    'admin',
    'manager',
    'branch-manager',
    'cashier',
    'sorter',
    'packer',
  ];
  return (roles as string[]).includes(normalized) ? (normalized as AppRole) : null;
};

export const normalizeRole = (role: unknown, fallback: AppRole = 'cashier'): AppRole => toRole(role) ?? fallback;

export const canAccessDashboard = (role: unknown) => {
  const value = toRole(role);
  return value === 'super-admin' || value === 'admin' || value === 'manager' || value === 'branch-manager';
};

export const canAccessManagement = (role: unknown) => {
  const value = toRole(role);
  return value === 'super-admin' || value === 'admin' || value === 'manager' || value === 'branch-manager';
};

export const canManageUsers = (role: unknown) => {
  const value = toRole(role);
  return value === 'super-admin' || value === 'admin' || value === 'manager';
};

export const canUseBackupTools = (role: unknown) => {
  const value = toRole(role);
  return value === 'super-admin' || value === 'admin' || value === 'manager';
};

export const canEditWarehouse = (role: unknown) => {
  const value = toRole(role);
  return value === 'super-admin' || value === 'admin' || value === 'manager' || value === 'branch-manager';
};

export const canUseInputMode = (role: unknown) => {
  const value = toRole(role);
  return value === 'super-admin' || value === 'admin';
};

export const canAccessSearch = (role: unknown) => {
  const value = toRole(role);
  return (
    value === 'super-admin' ||
    value === 'admin' ||
    value === 'manager' ||
    value === 'branch-manager' ||
    value === 'cashier'
  );
};

export const canMarkPicked = (role: unknown) => {
  const value = toRole(role);
  return (
    value === 'super-admin' ||
    value === 'admin' ||
    value === 'manager' ||
    value === 'branch-manager' ||
    value === 'cashier'
  );
};

export const canAccessSorting = (role: unknown) => {
  const value = toRole(role);
  return (
    value === 'super-admin' ||
    value === 'admin' ||
    value === 'manager' ||
    value === 'branch-manager' ||
    value === 'sorter' ||
    value === 'packer'
  );
};

export const canAccessAchievements = (role: unknown) => {
  const value = toRole(role);
  return (
    value === 'super-admin' ||
    value === 'admin' ||
    value === 'manager' ||
    value === 'branch-manager' ||
    value === 'sorter' ||
    value === 'packer' ||
    value === 'cashier'
  );
};

export const allowedSortingTabs = (role: unknown): Array<'sorting' | 'packing' | 'blanket_packing'> => {
  const value = toRole(role);
  if (value === 'sorter') return ['sorting'];
  if (value === 'packer') return ['packing', 'blanket_packing'];
  return ['sorting', 'packing', 'blanket_packing'];
};

export const defaultRouteForRole = (role: unknown) => {
  const value = toRole(role);
  if (value === 'sorter' || value === 'packer') return '/sorting';
  if (value === 'cashier') return '/search';
  return '/';
};
