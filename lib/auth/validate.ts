// Sign-up / log-in checks. Used in the browser and again in the Server Action.
import { hasErrors, type FieldErrors, type Validation } from "@/lib/validation";

export const MIN_PASSWORD_LENGTH = 6; // Supabase's default minimum

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthFields = "email" | "password";
export type Credentials = { email: string; password: string };

function checkEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return "Please enter your email.";
  if (!EMAIL_PATTERN.test(trimmed)) return "That doesn't look like an email address.";
}

/** Sign up: valid email, password of at least 6 characters. */
export function validateSignUp(raw: Credentials): Validation<Credentials, AuthFields> {
  const errors: FieldErrors<AuthFields> = { email: checkEmail(raw.email) };
  if (!raw.password) errors.password = "Please choose a password.";
  else if (raw.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return hasErrors(errors) ? { ok: false, errors } : { ok: true, value: { email: raw.email.trim(), password: raw.password } };
}

/** Log in: valid email and a non-blank password (no length rule, so older accounts still work). */
export function validateLogIn(raw: Credentials): Validation<Credentials, AuthFields> {
  const errors: FieldErrors<AuthFields> = { email: checkEmail(raw.email) };
  if (!raw.password) errors.password = "Please enter your password.";
  return hasErrors(errors) ? { ok: false, errors } : { ok: true, value: { email: raw.email.trim(), password: raw.password } };
}
