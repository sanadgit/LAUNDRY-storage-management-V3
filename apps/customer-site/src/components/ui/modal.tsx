import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from './button';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, title, description, children, footer, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onOpenChange, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-secondary/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-high',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id="modal-title" className="text-xl font-bold leading-8 text-foreground">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close dialog">
            <X data-icon="inline-start" aria-hidden="true" />
          </Button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="flex items-center justify-end gap-3 border-t border-border p-5">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}

export function Drawer({ className, ...props }: ModalProps) {
  return (
    <Modal
      {...props}
      className={cn(
        'mt-auto max-h-[86vh] max-w-none rounded-b-none sm:mt-0 sm:max-w-lg sm:rounded-xl',
        className,
      )}
    />
  );
}
