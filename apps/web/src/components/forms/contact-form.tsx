'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitContact } from '@/lib/actions';
import { initialFormState } from '@/lib/form-state';
import { Field, Honeypot } from './field';
import { SubmitButton } from './submit-button';
import { FormStatus } from './form-status';

export function ContactForm() {
  const t = useTranslations('form');
  const [state, action] = useActionState(submitContact, initialFormState);

  if (state.status === 'success') return <FormStatus status="success" />;

  return (
    <form action={action} className="relative w-full space-y-3 sm:space-y-4">
      <Honeypot />

      <Field name="name" label={t('name')} required error={state.fieldErrors?.name} />
      <Field
        name="email"
        type="email"
        label={t('email')}
        required
        error={state.fieldErrors?.email}
      />
      <Field
        name="message"
        label={t('message')}
        rows={3}
        required
        error={state.fieldErrors?.message}
      />

      {state.status === 'error' && !state.fieldErrors && <FormStatus status="error" />}

      <div className="pt-1">
        <SubmitButton />
      </div>
    </form>
  );
}
