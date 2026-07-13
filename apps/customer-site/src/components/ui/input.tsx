import React from 'react';
import { cn } from '@/src/lib/utils';

interface FieldProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, FieldProps {}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

const fieldShell =
  'flex min-w-0 flex-col gap-2 text-right ltr:text-left';
const labelClass =
  'text-xs font-bold text-foreground';
const controlClass =
  'min-h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-flat transition duration-fast placeholder:text-muted-foreground focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-55 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20 motion-reduce:transition-none';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, id, label, helperText, error, required, 'aria-describedby': describedBy, ...props }, ref) => {
    const inputId = id || React.useId();
    const messageId = `${inputId}-message`;
    const hasMessage = Boolean(error || helperText);

    return (
      <div className={fieldShell} data-invalid={error ? '' : undefined}>
        {label ? (
          <label htmlFor={inputId} className={labelClass}>
            {label}
            {required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(controlClass, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : describedBy}
          required={required}
          {...props}
        />
        {hasMessage ? (
          <p id={messageId} className={cn('text-xs leading-5', error ? 'text-danger' : 'text-muted-foreground')}>
            {error || helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, label, helperText, error, required, 'aria-describedby': describedBy, ...props }, ref) => {
    const inputId = id || React.useId();
    const messageId = `${inputId}-message`;
    const hasMessage = Boolean(error || helperText);

    return (
      <div className={fieldShell} data-invalid={error ? '' : undefined}>
        {label ? (
          <label htmlFor={inputId} className={labelClass}>
            {label}
            {required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(controlClass, 'min-h-24 resize-y py-3 leading-7', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : describedBy}
          required={required}
          {...props}
        />
        {hasMessage ? (
          <p id={messageId} className={cn('text-xs leading-5', error ? 'text-danger' : 'text-muted-foreground')}>
            {error || helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
