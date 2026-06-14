import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { academyData } from '../lib/trainingAcademyData';
import {
  readTranslationOverrides,
  t,
  trainingLanguages,
  type TrainingLanguage,
  type TranslationOverride,
  writeTranslationOverrides,
} from '../lib/trainingI18n';
import { LanguageSelector } from '../components/training-academy/LanguageSelector';

const translationTargets = trainingLanguages.filter((language) => language.code !== 'en');

export default function TrainingTranslationsPage() {
  const [language, setLanguage] = useState<TrainingLanguage>('en');
  const seeds = useMemo(() => {
    const sourceTexts = [
      ...academyData.modules.map((module) => module.title),
      ...academyData.sops.map((sop) => sop.title),
      ...academyData.checklists.map((checklist) => checklist.title),
      ...academyData.incidents.map((incident) => incident.title),
      'No scan, no movement',
      'People first, garments second',
      'Count, inspect, record, confirm',
    ];
    return sourceTexts.slice(0, 80);
  }, []);
  const [overrides, setOverrides] = useState<Record<string, TranslationOverride>>(() => {
    const stored = readTranslationOverrides();
    const seeded = { ...stored };
    for (const source of seeds) {
      seeded[source] ??= { key: source, source, translations: {}, reviewed: false };
    }
    return seeded;
  });

  const updateTranslation = (source: string, targetLanguage: TrainingLanguage, value: string) => {
    setOverrides((current) => ({
      ...current,
      [source]: {
        ...(current[source] ?? { key: source, source, translations: {} }),
        translations: {
          ...(current[source]?.translations ?? {}),
          [targetLanguage]: value,
        },
      },
    }));
  };

  const toggleReviewed = (source: string) => {
    setOverrides((current) => ({
      ...current,
      [source]: {
        ...(current[source] ?? { key: source, source, translations: {} }),
        reviewed: !current[source]?.reviewed,
      },
    }));
  };

  const save = () => writeTranslationOverrides(overrides);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-6">
        <header className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link to="/training-academy" className="inline-flex items-center gap-2 text-sm font-black text-[#A23EFB]">
                <ArrowLeft size={17} />
                Back to academy
              </Link>
              <h1 className="mt-3 text-4xl font-black">{t(language, 'translations')}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">Admin translation management for training module titles, SOP titles, checklists, and key safety phrases.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LanguageSelector language={language} onChange={setLanguage} />
              <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                <Save size={18} />
                {t(language, 'save')}
              </button>
            </div>
          </div>
        </header>

        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-xl shadow-slate-200/70">
          <div className="grid min-w-[70rem] grid-cols-[2fr_repeat(4,1.3fr)_8rem] bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white">
            <div>{t(language, 'originalEnglish')}</div>
            {translationTargets.map((target) => (
              <div key={target.code}>{target.nativeLabel}</div>
            ))}
            <div>{t(language, 'reviewed')}</div>
          </div>
          <div className="max-h-[70vh] min-w-[70rem] overflow-y-auto">
            {Object.values(overrides).map((row) => (
              <div key={row.source} className="grid grid-cols-[2fr_repeat(4,1.3fr)_8rem] gap-3 border-b border-slate-100 p-4">
                <div className="text-sm font-bold leading-6 text-slate-700">{row.source}</div>
                {translationTargets.map((target) => (
                  <textarea
                    key={target.code}
                    value={row.translations[target.code] ?? ''}
                    onChange={(event) => updateTranslation(row.source, target.code, event.target.value)}
                    placeholder={target.nativeLabel}
                    className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold outline-none focus:border-[#A23EFB]"
                    dir={target.dir}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => toggleReviewed(row.source)}
                  className={`grid size-12 place-items-center self-start rounded-2xl border ${row.reviewed ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-400'}`}
                >
                  <CheckCircle2 size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
