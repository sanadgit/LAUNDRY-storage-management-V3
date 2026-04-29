import { create } from 'zustand';
import axios from 'axios';
import type { GridFace } from '../constants/virtualWarehouseGrid';
import {
  STORE_LOCAL_FOOTPRINT_DEPTH,
  STORE_LOCAL_FOOTPRINT_WIDTH,
} from '../constants/storeGeometry';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { AppRole, canEditWarehouse, canManageUsers, canMarkPicked } from '../lib/roleAccess';

const supabaseProxyBase = '/api/supabase';
const AUTH_TOKEN_KEY = 'authToken';
const LEGACY_USERNAME_KEY = 'currentUser';

const describeAxiosError = (error: any) => {
  const status = error?.response?.status;
  const apiError = error?.response?.data?.error;
  const apiMessage = typeof apiError === 'string' && apiError.trim().length > 0 ? apiError.trim() : null;
  const message = typeof error?.message === 'string' ? error.message : '';

  const parts: string[] = [];
  if (typeof status === 'number') parts.push(`HTTP ${status}`);
  if (apiMessage) parts.push(apiMessage);
  if (message && !apiMessage) parts.push(message);
  return parts.filter(Boolean).join(' · ') || 'Request failed';
};

const requireSupabaseProxy = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request();
  } catch (error: any) {
    const detail = describeAxiosError(error);
    const hasResponse = Boolean(error?.response);
    const hint = hasResponse ? '' : ' Make sure the backend is running via `npm run dev`.';
    throw new Error(`${detail}.${hint}`);
  }
};

const createRequestMeta = (notes?: string) => {
  const requestId =
    (globalThis.crypto as any)?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const device =
    typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string'
      ? navigator.userAgent.slice(0, 300)
      : '';

  const normalizedNotes = typeof notes === 'string' && notes.trim().length > 0 ? notes.trim().slice(0, 1000) : '';

  return {
    request_id: requestId,
    device,
    notes: normalizedNotes || undefined,
  };
};

const tryVibrate = (pattern: number | number[]) => {
  try {
    if (typeof navigator === 'undefined') return;
    if (typeof navigator.vibrate !== 'function') return;
    navigator.vibrate(pattern);
  } catch {
    // ignore vibration errors
  }
};

const readAuthToken = () =>
  typeof localStorage === 'undefined' ? null : localStorage.getItem(AUTH_TOKEN_KEY);

const applyAuthToken = (token: string | null) => {
  if (token && token.trim().length > 0) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete axios.defaults.headers.common.Authorization;
};

if (typeof window !== 'undefined') {
  applyAuthToken(readAuthToken());
}

export interface Store {
  store_name: string;
  position_x: number;
  position_y: number;
  position_z: number;
  width: number;
  depth: number;
  height: number;
  rows: number;
  columns: number;
  rotation_y: number;
  auto_settle: boolean;
  store_type: 'grid' | 'hanger';
  hanger_slots: number;
  /** Max number of folded bags per (row,column) cell. */
  slot_capacity: number;
  /** Solid color used for this store in the 3D scene. */
  store_color: string;
  /** 3D material opacity for this store (0.1..1). */
  store_opacity: number;
  /** 3D overlay cell width (local model units). */
  cell_width: number;
  /** 3D overlay cell depth (local model units). */
  cell_depth: number;
  /** 3D overlay cell height (local model units). */
  cell_height: number;
  /** Require barcode scan confirmation before marking as picked. */
  require_pick_scan: boolean;
}

export interface Blanket {
  id: number;
  blanket_number: string;
  store: string;
  row: number;
  column: number;
  status: 'stored' | 'retrieved' | 'picked';
  created_at: string;
}

export type BlanketWritePayload = Omit<Blanket, 'id' | 'created_at'> & {
  notes?: string;
};

export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: AppRole;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  last_login_at: string | null;
}

export interface UserPayload {
  username: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: User['role'];
  is_active: boolean;
  password?: string;
}

export interface Log {
  id: number;
  blanket_number: string;
  action: string;
  user: string;
  store: string;
  row: number;
  column: number;
  status: string;
  request_id?: string | null;
  device?: string | null;
  ip?: string | null;
  notes?: string | null;
  timestamp: string;
}

