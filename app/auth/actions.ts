"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateLogIn, validateSignUp, type AuthFields } from "@/lib/auth/validate";
import { HOME_FOR_USERS, LOGIN_PAGE } from "@/lib/auth/routes";
import { readFields, type FormState } from "@/lib/validation";

// Only the email is echoed back; passwords are never sent back to the browser.
export type AuthFormState = FormState<{ email: string }, AuthFields>;

const AUTH_FIELDS = ["email", "password"] as const;

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = readFields(formData, AUTH_FIELDS);
  const values = { email: raw.email };

  // Server-side check: runs even if the browser check was bypassed.
  const result = validateSignUp(raw);
  if (!result.ok) return { formError: null, fieldErrors: result.errors, values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(result.value);

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { formError: null, fieldErrors: { email: "That email is already registered. Try logging in." }, values };
    }
    if (error.code === "weak_password") {
      return { formError: null, fieldErrors: { password: error.message }, values };
    }
    return { formError: "Couldn't create your account. Please try again.", fieldErrors: {}, values };
  }

  // "Confirm email" is off in Supabase, so sign-up returns a session right away.
  if (!data.session) {
    return {
      formError: "Account created, but you'll need to confirm your email before logging in.",
      fieldErrors: {},
      values,
    };
  }

  revalidatePath("/", "layout");
  redirect(HOME_FOR_USERS);
}

export async function logIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = readFields(formData, AUTH_FIELDS);
  const values = { email: raw.email };

  const result = validateLogIn(raw);
  if (!result.ok) return { formError: null, fieldErrors: result.errors, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.value);
  if (error) {
    // Deliberately vague: don't reveal whether the email has an account.
    return { formError: "Email or password is incorrect.", fieldErrors: {}, values };
  }

  revalidatePath("/", "layout");
  redirect(HOME_FOR_USERS);
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(LOGIN_PAGE);
}
