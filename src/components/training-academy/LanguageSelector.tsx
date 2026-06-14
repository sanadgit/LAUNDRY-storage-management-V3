import { trainingLanguages, type TrainingLanguage, t } from '../../lib/trainingI18n';

export function LanguageSelector({
  language,
  onChange,
}: {
  language: TrainingLanguage;
  onChange: (language: TrainingLanguage) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
      <span className="hidden sm:inline">{t(language, 'language')}</span>
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as TrainingLanguage)}
        className="bg-transparent text-sm font-black outline-none"
      >
        {trainingLanguages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.flag} {item.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
