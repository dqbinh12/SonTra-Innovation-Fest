'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/layout/container';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error');

  return (
    <Container className="py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">{t('genericTitle')}</h1>
      <p className="text-muted-foreground mt-4">{t('genericBody')}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-primary-foreground mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-semibold"
      >
        {t('retry')}
      </button>
    </Container>
  );
}
