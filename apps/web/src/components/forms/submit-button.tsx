'use client';

import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';

export function SubmitButton() {
  const t = useTranslations('form');
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-60"
    >
      {pending ? t('submitting') : t('submit')}
    </button>
  );
}
