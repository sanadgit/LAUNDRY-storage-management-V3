import { useMemo, useState } from 'react';
import { Bookmark, Filter, Printer, Search } from 'lucide-react';
import { cn } from '../../lib/cn';
import { MarkdownRenderer } from './MarkdownRenderer';
import { type SopItem, type TrainingProgress } from '../../lib/trainingAcademyData';
import { t, translateContent, type TrainingLanguage } from '../../lib/trainingI18n';

export function SOPViewer({
  sops,
  progress,
  onProgressChange,
  language,
}: {
  sops: SopItem[];
  progress: TrainingProgress;
  onProgressChange: (progress: TrainingProgress) => void;
  language: TrainingLanguage;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [openId, setOpenId] = useState(sops[0]?.id ?? '');
  const categories = ['All', ...Array.from(new Set(sops.map((item) => item.category)))];
  const filtered = useMemo(
    () =>
      sops.filter((item) => {
        const matchesQuery = `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'All' || item.category === category;
        return matchesQuery && matchesCategory;
      }),
    [category, query, sops]
  );

  const toggleFavorite = (id: string) => {
    const favoriteSops = progress.favoriteSops.includes(id)
      ? progress.favoriteSops.filter((item) => item !== id)
      : [...progress.favoriteSops, id];
    onProgressChange({ ...progress, favoriteSops });
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950">{t(language, 'sopLibrary')}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Searchable operational SOP database generated from the training files.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(language, 'search')} className="bg-transparent outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500">
              <Filter size={18} />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent font-black outline-none">
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === 'All' ? t(language, 'allDepartments') : item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((sop) => {
          const open = openId === sop.id;
          const favorite = progress.favoriteSops.includes(sop.id);
          return (
            <article key={sop.id} className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200/60">
              <div className="flex items-start justify-between gap-3 p-5">
                <button type="button" onClick={() => setOpenId(open ? '' : sop.id)} className="min-w-0 text-start">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{sop.category}</span>
                    <span className={cn('rounded-full px-3 py-1 text-xs font-black', sop.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-[#F1E6FF] text-[#A23EFB]')}>
                      {sop.priority}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-black text-slate-950">{sop.title}</h3>
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => toggleFavorite(sop.id)} className={cn('grid size-10 place-items-center rounded-2xl border', favorite ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-slate-200 bg-white text-slate-400')}>
                    <Bookmark size={18} fill={favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button type="button" onClick={() => window.print()} className="grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500">
                    <Printer size={18} />
                  </button>
                </div>
              </div>
              {open && (
                <div className="border-t border-slate-100 p-5">
                  <MarkdownRenderer markdown={translateContent(sop.body, language)} compact />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