interface AppState {
  stores: Store[];
  blankets: Blanket[];
  logs: Log[];
  selectedStore: string | null;
  searchQuery: string;
  retrievalMode: boolean;
  retrievalIndex: number;
  viewMode: '2D' | '3D';
  lastUsedStore: string | null;
  lastInsertedCell: { row: number, column: number } | null;
  /** Virtual 8x15 overlay - front/back depth slice */
  gridFace: GridFace;
  /** Click-selected cell in 3D overlay (binds to DB row/column for store) */
  selectedGridCell: { store: string; row: number; column: number } | null;
  /** Mobile search UI mode: hide top app bar when true. */
  searchImmersive: boolean;
  users: User[];
  currentUser: User | null;
  sessionNotice: string | null;

  fetchUsers: () => Promise<void>;
  loginUser: (username: string, password: string) => Promise<void>;
  logoutUser: () => void;
  addUser: (user: UserPayload & { password: string }) => Promise<void>;
  updateUser: (id: number, data: Partial<UserPayload>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  fetchStores: () => Promise<void>;
  addStore: (store: Omit<Store, 'position_x' | 'position_y' | 'position_z' | 'width' | 'depth' | 'height' | 'rotation_y'>) => Promise<void>;
  updateStore: (name: string, data: Partial<Store>) => Promise<void>;
  deleteStore: (name: string) => Promise<void>;
  fetchBlankets: () => Promise<void>;
  addBlanket: (blanket: BlanketWritePayload) => Promise<void>;
  updateBlanket: (id: number, data: (Partial<Blanket> & { notes?: string })) => Promise<void>;
  deleteBlanket: (id: number) => Promise<void>;
  fetchLogs: (limit?: number) => Promise<void>;

  setSelectedStore: (name: string | null) => void;
  setSearchQuery: (query: string) => void;
  setRetrievalMode: (mode: boolean) => void;
  setRetrievalIndex: (index: number) => void;
  setViewMode: (mode: '2D' | '3D') => void;
  markAsPicked: (blanket: Blanket) => Promise<void>;
  setLastUsedStore: (name: string | null) => void;
  setLastInsertedCell: (cell: { row: number, column: number } | null) => void;
  setGridFace: (face: GridFace) => void;
  setSelectedGridCell: (cell: { store: string; row: number; column: number } | null) => void;
  setSearchImmersive: (value: boolean) => void;
  clearSessionNotice: () => void;
}

const defaultStoreSlots = [
  { x: -10, z: -10 },
  { x: -10, z: 0 },
  { x: 0, z: -10 },
  { x: 0, z: 0 },
  { x: 10, z: -10 },
  { x: 10, z: 0 },
  { x: 20, z: 0 },
];

const MIN_CELL_DIMENSION = -20;
const MAX_CELL_DIMENSION = 20;
const MIN_ABS_CELL_DIMENSION = 0.001;

const normalizeSignedCellDimension = (value: unknown, fallback: number) => {
  const fallbackNumber = Number.isFinite(Number(fallback)) ? Number(fallback) : 0.5;
  const candidate = Number(value ?? fallbackNumber);
  const parsed = Number.isFinite(candidate) ? candidate : fallbackNumber;
  const clamped = Math.min(MAX_CELL_DIMENSION, Math.max(MIN_CELL_DIMENSION, parsed));
  if (Math.abs(clamped) >= MIN_ABS_CELL_DIMENSION) return clamped;
  return clamped < 0 || Object.is(clamped, -0) ? -MIN_ABS_CELL_DIMENSION : MIN_ABS_CELL_DIMENSION;
};

const normalizeStore = (store: Partial<Store> & Pick<Store, 'store_name'>): Store => {
  const storeType: Store['store_type'] = store.store_type === 'hanger' ? 'hanger' : 'grid';
  const rawHangerSlots = Number(store.hanger_slots ?? (storeType === 'hanger' ? store.columns ?? 10 : 0));
  const hangerSlots =
    storeType === 'hanger'
      ? Math.max(1, rawHangerSlots || 1)
      : Math.max(0, rawHangerSlots || 0);
  const rows = storeType === 'hanger' ? 1 : Math.max(1, Number(store.rows ?? 10) || 1);
  const columns = storeType === 'hanger' ? hangerSlots : Math.max(1, Number(store.columns ?? 10) || 1);
  const width = Math.max(0.1, Number(store.width ?? columns ?? 5) || columns || 5);
  const depth = Math.max(0.1, Number(store.depth ?? (storeType === 'hanger' ? 1 : rows ?? 5)) || (storeType === 'hanger' ? 1 : rows || 5));
  const defaultSlotCapacity = /^folding\b/i.test(store.store_name) ? 20 : 1;
  const slotCapacity =
    storeType === 'hanger'
      ? 1
      : Math.max(1, Number(store.slot_capacity ?? defaultSlotCapacity));
  const rawColor = String((store as any).store_color ?? '#3b82f6').trim();
  const storeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(rawColor) ? rawColor : '#3b82f6';
  const storeOpacity = Math.min(1, Math.max(0.1, Number((store as any).store_opacity ?? 1) || 1));
  const rawRequirePickScan = (store as any).require_pick_scan;
  const requirePickScan =
    rawRequirePickScan === true ||
    rawRequirePickScan === 1 ||
    rawRequirePickScan === '1'
      ? true
      : rawRequirePickScan === false ||
        rawRequirePickScan === 0 ||
        rawRequirePickScan === '0'
      ? false
      : storeType === 'hanger';
  const defaultCellWidth = STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, columns);
  const defaultCellDepth = STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, rows);
  const defaultCellHeight = 0.11;
  const cellWidth = normalizeSignedCellDimension((store as any).cell_width, defaultCellWidth);
  const cellDepth = normalizeSignedCellDimension((store as any).cell_depth, defaultCellDepth);
  const cellHeight = normalizeSignedCellDimension((store as any).cell_height, defaultCellHeight);

  return {
    store_name: store.store_name,
    position_x: Number(store.position_x ?? 0),
    position_y: Number(store.position_y ?? 0),
    position_z: Number(store.position_z ?? 0),
    width,
    depth,
    height: Math.max(0.1, Number(store.height ?? 3) || 3),
    rows,
    columns,
    rotation_y: Number(store.rotation_y ?? 0),
    auto_settle: store.auto_settle !== false,
    store_type: storeType,
    hanger_slots: hangerSlots,
    slot_capacity: slotCapacity,
    store_color: storeColor,
    store_opacity: storeOpacity,
    require_pick_scan: requirePickScan,
    cell_width: cellWidth,
    cell_depth: cellDepth,
    cell_height: cellHeight,
  };
};

