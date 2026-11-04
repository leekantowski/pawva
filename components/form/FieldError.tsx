/** Inline message shown right under a field. Its id matches the input's aria-describedby. */
export default function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={`${name}-error`} className="field-error" role="alert">
      {message}
    </span>
  );
}

/** Props that link an input to its inline message for screen readers. */
export function a11yProps(name: string, message?: string) {
  return {
    id: name,
    name,
    "aria-invalid": message ? true : undefined,
    "aria-describedby": message ? `${name}-error` : undefined,
  } as const;
}
