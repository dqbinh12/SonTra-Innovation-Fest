'use server';

import { z } from 'zod';
import { StrapiError, strapiSubmit } from './strapi';
import type { ErrorKey, FormState } from './form-state';

const required = z.string().trim().min(1, 'required');
const optional = z
  .string()
  .trim()
  .transform((value) => value || null);
const email = z.string().trim().min(1, 'required').pipe(z.email('invalidEmail'));

const contactSchema = z.object({
  name: required,
  email,
  message: required,
});

const sponsorSchema = z.object({
  company: required,
  contactName: required,
  email,
  phone: optional,
  packageInterest: optional,
  message: optional,
});

/**
 * Hidden field a human never sees and never fills. A bot that fills every
 * input trips it, and we drop the submission while reporting success so the
 * bot has nothing to tune against.
 *
 * This is a speed bump, not spam protection — see docs/cms-schema.md.
 */
const HONEYPOT_FIELD = 'website_url';

function isBot(formData: FormData): boolean {
  return String(formData.get(HONEYPOT_FIELD) ?? '').trim().length > 0;
}

function toFieldErrors(error: z.ZodError): FormState {
  const fieldErrors: Record<string, ErrorKey> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === 'string' && !fieldErrors[field]) {
      fieldErrors[field] = issue.message as ErrorKey;
    }
  }

  return { status: 'error', fieldErrors };
}

async function submit(
  path: string,
  schema: z.ZodType,
  formData: FormData,
): Promise<FormState> {
  if (isBot(formData)) return { status: 'success' };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);

  try {
    await strapiSubmit(path, parsed.data as Record<string, unknown>);
    return { status: 'success' };
  } catch (error) {
    // The visitor sees a generic failure; the detail goes to the server log.
    console.error(
      `[form] ${path} submission failed:`,
      error instanceof StrapiError ? `${error.status} ${error.message}` : error,
    );
    return { status: 'error' };
  }
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  return submit('contact-submissions', contactSchema, formData);
}

export async function submitSponsorApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return submit('sponsor-applications', sponsorSchema, formData);
}
