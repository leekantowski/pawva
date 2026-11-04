// Checks sign-up / login input before it goes to Supabase.

export const MIN_PASSWORD_LENGTH = 6; // Supabase's default minimum

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a friendly error message, or null if the input is OK. */
export function validateCredentials(email: string, password: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Please enter your email.";
  if (!EMAIL_PATTERN.test(trimmed)) return "That doesn't look like an email address.";
  if (!password) return "Please enter your password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