const getNextStorePosition = (stores: Store[]) => {
  const availableSlot = defaultStoreSlots.find(
    (slot) => !stores.some((store) => store.position_x === slot.x && store.position_z === slot.z)
  );

  if (availableSlot) {
    return { position_x: availableSlot.x, position_z: availableSlot.z };
  }

  const lastStore = stores.at(-1);
  return {
    position_x: lastStore ? lastStore.position_x + 15 : 0,
    position_z: 0,
  };
};

const sortLogsByTimestamp = (a: Log, b: Log) => {
  const delta = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  if (delta !== 0) return delta;
  return (Number(b.id) || 0) - (Number(a.id) || 0);
};

const deriveBlanketAction = (
  previous: Pick<Blanket, 'store' | 'row' | 'column' | 'status'> | null,
  next: Pick<Blanket, 'store' | 'row' | 'column' | 'status'>
) => {
  if (!previous) {
    return next.status || 'stored';
  }

  if (previous.status !== next.status) {
    return next.status;
  }

  if (
    previous.store !== next.store ||
    previous.row !== next.row ||
    previous.column !== next.column
  ) {
    return 'moved';
  }

  return 'updated';
};

export const useStore = create<AppState>((set, get) => {
  const ensureWarehouseEditAccess = () => {
    const user = get().currentUser;
    if (!user) throw new Error('Please sign in first.');
    if (!canEditWarehouse(user.role)) throw new Error('Permission denied.');
  };

  const ensureUserManagementAccess = () => {
    const user = get().currentUser;
    if (!user) throw new Error('Please sign in first.');
    if (!canManageUsers(user.role)) throw new Error('Permission denied.');
  };

  const ensurePickAccess = () => {
    const user = get().currentUser;
    if (!user) throw new Error('Please sign in first.');
    if (!canMarkPicked(user.role)) throw new Error('Permission denied.');
  };

  return ({
  stores: [],
  blankets: [],
  logs: [],
  selectedStore: null,
  searchQuery: '',
  retrievalMode: false,
  retrievalIndex: 0,
  viewMode: '3D',
  lastUsedStore: localStorage.getItem('lastUsedStore'),
  lastInsertedCell: null,
  gridFace: 'front',
  selectedGridCell: null,
  searchImmersive: false,
  users: [],
  currentUser: null,
  sessionNotice: null,

  fetchUsers: async () => {
    const token = readAuthToken();
    if (!token) {
      const legacyUsername = typeof localStorage === 'undefined' ? null : localStorage.getItem(LEGACY_USERNAME_KEY);
      applyAuthToken(null);
      if (!legacyUsername) {
        set({ users: [], currentUser: null });
        return;
      }

      try {
        const res = await axios.get('/api/users');
        const users = Array.isArray(res.data)
          ? res.data as User[]
          : Array.isArray(res.data?.users)
            ? res.data.users as User[]
            : [];
        const active = users.find((u) => u.username === legacyUsername && u.is_active) ?? null;
        if (!active) {
          localStorage.removeItem(LEGACY_USERNAME_KEY);
          set({ users: [], currentUser: null });
          return;
        }
        set({ users, currentUser: active });
      } catch {
        localStorage.removeItem(LEGACY_USERNAME_KEY);
        set({ users: [], currentUser: null });
      }
      return;
    }

    applyAuthToken(token);
    try {
      const sessionRes = await axios.get('/api/session');
      const currentUser = sessionRes.data as User;
      if (!currentUser?.is_active) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        applyAuthToken(null);
        set({ users: [], currentUser: null, sessionNotice: 'Session expired. Please sign in again.' });
        return;
      }

      if (!canManageUsers(currentUser.role)) {
        set({ users: [], currentUser });
        return;
      }

      const res = await axios.get('/api/users');
      const users = Array.isArray(res.data)
        ? res.data as User[]
        : Array.isArray(res.data?.users)
          ? res.data.users as User[]
          : [];
      set({ users, currentUser });
    } catch (error) {
      const status = (error as any)?.response?.status;
      // Expired/invalid token is expected occasionally; clear session without noisy console spam.
      if (status !== 401) {
        console.error('fetchUsers failed:', error);
      }
      const shouldForceLogout = status === 401 || status === 403;
      if (shouldForceLogout) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(LEGACY_USERNAME_KEY);
        applyAuthToken(null);
        set({
          users: [],
          currentUser: null,
          sessionNotice: 'Session expired. Please sign in again.',
        });
        return;
      }

      // Keep current session during transient backend/network failures.
      set({
        sessionNotice: 'Connection issue. Session is still kept; retry in a moment.',
      });
    }
  },

  loginUser: async (username, password) => {
    const res = await axios.post('/api/login', { username, password });
    const data = res.data ?? {};
    const token = typeof data?.token === 'string' ? data.token.trim() : '';
    const userCandidate = (data?.user ?? data) as Partial<User> | null;
    const hasUserShape = Boolean(
      userCandidate &&
      typeof userCandidate.username === 'string' &&
      typeof userCandidate.role === 'string'
    );

    if (!hasUserShape) {
      throw new Error('Login failed: invalid server response.');
    }

    const user = userCandidate as User;
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.removeItem(LEGACY_USERNAME_KEY);
      applyAuthToken(token);
    } else {
      // Backward compatibility with older backend response shape.
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.setItem(LEGACY_USERNAME_KEY, user.username);
      applyAuthToken(null);
    }

    set({ currentUser: user, sessionNotice: null });
    if (token || canManageUsers(user.role)) {
      await get().fetchUsers();
    }
  },

  logoutUser: async () => {
    try {
      await axios.post('/api/logout');
    } catch {
      // ignore logout transport errors and clear local session anyway
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USERNAME_KEY);
    applyAuthToken(null);
    set({ currentUser: null, users: [], stores: [], blankets: [], logs: [], searchImmersive: false, sessionNotice: null });
  },

  addUser: async (user) => {
    ensureUserManagementAccess();
    await axios.post('/api/users', user);
    await get().fetchUsers();
  },

  updateUser: async (id, data) => {
    ensureUserManagementAccess();
    await axios.put(`/api/users/${id}`, data);
    await get().fetchUsers();
  },

  deleteUser: async (id) => {
    ensureUserManagementAccess();
    await axios.delete(`/api/users/${id}`);
    const state = get();
    if (state.currentUser?.id === id) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(LEGACY_USERNAME_KEY);
      applyAuthToken(null);
      set({ currentUser: null, users: [] });
      return;
    }
    await get().fetchUsers();
  },

  fetchStores: async () => {
    if (isSupabaseEnabled) {
      try {
        const res = await requireSupabaseProxy(() => axios.get(`${supabaseProxyBase}/stores`));
        set({ stores: ((res.data ?? []) as Store[]).map((store) => normalizeStore(store as Store)) });
      } catch (error) {
        console.error('fetchStores failed (Supabase proxy):', error);
        set({ stores: [] });
      }
      return;
    }

    try {
      const res = await axios.get('/api/stores');
      set({
        stores: (res.data ?? []).map((store: Store) => normalizeStore(store)),
      });
    } catch (error) {
      console.error('fetchStores failed (SQLite):', error);
      set({ stores: [] });
    }
  },

  addStore: async (storeData) => {
    ensureWarehouseEditAccess();
    if (isSupabaseEnabled) {
      const position = getNextStorePosition(get().stores);
      const payload = normalizeStore({
        ...storeData,
        position_x: position.position_x,
        position_y: 0,
        position_z: position.position_z,
        height: 3,
        rotation_y: 0,
      });

      await requireSupabaseProxy(() => axios.post(`${supabaseProxyBase}/stores`, payload));

      await get().fetchStores();
      return;
    }

    await axios.post('/api/stores', storeData);
    await get().fetchStores();
  },

  updateStore: async (name, data) => {
    ensureWarehouseEditAccess();
    const store = get().stores.find((item) => item.store_name === name);
    if (!store) return;

    const updated = normalizeStore({ ...store, ...data, store_name: store.store_name });

    if (isSupabaseEnabled) {
      await requireSupabaseProxy(() => axios.put(`${supabaseProxyBase}/stores/${encodeURIComponent(name)}`, updated));

      set((state) => ({
        stores: state.stores.map((item) => (item.store_name === name ? updated : item)),
      }));
      return;
    }

    await axios.put(`/api/stores/${name}`, updated);
    set((state) => ({
      stores: state.stores.map((item) => (item.store_name === name ? updated : item)),
    }));
  },

  deleteStore: async (name) => {
    ensureWarehouseEditAccess();
    try {
      if (isSupabaseEnabled) {
        await requireSupabaseProxy(() => axios.delete(`${supabaseProxyBase}/stores/${encodeURIComponent(name)}`));

        await get().fetchStores();
        return;
      }

      await axios.delete(`/api/stores/${name}`);
      await get().fetchStores();
    } catch (error: any) {
      console.error('Failed to delete store:', error.response?.data?.error || error.message);
      throw error;
    }
  },

  fetchBlankets: async () => {
    if (isSupabaseEnabled) {
      try {
        const res = await requireSupabaseProxy(() => axios.get(`${supabaseProxyBase}/blankets`));
        set({ blankets: (res.data ?? []) as Blanket[] });
      } catch (error) {
        console.error('fetchBlankets failed (Supabase proxy):', error);
        set({ blankets: [] });
      }
      return;
    }

    try {
      const res = await axios.get('/api/blankets');
      set({ blankets: res.data ?? [] });
    } catch (error) {
      console.error('fetchBlankets failed (SQLite):', error);
      set({ blankets: [] });
    }
  },

  addBlanket: async (blanket) => {
    ensureWarehouseEditAccess();
    if (isSupabaseEnabled) {
      const meta = createRequestMeta(blanket.notes);
      await requireSupabaseProxy(async () => {
        const res = await axios.post(`${supabaseProxyBase}/blankets`, {
          ...blanket,
          user: get().currentUser?.username || 'system',
          ...meta,
        });
        const inserted = (res.data?.blanket ?? null) as Blanket | null;
        if (inserted) {
          set((state) => ({
            blankets: [inserted, ...state.blankets.filter((item) => item.id !== inserted.id)],
          }));
        }
      });

      set({
        lastUsedStore: blanket.store,
        lastInsertedCell: { row: blanket.row, column: blanket.column },
      });
       localStorage.setItem('lastUsedStore', blanket.store);
       await get().fetchBlankets();
       await get().fetchLogs();
       tryVibrate(40);
       return;
     }

    await axios.post('/api/blankets', {
      ...blanket,
      user: get().currentUser?.username || 'system',
      ...createRequestMeta(blanket.notes),
    });
    set({
      lastUsedStore: blanket.store,
      lastInsertedCell: { row: blanket.row, column: blanket.column },
    });
    localStorage.setItem('lastUsedStore', blanket.store);
    await get().fetchBlankets();
    await get().fetchLogs();
    tryVibrate(40);
  },

  updateBlanket: async (id, data) => {
    ensureWarehouseEditAccess();
    if (isSupabaseEnabled) {
      await requireSupabaseProxy(async () => {
        const meta = createRequestMeta((data as any).notes);
        await axios.put(`${supabaseProxyBase}/blankets/${id}`, {
          ...data,
          user: get().currentUser?.username || 'system',
          ...meta,
        });
      });

      await get().fetchBlankets();
      await get().fetchLogs();
      return;
    }

    const { notes, ...updateData } = data as any;
    await axios.put(`/api/blankets/${id}`, {
      ...updateData,
      notes,
      user: get().currentUser?.username || 'system',
      ...createRequestMeta(notes),
    });
    await get().fetchBlankets();
    await get().fetchLogs();
  },

  deleteBlanket: async (id) => {
    ensureWarehouseEditAccess();
    if (isSupabaseEnabled) {
      await requireSupabaseProxy(async () => {
        const meta = createRequestMeta();
        await axios.delete(`${supabaseProxyBase}/blankets/${id}`, {
          data: { user: get().currentUser?.username || 'system', ...meta },
        });
      });

      await get().fetchBlankets();
      await get().fetchLogs();
      return;
    }

    await axios.delete(`/api/blankets/${id}`, {
      data: { user: get().currentUser?.username || 'system', ...createRequestMeta() },
    });
    await get().fetchBlankets();
    await get().fetchLogs();
  },

  fetchLogs: async (limit = 500) => {
    if (isSupabaseEnabled) {
      try {
        const res = await requireSupabaseProxy(() => axios.get(`${supabaseProxyBase}/logs`, { params: { limit } }));
        set({ logs: ((res.data ?? []) as Log[]).sort(sortLogsByTimestamp) });
      } catch (error) {
        console.error('fetchLogs failed (Supabase proxy):', error);
        set({ logs: [] });
      }
      return;
    }

    try {
      const res = await axios.get('/api/logs', { params: { limit } });
      set({ logs: ((res.data ?? []) as Log[]).sort(sortLogsByTimestamp) });
    } catch (error) {
      console.error('fetchLogs failed (SQLite):', error);
      set({ logs: [] });
    }
  },

  setSelectedStore: (name) => set({ selectedStore: name, selectedGridCell: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRetrievalMode: (mode) => set({ retrievalMode: mode }),
  setRetrievalIndex: (index) => set({ retrievalIndex: index }),
  setViewMode: (mode) => set({ viewMode: mode }),

  markAsPicked: async (blanket) => {
    ensurePickAccess();
    if (isSupabaseEnabled) {
      const meta = createRequestMeta();
      await requireSupabaseProxy(() =>
        axios.post(`${supabaseProxyBase}/blankets/${blanket.id}/pick`, {
          user: get().currentUser?.username || 'system',
          ...meta,
        })
      );

      await get().fetchBlankets();
      await get().fetchLogs();
      tryVibrate([70, 40, 70]);
      return;
    }

    await axios.post(`/api/blankets/${blanket.id}/pick`, {
      user: get().currentUser?.username || 'system',
      ...createRequestMeta(),
    });
    await get().fetchBlankets();
    await get().fetchLogs();
    tryVibrate([70, 40, 70]);
  },

  setLastUsedStore: (name) => {
    set({ lastUsedStore: name });
    if (name) localStorage.setItem('lastUsedStore', name);
  },

  setLastInsertedCell: (cell) => set({ lastInsertedCell: cell }),
  setGridFace: (face) => set({ gridFace: face }),
  setSelectedGridCell: (cell) => set({ selectedGridCell: cell }),
  setSearchImmersive: (value) => set({ searchImmersive: value }),
  clearSessionNotice: () => set({ sessionNotice: null }),
  });
});
