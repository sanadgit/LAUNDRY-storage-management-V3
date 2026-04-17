import { useStore } from '../store/useStore';
import { Package, CheckCircle, Clock, LayoutGrid, History, Search as SearchIcon, Plus, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { blankets, stores, logs } = useStore();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Blankets', value: blankets.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Stored', value: blankets.filter(b => b.status === 'stored').length, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Retrieved', value: blankets.filter(b => b.status === 'retrieved').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Picked', value: blankets.filter(b => b.status === 'picked').length, icon: History, color: 'bg-sky-500' },
    { label: 'Total Stores', value: stores.length, icon: LayoutGrid, color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Warehouse Dashboard</h1>
        <p className="text-slate-500 text-base sm:text-lg">Real-time overview of your blanket storage system.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-200`}>
                <Icon size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium text-sm uppercase tracking-wider">{stat.label}</span>
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <History className="text-blue-500" />
              Recent Activity
            </h2>
            <button onClick={() => navigate('/management')} className="text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-500 text-sm uppercase tracking-[0.2em]">
                  <th className="px-4 py-3">By User</th>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Store</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="bg-slate-50 border border-slate-100 rounded-3xl align-middle transition-colors hover:bg-slate-100">
                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{log.user || 'Unknown'}</td>
                    <td className="px-4 py-4 text-sm text-slate-700">#{log.blanket_number}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 hidden sm:table-cell">{log.store}</td>
                    <td className="px-4 py-4 text-sm text-slate-700 hidden sm:table-cell">{log.row},{log.column}</td>
                    <td className="px-4 py-4 text-sm capitalize text-slate-700">{log.status}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No recent activity found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <p className="text-blue-100 mb-8">Common tasks for warehouse workers.</p>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/management')}
                className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left font-semibold backdrop-blur-sm transition-all border border-white/10 flex items-center gap-3"
              >
                <Plus size={20} />
                Add New Blanket
              </button>
              <button 
                onClick={() => navigate('/search')}
                className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left font-semibold backdrop-blur-sm transition-all border border-white/10 flex items-center gap-3"
              >
                <SearchIcon size={20} />
                Start Search
              </button>
              <button 
                onClick={() => navigate('/management')}
                className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left font-semibold backdrop-blur-sm transition-all border border-white/10 flex items-center gap-3"
              >
                <Settings size={20} />
                Manage Stores
              </button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}
