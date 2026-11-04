"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-danger" disabled={pending}>
      {pending ? "Deleting…" : "Yes, delete"}
    </button>
  );
}

/** Two-step delete: "Delete" → "Are you sure?" → "Yes, delete". */
export default function DeleteWalkButton({ action }: { action: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className="btn btn-danger-outline" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }

  return (
    <form action={action} className="confirm-box" role="alertdialog" aria-label="Confirm delete">
      <p>
        <strong>Are you sure?</strong> This walk will be deleted. This can&apos;t be undone.
      </p>
      <div className="actions">
        <ConfirmButton />
        <button type="button" className="btn btn-secondary" onClick={() => setConfirming(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
