"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import type { WalkFormState } from "@/app/walks/actions";
import type { WalkFormValues } from "@/lib/walks/form";

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
  const [state, formAction, pending] = useActionState(action, { error: null, values: initialValues });
  const dateRef = useRef<HTMLInputElement>(null);

  // New walks default to today. Done in the browser so it uses your time zone, not the server's.
  useEffect(() => {
    if (dateRef.current && !dateRef.current.value) dateRef.current.value = localToday();
  }, []);

  const v = state.values;
  const onlyDog = dogs.length === 1 ? String(dogs[0].id) : "";

  return (
    <form action={formAction} className="card stack-form" noValidate>
      <h1>{title}</h1>

      <label>
        Date
        <input ref={dateRef} name="walked_on" type="date" defaultValue={v.walked_on} required />
      </label>

      <label>
        Dog
        <select name="dog_id" defaultValue={v.dog_id || onlyDog} required>
          <option value="" disabled>
            Choose a dog
          </option>
          {dogs.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label>
          Distance (mi)
          <input name="distance_mi" type="number" inputMode="decimal" step="0.01" min="0.01" defaultValue={v.distance_mi} required />
        </label>
        <label>
          Duration (min)
          <input name="duration_min" type="number" inputMode="decimal" step="0.1" min="0.1" defaultValue={v.duration_min} required />
        </label>
      </div>

      <label>
        Notes <span className="muted">(optional)</span>
        <textarea name="notes" rows={3} defaultValue={v.notes} />
      </label>

      {state.error && (
        <p className="error" role="alert">
          {state.error}
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
