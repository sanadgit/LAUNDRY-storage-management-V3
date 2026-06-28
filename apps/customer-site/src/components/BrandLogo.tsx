import React from 'react';
import { Waves } from 'lucide-react';
import { SiteLanguage, localize } from '../lib/i18n';

interface BrandLogoProps {
  language?: SiteLanguage;
  dark?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  language = 'ar',
  dark = false,
  compact = false,
  className = '',
  onClick,
}) => {
  const textColor = dark ? 'text-white' : 'text-secondary';
  const subColor = dark ? 'text-white/55' : 'text-primary';
  const shellClass = `flex items-center gap-2 md:gap-3 ${className}`;
  const content = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-white/70 text-primary shadow-sm backdrop-blur md:h-12 md:w-12">
        <Waves size={24} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="text-left" dir="ltr">
          <span className={`block text-[16px] font-black leading-none tracking-normal md:text-[26px] ${textColor}`}>
            IN & OUT
          </span>
          <span className={`block text-[9px] font-black leading-none tracking-[0.38em] md:text-[16px] md:tracking-[0.45em] ${subColor}`}>
            LAUNDRY
          </span>
          <span className={`mt-1 hidden text-[9px] font-black leading-none tracking-normal sm:block ${subColor}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {localize(language, 'مصبغة جودة واتقان', 'Premium Laundry Care')}
          </span>
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${shellClass} cursor-pointer`} dir="ltr">
        {content}
      </button>
    );
  }

  return (
    <div className={shellClass} dir="ltr">
      {content}
    </div>
  );
};
