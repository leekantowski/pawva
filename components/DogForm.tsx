"use client";

import { useActionState } from "react";
import { addDog, type DogFormState } from "@/app/dogs/actions";
import { validateDog } from "@/lib/dogs/validate";
import { hasErrors } from "@/lib/validation";
import FieldError, { a11yProps } from "@/components/form/FieldError";
import { useFormValidation } from "@/components/form/useFormValidation";

const FIELDS = ["name", "breed", "weight"] as const;
const initial: DogFormState = {
  formError: null,
  fieldErrors: {},
  values: { name: "", breed: "", weight: "" },
  saved: false,
  savedCount: 0,
};

export default function DogForm() {
  const [state, formAction, pending] = useActionState(addDog, initial);
  const { errors, onSubmit, onChange } = useFormValidation(state, FIELDS, validateDog);
  const v = state.values;

  return (
    // key resets the inputs after a successful save
    <form key={state.savedCount} action={formAction} onSubmit={onSubmit} onChange={onChange} className="card stack-form" noValidate>
      <h2>Add a dog</h2>

      <label htmlFor="name">
        Name
        <input {...a11yProps("name", errors.name)} defaultValue={v.name} />
        <FieldError name="name" message={errors.name} />
      </label>

      <label htmlFor="breed">
        <span>
          Breed <span className="muted">(optional)</span>
        </span>
        <input {...a11yProps("breed", errors.breed)} defaultValue={v.breed} />
        <FieldError name="breed" message={errors.breed} />
      </label>

      <label htmlFor="weight">
        Weight (lb)
        <input {...a11yProps("weight", errors.weight)} type="number" inputMode="decimal" step="0.1" defaultValue={v.weight} />
        <FieldError name="weight" message={errors.weight} />
      </label>

      {state.formError && (
        <p className="error" role="alert">
          {state.formError}
        </p>
      )}
      {state.saved && !hasErrors(errors) && (
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
