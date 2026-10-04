"use client";
import { useActionState } from "react";
import { editItem, type ItemState } from "@/app/actions/plans";
import { FieldError } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";

const initial: ItemState = { errors: {} };

export function LineEdit({
  planId, itemId, quantity, unit, unitPrice, allowPrice,
}: { planId: number; itemId: number; quantity: number; unit: string; unitPrice: number | null; allowPrice: boolean }) {
  const [state, action] = useActionState(editItem, initial);
  const e = state.errors;
  const q = `q-${itemId}`;
  const p = `p-${itemId}`;
  return (
    <form action={action} className="edit-form" noValidate>
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="itemId" value={itemId} />
      <div className="field">
        <label htmlFor={q} className="small">Quantity ({unit})</label>
        <input id={q} name="quantity" type="number" inputMode="decimal" min="0" step="any" className="input input-sm"
          defaultValue={quantity} aria-invalid={Boolean(e.quantity)} aria-describedby={`${q}-err`} />
        <FieldError id={`${q}-err`} message={e.quantity} />
      </div>
      {allowPrice ? (
        <div className="field">
          <label htmlFor={p} className="small">Unit price (Naira)</label>
          <input id={p} name="unitPrice" type="number" inputMode="numeric" min="0" step="any" className="input input-sm"
            defaultValue={unitPrice ?? ""} placeholder="Ask a vendor" aria-invalid={Boolean(e.unitPrice)} aria-describedby={`${p}-err`} />
          <FieldError id={`${p}-err`} message={e.unitPrice} />
        </div>
      ) : <div />}
      <SubmitButton className="btn btn-outline btn-sm" pendingText="Saving...">{state.ok ? "Saved" : "Save"}</SubmitButton>
      {e.form && <p className="field-error">{e.form}</p>}
    </form>
  );
}
