import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-hover text-white shadow-[0_16px_34px_rgba(140,35,112,0.24)] hover:shadow-[0_20px_44px_rgba(140,35,112,0.30)] active:bg-primary-active',
  secondary:
    'border border-white/70 bg-white/64 text-foreground shadow-low backdrop-blur-2xl hover:border-primary/30 hover:bg-white hover:text-primary active:bg-muted dark:border-white/10 dark:bg-surface/70',
  ghost:
    'bg-transparent text-foreground hover:bg-muted active:bg-muted/80',
  destructive:
    'bg-danger text-white shadow-low hover:bg-danger/90 active:bg-danger/80',
  accent:
    'bg-secondary text-white shadow-[0_14px_34px_rgba(166,83,144,0.24)] hover:bg-primary active:bg-primary-active',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
  icon: 'size-11 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-bold transition duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 motion-reduce:transition-none motion-reduce:transform-none hover:-translate-y-0.5 [&_[data-icon]]:size-4',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 data-icon="inline-start" className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
