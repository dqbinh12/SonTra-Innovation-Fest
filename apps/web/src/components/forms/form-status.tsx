'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export function FormStatus({ status }: { status: 'success' | 'error' }) {
  const t = useTranslations('form');

  return (
    <p
      role="status"
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        status === 'success'
          ? 'border-border bg-secondary text-secondary-foreground'
          : 'border-destructive text-destructive',
      )}
    >
      {t(status)}
    </p>
  );
}
