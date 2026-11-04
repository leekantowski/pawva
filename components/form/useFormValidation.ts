"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { readFields, type FieldErrors, type FormState, type Validation } from "@/lib/validation";

/**
 * Runs a form's validator in the browser before submitting, using the SAME rules the
 * Server Action runs. If anything's wrong, the submit is stopped (so nothing typed is lost)
 * and each field shows its message. The server still re-checks everything.
 */
export function useFormValidation<K extends string>(
  state: FormState<unknown, K>,
  fields: readonly K[],
  validate: (values: Record<K, string>) => Validation<unknown, K>,
) {
  const [clientErrors, setClientErrors] = useState<FieldErrors<K> | null>(null);
  const [seenState, setSeenState] = useState(state);

  // A new response from the server replaces any browser-side messages.
  if (seenState !== state) {
    setSeenState(state);
    setClientErrors(null);
  }

  const errors: FieldErrors<K> = clientErrors ?? state.fieldErrors;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const result = validate(readFields(new FormData(form), fields));
    if (result.ok) {
      setClientErrors(null);
      return;
    }
    event.preventDefault();
    setClientErrors(result.errors);
    const first = fields.find((f) => result.errors[f]);
    if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  // Editing a field clears its message.
  function onChange(event: ChangeEvent<HTMLFormElement>) {
    const name = (event.target as unknown as HTMLInputElement).name as K;
    if (errors[name]) setClientErrors({ ...errors, [name]: undefined });
  }

  return { errors, onSubmit, onChange };
}
