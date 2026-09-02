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
    'border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm',
    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
    error && 'border-destructive',
  );

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
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
        <p id={errorId} className="text-destructive mt-1 text-sm">
          {t(error)}
        </p>
      )}
    </div>
  );
}

/** The hidden field that catches naive bots. Must stay out of the tab order. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website_url">Leave this field empty</label>
      <input id="website_url" name="website_url" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
