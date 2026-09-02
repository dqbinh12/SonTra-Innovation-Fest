'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitSponsorApplication } from '@/lib/actions';
import { initialFormState } from '@/lib/form-state';
import { Field, Honeypot } from './field';
import { SubmitButton } from './submit-button';
import { FormStatus } from './form-status';

export function SponsorForm() {
  const t = useTranslations('form');
  const [state, action] = useActionState(submitSponsorApplication, initialFormState);

  if (state.status === 'success') return <FormStatus status="success" />;

  return (
    <form action={action} className="relative max-w-xl space-y-6">
      <Honeypot />

      <Field name="company" label={t('company')} required error={state.fieldErrors?.company} />
      <Field
        name="contactName"
        label={t('contactName')}
        required
        error={state.fieldErrors?.contactName}
      />
      <Field
        name="email"
        type="email"
        label={t('email')}
        required
        error={state.fieldErrors?.email}
      />
      <Field name="phone" type="tel" label={t('phone')} error={state.fieldErrors?.phone} />
      <Field
        name="packageInterest"
        label={t('packageInterest')}
        error={state.fieldErrors?.packageInterest}
      />
      <Field name="message" label={t('message')} rows={5} error={state.fieldErrors?.message} />

      {state.status === 'error' && !state.fieldErrors && <FormStatus status="error" />}

      <SubmitButton />
    </form>
  );
}
