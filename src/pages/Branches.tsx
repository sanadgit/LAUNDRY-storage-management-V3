import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Building2, MapPin, Phone, Plus, RefreshCcw, Save, Store, Users, Activity, PackageCheck } from 'lucide-react';
import { useStore, type Branch } from '../store/useStore';

type BranchDashboardSummary = {
  branch: Branch;
  metrics: {
    stores: number;
    users: number;
    active_users: number;
    stored_orders: number;
    picked_orders: number;
    retrieved_orders: number;
    total_orders: number;
    capacity: number;
    utilization: number;
    activity_events: number;
  };
  top_users: Array<{ username: string; count: number }>;
  recent_activity: Array<{ id: number; blanket_number: string; action: string; user: string; store: string; timestamp: string }>;
};

type DashboardResponse = {
  branches: BranchDashboardSummary[];
  totals: {
    stores: number;
    users: number;
    active_users: number;
    stored_orders: number;
    picked_orders: number;
    total_orders: number;
    capacity: number;
    activity_events: number;
  };
};

const emptyBranchForm: Omit<Branch, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  city: '',
  trade_license: '',
  phone: '',
  address: '',
  status: 'active',
  notes: '',
};

const metricCards = [
  { key: 'stored_orders', label: 'Stored Orders', icon: Store, color: 'text-blue-700 bg-blue-50 border-blue-100' },
  { key: 'picked_orders', label: 'Picked Orders', icon: PackageCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  { key: 'stores', label: 'Stores', icon: Building2, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
  { key: 'active_users', label: 'Active Users', icon: Users, color: 'text-amber-700 bg-amber-50 border-amber-100' },
] as const;

export default function BranchesPage() {
  const { branches, fetchBranches, addBranch, updateBranch, currentUser } = useStore();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | 'all'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyBranchForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = currentUser?.role === 'super-admin' || currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const loadDashboard = async () => {
    const params = selectedBranchId === 'all' ? {} : { branch_id: selectedBranchId };
    const response = await axios.get<DashboardResponse>('/api/branches/dashboard', { params });
    setDashboard(response.data);
  };

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    void loadDashboard().catch((loadError) => {
      setError(loadError?.response?.data?.error || loadError?.message || 'Failed to load branch dashboard.');
    });
  }, [selectedBranchId]);

  const selectedSummary = useMemo(() => {
    if (!dashboard?.branches.length) return null;
    if (selectedBranchId === 'all') return dashboard.branches[0] ?? null;
    return dashboard.branches.find((item) => item.branch.id === selectedBranchId) ?? null;
  }, [dashboard, selectedBranchId]);

  const totals = dashboard?.totals;

  const startNew = () => {
    setEditingId(null);
    setForm(emptyBranchForm);
    setError(null);
  };

  const startEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      city: branch.city,
      trade_license: branch.trade_license || '',
      phone: branch.phone || '',
      address: branch.address || '',
      status: branch.status,
      notes: branch.notes || '',
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    if (!form.name.trim()) {
      setError('Branch name is required.');
      return;
    }
    try {
      setBusy(true);
      setError(null);
      if (editingId) await updateBranch(editingId, form);
      else await addBranch(form);
      startNew();
      await loadDashboard();
    } catch (saveError: any) {
      setError(saveError?.response?.data?.error || saveError?.message || 'Failed to save branch.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Multi Branch Control</div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Branch</h1>
            <div className="mt-1 text-sm font-bold text-slate-500">إدارة الفروع، المستخدمين، الاستورات، ومؤشرات التشغيل.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedBranchId}
              onChange={(event) => setSelectedBranchId(event.target.value === 'all' ? 'all' : Number(event.target.value))}
              className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800"
              title="Branch filter"
            >
              <option value="all">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const value = totals ? totals[card.key] : 0;
            return (
              <div key={card.key} className={`rounded-3xl border p-5 ${card.color}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-widest opacity-80">{card.label}</div>
                  <Icon size={22} />
                </div>
                <div className="mt-4 text-3xl font-black text-slate-950">{value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Branch Health</div>
                  <div className="mt-1 text-sm font-bold text-slate-500">
                    {selectedSummary?.branch.name || 'All branches'} operational snapshot.
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Utilization</div>
                  <div className="text-2xl font-black">{selectedSummary?.metrics.utilization ?? 0}%</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{selectedSummary?.metrics.capacity ?? totals?.capacity ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{selectedSummary?.metrics.activity_events ?? totals?.activity_events ?? 0}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Orders</div>
                  <div className="mt-1 text-xl font-black text-slate-950">{selectedSummary?.metrics.total_orders ?? totals?.total_orders ?? 0}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {(dashboard?.branches ?? []).map((summary) => (
                <div key={summary.branch.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xl font-black text-slate-950">{summary.branch.name}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500">
                        <MapPin size={15} />
                        {summary.branch.city || '-'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(summary.branch)}
                      disabled={!canEdit}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stores</div>
                      <div className="mt-1 text-lg font-black text-slate-900">{summary.metrics.stores}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Users</div>
                      <div className="mt-1 text-lg font-black text-slate-900">{summary.metrics.active_users}/{summary.metrics.users}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Top active users</div>
                    <div className="space-y-1.5">
                      {summary.top_users.length > 0 ? summary.top_users.map((user) => (
                        <div key={user.username} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold">
                          <span>{user.username}</span>
                          <span className="text-blue-700">{user.count}</span>
                        </div>
                      )) : <div className="text-xs font-bold text-slate-400">No activity yet.</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
                {editingId ? 'Edit Branch' : 'New Branch'}
              </div>
              <button
                type="button"
                onClick={startNew}
                disabled={!canEdit}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
              >
                <Plus size={14} />
                New
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Branch name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
              />
              <input
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                placeholder="City"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
              />
              <input
                value={form.trade_license || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, trade_license: event.target.value }))}
                placeholder="Trade license"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
              />
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.phone || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Phone"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-bold text-slate-900"
                />
              </div>
              <textarea
                value={form.address || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Address"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
              />
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as Branch['status'] }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
                title="Branch status"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <textarea
                value={form.notes || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Notes"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900"
              />
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!canEdit || busy}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 text-sm font-black text-white disabled:bg-slate-300"
              >
                <Save size={17} />
                {busy ? 'Saving...' : 'Save Branch'}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Activity size={15} />
                SaaS Scope
              </div>
              <div className="mt-2 text-sm font-bold leading-6 text-slate-600">
                كل الاستورات والمستخدمين يمكن ربطهم بفرع. هذا يمهد لفصل الطلبات والتقارير حسب الفرع الحالي.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
