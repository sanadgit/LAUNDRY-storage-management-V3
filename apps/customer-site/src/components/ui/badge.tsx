import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withIcon?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-muted text-foreground',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/25 bg-warning/10 text-warning',
  danger: 'border-danger/25 bg-danger/10 text-danger',
  info: 'border-info/25 bg-info/10 text-info',
  accent: 'border-accent/25 bg-accent/10 text-accent',
};

const icons = {
  neutral: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  accent: Info,
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', withIcon = false, children, ...props }, ref) => {
    const Icon = icons[variant];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex min-h-6 items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-bold leading-5 [&_[data-icon]]:size-3.5',
          variants[variant],
          className,
        )}
        {...props}
      >
        {withIcon ? <Icon data-icon="inline-start" aria-hidden="true" /> : null}
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
