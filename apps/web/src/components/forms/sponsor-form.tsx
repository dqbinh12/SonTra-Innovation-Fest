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
    <form action={action} className="relative w-full space-y-3 sm:space-y-3.5">
      <Honeypot />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Field name="company" label={t('company')} required error={state.fieldErrors?.company} />
        <Field
          name="contactName"
          label={t('contactName')}
          required
          error={state.fieldErrors?.contactName}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Field
          name="email"
          type="email"
          label={t('email')}
          required
          error={state.fieldErrors?.email}
        />
        <Field name="phone" type="tel" label={t('phone')} error={state.fieldErrors?.phone} />
      </div>
      <Field
        name="packageInterest"
        label={t('packageInterest')}
        error={state.fieldErrors?.packageInterest}
      />
      <Field name="message" label={t('message')} rows={3} error={state.fieldErrors?.message} />

      {state.status === 'error' && !state.fieldErrors && <FormStatus status="error" />}

      <div className="pt-1">
        <SubmitButton />
      </div>
    </form>
  );
}
