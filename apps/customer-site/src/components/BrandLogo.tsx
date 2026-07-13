import React from 'react';
import { SiteLanguage, localize } from '../lib/i18n';
import { cn } from '../lib/utils';

interface BrandLogoProps {
  language?: SiteLanguage;
  dark?: boolean;
  compact?: boolean;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  language = 'ar',
  dark = false,
  compact = false,
  showText = true,
  className = '',
  onClick,
}) => {
  const shellClass = cn('inline-flex items-center gap-3 text-start', className);
  const logoClass = compact
    ? 'h-11 w-auto max-w-[88px] md:h-12 md:max-w-[96px]'
    : 'h-12 w-auto max-w-[160px] md:h-16 md:max-w-[220px]';
  const content = (
    <>
      <span className={cn('inline-flex shrink-0 rounded-lg bg-white p-1 shadow-low ring-1 ring-black/5', dark && 'ring-white/12')}>
        <img
          src="/brand/logo-in-and-out-laundry.png"
          alt={localize(language, 'مصبغة إن آند آوت', 'In & Out Laundry')}
          className={cn(logoClass, 'object-contain')}
          loading="eager"
          decoding="async"
        />
      </span>
      {showText ? (
        <span className="min-w-0 leading-tight">
          <span className={cn('block truncate font-display text-base font-black md:text-lg', dark ? 'text-white' : 'text-primary')}>
            {localize(language, 'مصبغة إن آند آوت', 'In & Out Laundry')}
          </span>
          <span className={cn('block truncate text-[10px] font-bold uppercase tracking-[0.14em]', dark ? 'text-white/60' : 'text-muted-foreground')}>
            {localize(language, 'غسيل وكي وتوصيل', 'Laundry care')}
          </span>
        </span>
      ) : null}
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
