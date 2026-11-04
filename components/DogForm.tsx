"use client";

import { useActionState } from "react";
import { addDog, type DogFormState } from "@/app/dogs/actions";

const initial: DogFormState = { error: null, saved: false, savedCount: 0, values: { name: "", breed: "", weight: "" } };

export default function DogForm() {
  const [state, formAction, pending] = useActionState(addDog, initial);

  return (
    // key resets the inputs after a successful save
    <form key={state.savedCount} action={formAction} className="card stack-form" noValidate>
      <h2>Add a dog</h2>

      <label>
        Name
        <input name="name" defaultValue={state.values.name} required />
      </label>

      <label>
        Breed <span className="muted">(optional)</span>
        <input name="breed" defaultValue={state.values.breed} />
      </label>

      <label>
        Weight (lb)
        <input name="weight" type="number" inputMode="decimal" step="0.1" min="0.1" defaultValue={state.values.weight} required />
      </label>

      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="success" role="status">
          Dog saved! 🐾
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save dog"}
      </button>
    </form>
  );
}
