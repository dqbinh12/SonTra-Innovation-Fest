'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface FieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel';
  rows?: number;
}

/**
 * A labelled input or textarea. `error` is a message key from the server
 * action, translated here through the `form.*` namespace.
 */
export function Field({ name, label, error, required, type = 'text', rows }: FieldProps) {
  const t = useTranslations('form');
  const errorId = `${name}-error`;

  const className = cn(
    'border-input bg-background text-foreground mt-1.5 w-full rounded-xl border px-3.5 py-2.5 sm:py-3 text-sm',
    'placeholder:text-muted-foreground transition-all duration-200 hover:border-ring/40',
    'focus:border-ring focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ring)_10%,transparent)]',
    'focus-visible:outline-none focus-visible:ring-0',
    error && 'border-destructive focus:border-destructive',
  );

  return (
    <div>
      <label
        htmlFor={name}
        className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase"
      >
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>

      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={className}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={className}
        />
      )}

      {error && (
        <p id={errorId} className="text-destructive mt-1 text-xs sm:text-sm">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export function Honeypot() {
  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor="website">Do not fill this</label>
      <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
