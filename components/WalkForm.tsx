"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import type { WalkFormState } from "@/app/walks/actions";
import { validateWalk, type WalkFormValues } from "@/lib/walks/form";
import FieldError, { a11yProps } from "@/components/form/FieldError";
import { useFormValidation } from "@/components/form/useFormValidation";

const FIELDS = ["walked_on", "dog_id", "distance_mi", "duration_min", "notes"] as const;

type Props = {
  dogs: { id: number; name: string }[];
  action: (prev: WalkFormState, formData: FormData) => Promise<WalkFormState>;
  initialValues: WalkFormValues;
  title: string;
  submitLabel: string;
  cancelHref: string;
};

/** Today's date in the user's own time zone, as YYYY-MM-DD. */
function localToday() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function WalkForm({ dogs, action, initialValues, title, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, { formError: null, fieldErrors: {}, values: initialValues });
  const { errors, onSubmit, onChange } = useFormValidation(state, FIELDS, validateWalk);
  const dateRef = useRef<HTMLInputElement>(null);

  // New walks default to today. Done in the browser so it uses your time zone, not the server's.
  useEffect(() => {
    if (dateRef.current && !dateRef.current.value) dateRef.current.value = localToday();
  }, []);

  const v = state.values;
  const onlyDog = dogs.length === 1 ? String(dogs[0].id) : "";

  return (
    <form action={formAction} onSubmit={onSubmit} onChange={onChange} className="card stack-form" noValidate>
      <h1>{title}</h1>

      <label htmlFor="walked_on">
        Date
        <input ref={dateRef} {...a11yProps("walked_on", errors.walked_on)} type="date" defaultValue={v.walked_on} />
        <FieldError name="walked_on" message={errors.walked_on} />
      </label>

      <label htmlFor="dog_id">
        Dog
        <select {...a11yProps("dog_id", errors.dog_id)} defaultValue={v.dog_id || onlyDog}>
          <option value="">Choose a dog</option>
          {dogs.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
        <FieldError name="dog_id" message={errors.dog_id} />
      </label>

      <div className="field-row">
        <label htmlFor="distance_mi">
          Distance (mi)
          <input {...a11yProps("distance_mi", errors.distance_mi)} type="number" inputMode="decimal" step="0.01" defaultValue={v.distance_mi} />
          <FieldError name="distance_mi" message={errors.distance_mi} />
        </label>
        <label htmlFor="duration_min">
          Duration (min)
          <input {...a11yProps("duration_min", errors.duration_min)} type="number" inputMode="decimal" step="0.1" defaultValue={v.duration_min} />
          <FieldError name="duration_min" message={errors.duration_min} />
        </label>
      </div>

      <label htmlFor="notes">
        <span>
          Notes <span className="muted">(optional)</span>
        </span>
        <textarea {...a11yProps("notes", errors.notes)} rows={3} defaultValue={v.notes} />
        <FieldError name="notes" message={errors.notes} />
      </label>

      {state.formError && (
        <p className="error" role="alert">
          {state.formError}
        </p>
      )}

      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
