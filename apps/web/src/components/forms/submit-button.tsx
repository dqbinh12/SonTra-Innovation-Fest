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
      className="bg-primary text-primary-foreground inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {pending ? t('submitting') : t('submit')}
    </button>
  );
}
