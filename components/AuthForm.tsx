"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/app/auth/actions";
import { validateLogIn, validateSignUp, MIN_PASSWORD_LENGTH } from "@/lib/auth/validate";
import FieldError, { a11yProps } from "@/components/form/FieldError";
import { useFormValidation } from "@/components/form/useFormValidation";

type Props = {
  mode: "login" | "signup";
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
};

const FIELDS = ["email", "password"] as const;
const initial: AuthFormState = { formError: null, fieldErrors: {}, values: { email: "" } };

export default function AuthForm({ mode, action }: Props) {
  const isSignup = mode === "signup";
  const [state, formAction, pending] = useActionState(action, initial);
  const { errors, onSubmit, onChange } = useFormValidation(state, FIELDS, isSignup ? validateSignUp : validateLogIn);

  return (
    <form action={formAction} onSubmit={onSubmit} onChange={onChange} className="card auth-form" noValidate>
      <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>

      <label htmlFor="email">
        Email
        <input {...a11yProps("email", errors.email)} type="email" autoComplete="email" defaultValue={state.values.email} />
        <FieldError name="email" message={errors.email} />
      </label>

      <label htmlFor="password">
        Password
        {isSignup && <span className="hint">At least {MIN_PASSWORD_LENGTH} characters</span>}
        <input
          {...a11yProps("password", errors.password)}
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        <FieldError name="password" message={errors.password} />
      </label>

      {state.formError && (
        <p className="error" role="alert">
          {state.formError}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "One sec…" : isSignup ? "Sign up" : "Log in"}
      </button>

      <p className="muted">
        {isSignup ? (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        ) : (
          <>
            New here? <Link href="/signup">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
