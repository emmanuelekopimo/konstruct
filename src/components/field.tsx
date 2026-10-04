import { CircleAlert } from "lucide-react";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="alert">
      <CircleAlert size={14} aria-hidden /> {message}
    </p>
  );
}
