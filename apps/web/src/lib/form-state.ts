/**
 * Shared between the server actions and the form components.
 *
 * This lives outside lib/actions.ts because a `'use server'` module may only
 * export async functions — exporting the constant below from there is a
 * runtime error, not just a lint warning.
 */

/**
 * Error keys, not sentences: the server action does not know the request
 * locale, so the form component translates these through `form.*` messages.
 */
export type ErrorKey = 'required' | 'invalidEmail';

export interface FormState {
  status: 'idle' | 'success' | 'error';
  /** Field name -> message key. */
  fieldErrors?: Partial<Record<string, ErrorKey>>;
}

export const initialFormState: FormState = { status: 'idle' };
