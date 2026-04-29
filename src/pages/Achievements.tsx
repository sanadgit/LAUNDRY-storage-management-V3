import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Loader2, Medal, Sparkles, Target } from 'lucide-react';
import { useStore } from '../store/useStore';

type IroningSummary = {
  total_pieces: number;
  total_starts: number;
  unique_orders: number;
};

type IroningUserSummary = {
  user: string;
  total_pieces: number;
  total_starts: number;
  unique_orders: number;
};

type IroningRecentEvent = {
  id: number;
  order_no: string;
  item_name: string | null;
  qty: number;
  user: string;
  request_id: string | null;
  timestamp: string;
};

type IroningAchievementsResponse = {
  scope: 'me' | 'all';
  period: 'today' | 'week' | 'month';
  viewer: string | null;
  summary: IroningSummary;
  by_user: IroningUserSummary[];
  recent: IroningRecentEvent[];
};

export default function AchievementsPage() {
  const { currentUser } = useStore();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [scope, setScope] = useState<'me' | 'all'>('me');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IroningAchievementsResponse | null>(null);

  const canViewAll = useMemo(() => {
    const role = String(currentUser?.role ?? '').toLowerCase();
    return role === 'super-admin' || role === 'admin' || role === 'manager' || role === 'branch-manager';
  }, [currentUser?.role]);

  useEffect(() => {
    if (!canViewAll && scope !== 'me') setScope('me');
  }, [canViewAll, scope]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setBusy(true);
        setError(null);
        const response = await axios.get<IroningAchievementsResponse>('/api/achievements/ironing', {
          params: { period, scope: canViewAll ? scope : 'me' },
        });
        if (!cancelled) setData(response.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || 'Failed to load achievements.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [period, scope, canViewAll]);

  const summary = data?.summary ?? { total_pieces: 0, total_starts: 0, unique_orders: 0 };

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black">Performance</div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">إنجازات الكي والتعبئة</h1>
            <p className="mt-2 text-sm text-slate-600 font-medium">
              متابعة عدد بدايات الكي، عدد القطع التي تم كيّها، وعدد الطلبات التي تم العمل عليها.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'today' | 'week' | 'month')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700"
              title="Period"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
            {canViewAll && (
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as 'me' | 'all')}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700"
                title="Scope"
              >
                <option value="me">My stats</option>
                <option value="all">All users</option>
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
              <Sparkles size={12} /> Starts
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.total_starts}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
              <Target size={12} /> Ironed Pieces
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.total_pieces}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
              <Medal size={12} /> Orders
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{summary.unique_orders}</div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="text-slate-800 font-black">By User</div>
        {busy && !data ? (
          <div className="text-sm text-slate-500 font-semibold inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr className="text-left">
                  <th className="px-3 py-2 font-black uppercase tracking-wider">User</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Starts</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Pieces</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Orders</th>
                </tr>
              </thead>
              <tbody>
                {(data?.by_user ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500 font-semibold">
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  (data?.by_user ?? []).map((row) => (
                    <tr key={row.user} className="border-t border-slate-200">
                      <td className="px-3 py-2 font-black text-slate-900">{row.user}</td>
                      <td className="px-3 py-2 text-slate-700 font-semibold">{row.total_starts}</td>
                      <td className="px-3 py-2 text-slate-700 font-semibold">{row.total_pieces}</td>
                      <td className="px-3 py-2 text-slate-700 font-semibold">{row.unique_orders}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="text-slate-800 font-black">Recent Ironing Starts</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr className="text-left">
                <th className="px-3 py-2 font-black uppercase tracking-wider">Time</th>
                <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                <th className="px-3 py-2 font-black uppercase tracking-wider">Item</th>
                <th className="px-3 py-2 font-black uppercase tracking-wider">Qty</th>
                <th className="px-3 py-2 font-black uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500 font-semibold">
                    No events yet.
                  </td>
                </tr>
              ) : (
                (data?.recent ?? []).map((event) => (
                  <tr key={event.id} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-slate-700 font-semibold">{event.timestamp}</td>
                    <td className="px-3 py-2 font-black text-slate-900">{event.order_no}</td>
                    <td className="px-3 py-2 text-slate-700 font-semibold">{event.item_name || '-'}</td>
                    <td className="px-3 py-2 text-slate-700 font-semibold">{event.qty}</td>
                    <td className="px-3 py-2 text-slate-700 font-semibold">{event.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

