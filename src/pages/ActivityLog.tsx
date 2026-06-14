import { useEffect, useMemo, useState } from 'react';
import { Download, Filter, History, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useStore } from '../store/useStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ActivityLogPage() {
  const { logs, fetchLogs } = useStore();
  const [activityQuery, setActivityQuery] = useState('');
  const [activityAction, setActivityAction] = useState('all');
  const [activityUser, setActivityUser] = useState('all');
  const [activityStore, setActivityStore] = useState('all');
  const [activityFrom, setActivityFrom] = useState('');
  const [activityTo, setActivityTo] = useState('');
  const [activityLimit, setActivityLimit] = useState(500);

  useEffect(() => {
    void fetchLogs(activityLimit);
  }, [activityLimit, fetchLogs]);

  const activityActionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(String(log.action ?? ''));
    return Array.from(set).filter(Boolean).sort();
  }, [logs]);

  const activityUserOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(String(log.user ?? ''));
    return Array.from(set).filter(Boolean).sort();
  }, [logs]);

  const activityStoreOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(String(log.store ?? ''));
    return Array.from(set).filter(Boolean).sort();
  }, [logs]);

  const filteredActivityLogs = useMemo(() => {
    const query = activityQuery.trim().toLowerCase();
    const fromTime = activityFrom ? new Date(`${activityFrom}T00:00:00`).getTime() : null;
    const toTime = activityTo ? new Date(`${activityTo}T23:59:59.999`).getTime() : null;

    return logs.filter((log) => {
      if (activityAction !== 'all' && log.action !== activityAction) return false;
      if (activityUser !== 'all' && log.user !== activityUser) return false;
      if (activityStore !== 'all' && log.store !== activityStore) return false;

      const time = new Date(log.timestamp).getTime();
      if (fromTime != null && time < fromTime) return false;
      if (toTime != null && time > toTime) return false;

      if (!query) return true;
      const haystack = [
        log.blanket_number,
        log.action,
        log.user,
        log.store,
        log.status,
        log.notes,
        log.request_id,
        log.ip,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [logs, activityAction, activityFrom, activityQuery, activityStore, activityTo, activityUser]);

  const exportActivityCsv = () => {
    const escapeCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const header = [
      'id',
      'timestamp',
      'blanket_number',
      'action',
      'user',
      'store',
      'row',
      'column',
      'status',
      'request_id',
      'device',
      'ip',
      'notes',
    ];
    const rows = filteredActivityLogs.map((log) => [
      log.id,
      log.timestamp,
      log.blanket_number,
      log.action,
      log.user,
      log.store,
      log.row,
      log.column,
      log.status,
      log.request_id,
      log.device,
      log.ip,
      log.notes,
    ]);

    const csv = [header.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <History className="text-blue-500" />
              Activity Log
            </h1>
            <p className="text-sm text-slate-500 mt-2">Filter, search, and export warehouse log events.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchLogs(activityLimit)}
              className="px-4 py-2.5 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportActivityCsv}
              className="px-4 py-2.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Filter size={14} />
              Search
            </label>
            <input
              value={activityQuery}
              onChange={(e) => setActivityQuery(e.target.value)}
              placeholder="Blanket/user/store/request/notes..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Action</label>
            <select
              value={activityAction}
              onChange={(e) => setActivityAction(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
            >
              <option value="all">All</option>
              {activityActionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">User</label>
            <select
              value={activityUser}
              onChange={(e) => setActivityUser(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
            >
              <option value="all">All</option>
              {activityUserOptions.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Store</label>
            <select
              value={activityStore}
              onChange={(e) => setActivityStore(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
            >
              <option value="all">All</option>
              {activityStoreOptions.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">From</label>
            <input
              type="date"
              value={activityFrom}
              onChange={(e) => setActivityFrom(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">To</label>
            <input
              type="date"
              value={activityTo}
              onChange={(e) => setActivityTo(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-sm text-slate-500 font-semibold">
            Showing <span className="text-slate-900 font-black">{filteredActivityLogs.length}</span> of{' '}
            <span className="text-slate-900 font-black">{logs.length}</span> loaded logs
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Load</span>
            {[500, 1000].map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => setActivityLimit(limit)}
                className={cn(
                  'px-4 py-2 rounded-2xl font-bold transition-all border',
                  activityLimit === limit
                    ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                )}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Blanket</th>
                <th className="px-6 py-4 hidden md:table-cell">Store</th>
                <th className="px-6 py-4 hidden lg:table-cell">Pos</th>
                <th className="px-6 py-4 hidden md:table-cell">Status</th>
                <th className="px-6 py-4 hidden lg:table-cell">Request</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{log.user || 'system'}</td>
                  <td className="px-6 py-4 text-sm font-black text-slate-900">#{log.blanket_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 hidden md:table-cell">{log.store ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 hidden lg:table-cell tabular-nums">
                    {log.row != null && log.column != null ? `${log.row},${log.column}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 hidden md:table-cell">{log.status ?? '-'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell font-mono">
                    {log.request_id ? String(log.request_id).slice(0, 8) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {log.notes ? String(log.notes) : <span className="text-slate-300">-</span>}
                  </td>
                </tr>
              ))}
              {filteredActivityLogs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No log entries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
