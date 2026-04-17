import { create } from 'zustand';
import axios from 'axios';
import type { GridFace } from '../constants/virtualWarehouseGrid';
import {
  STORE_LOCAL_FOOTPRINT_DEPTH,
  STORE_LOCAL_FOOTPRINT_WIDTH,
} from '../constants/storeGeometry';
import { supabase, isSupabaseEnabled } from '../lib/supabaseClient';
import { toSupabaseUserEmail } from '../lib/userEmail';

const supabaseProxyBase = '/api/supabase';

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
  role: 'super-admin' | 'admin' | 'cashier';
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
  users: User[];
  currentUser: User | null;

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
  const defaultCellWidth = STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, columns);
  const defaultCellDepth = STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, rows);
  const cellWidth = Math.min(20, Math.max(0.1, Number((store as any).cell_width ?? defaultCellWidth) || defaultCellWidth));
  const cellDepth = Math.min(20, Math.max(0.1, Number((store as any).cell_depth ?? defaultCellDepth) || defaultCellDepth));

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
    cell_width: cellWidth,
    cell_depth: cellDepth,
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

export const useStore = create<AppState>((set, get) => ({
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
  users: [],
  currentUser: null,

  fetchUsers: async () => {
    try {
      const res = await axios.get('/api/users');
      const storedUsername = localStorage.getItem('currentUser');
      const users = Array.isArray(res.data)
        ? res.data as User[]
        : Array.isArray(res.data?.users)
          ? res.data.users as User[]
          : [];
      const active = storedUsername ? users.find((u) => u.username === storedUsername) ?? null : null;
      if (active && !active.is_active) {
        localStorage.removeItem('currentUser');
        set({ users, currentUser: null });
        return;
      }
      set({ users, currentUser: active });
    } catch (error) {
      console.error('fetchUsers failed:', error);
      set({ users: [], currentUser: null });
    }
  },

  loginUser: async (username, password) => {
    if (isSupabaseEnabled) {
      const profileRes = await axios.get('/api/users', { params: { username } });
      const userData = profileRes.data as User;
      const email = userData.email || toSupabaseUserEmail(username);

      if (!userData.is_active) {
        throw new Error('This user is inactive. Ask an administrator to reactivate the account.');
      }

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        throw authError;
      }

      if (!authData?.session) {
        throw new Error('Unable to sign in. Please verify your credentials.');
      }

      await axios.post(`/api/users/${userData.id}/touch-login`);

      localStorage.setItem('currentUser', userData.username);
      set({
        currentUser: {
          ...userData,
          last_login_at: new Date().toISOString(),
        },
      });
      await get().fetchUsers();
      return;
    }

    const res = await axios.post('/api/login', { username, password });
    const user = res.data as User;
    localStorage.setItem('currentUser', user.username);
    set({ currentUser: user });
  },

  logoutUser: async () => {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('currentUser');
    set({ currentUser: null });
  },

  addUser: async (user) => {
    await axios.post('/api/users', user);
    await get().fetchUsers();
  },

  updateUser: async (id, data) => {
    await axios.put(`/api/users/${id}`, data);
    if (get().currentUser?.id === id && data.username) {
      localStorage.setItem('currentUser', data.username);
    }
    await get().fetchUsers();
  },

  deleteUser: async (id) => {
    await axios.delete(`/api/users/${id}`);
    const state = get();
    if (state.currentUser?.id === id) {
      localStorage.removeItem('currentUser');
      set({ currentUser: null });
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
    const state = get();
    const store = state.stores.find((item) => item.store_name === blanket.store);
    const maxRows = store?.rows || 0;
    const autoSettle = store?.auto_settle !== false;
    const slotCapacity = Number(store?.slot_capacity ?? 1);
    // Auto-settle is only safe/meaningful when each (row,column) holds a single item.
    // For folding shelves (slot_capacity > 1), shifting rows can cause out-of-bounds/capacity conflicts.
    const canAutoSettle = autoSettle && slotCapacity <= 1 && store?.store_type !== 'hanger';

    if (canAutoSettle) {
      const storedInColumn = state.blankets
        .filter(
          (item) =>
            item.store === blanket.store &&
            item.column === blanket.column &&
            item.status === 'stored' &&
            item.id !== blanket.id
        )
        .sort((a, b) => a.row - b.row);

      if (maxRows > 0 && storedInColumn.length > 0) {
        const startRow = maxRows - storedInColumn.length + 1;
        for (let index = 0; index < storedInColumn.length; index += 1) {
          const currentBlanket = storedInColumn[index];
          const targetRow = startRow + index;
          if (currentBlanket.row !== targetRow) {
            if (isSupabaseEnabled) {
              const meta = createRequestMeta();
              await requireSupabaseProxy(() =>
                axios.put(`${supabaseProxyBase}/blankets/${currentBlanket.id}`, {
                  row: targetRow,
                  user: get().currentUser?.username || 'system',
                  ...meta,
                })
              );
            } else {
              const meta = createRequestMeta();
              await axios.put(`/api/blankets/${currentBlanket.id}`, {
                ...currentBlanket,
                row: targetRow,
                user: get().currentUser?.username || 'system',
                ...meta,
              });
            }
          }
        }
      }
    }

    if (isSupabaseEnabled) {
      const meta = createRequestMeta();
      await requireSupabaseProxy(() =>
        axios.put(`${supabaseProxyBase}/blankets/${blanket.id}`, {
          status: 'picked',
          user: get().currentUser?.username || 'system',
          ...meta,
        })
      );

      await get().fetchBlankets();
      await get().fetchLogs();
      tryVibrate([70, 40, 70]);
      return;
    }

    await axios.put(`/api/blankets/${blanket.id}`, {
      ...blanket,
      status: 'picked',
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
}));
