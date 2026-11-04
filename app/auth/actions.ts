"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateCredentials } from "@/lib/auth/validate";
import { HOME_FOR_USERS, LOGIN_PAGE } from "@/lib/auth/routes";

export type AuthFormState = { error: string | null; email: string };

function readForm(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readForm(formData);
  const invalid = validateCredentials(email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { error: "That email is already registered. Try logging in.", email };
    }
    if (error.code === "weak_password") {
      return { error: error.message, email };
    }
    return { error: "Couldn't create your account. Please try again.", email };
  }

  // "Confirm email" is off in Supabase, so sign-up returns a session right away.
  if (!data.session) {
    return { error: "Account created, but you'll need to confirm your email before logging in.", email };
  }

  revalidatePath("/", "layout");
  redirect(HOME_FOR_USERS);
}

export async function logIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readForm(formData);
  if (!email || !password) {
    return { error: "Please enter your email and password.", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Email or password is incorrect.", email };
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
