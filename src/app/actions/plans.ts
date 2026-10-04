"use server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  acceptAllQuantities, deleteItem, deletePlan, refreshPrices, updateItem, updateUserCity,
} from "@/db/queries";
import { AiError } from "@/lib/ai";
import { getToday } from "@/lib/dates";
import { getSample } from "@/lib/samples";
import {
  citySchema, fieldErrors, itemEditSchema, stateOfCity, uploadSchema, type FieldErrors,
} from "@/lib/validation";
import { NotAPlanError, analysePlan } from "@/server/analyse";
import { requireUser } from "@/server/session";

export type UploadState = { errors: FieldErrors; values: { title?: string; city?: string } };

export async function uploadPlan(_prev: UploadState, form: FormData): Promise<UploadState> {
  const user = await requireUser();
  const file = form.get("file");
  const values = { title: String(form.get("title") ?? ""), city: String(form.get("city") ?? "") };
  const parsed = uploadSchema.safeParse({
    title: values.title || undefined,
    city: values.city,
    file: file instanceof File ? file : undefined,
  });
  if (!parsed.success || !(file instanceof File)) {
    return { errors: parsed.success ? { file: "Choose a plan file" } : fieldErrors(parsed.error), values };
  }

  let planId: number;
  try {
    const r = await analysePlan(db, {
      userId: user.id,
      bytes: Buffer.from(await file.arrayBuffer()),
      mime: file.type,
      fileName: file.name.slice(0, 120),
      title: parsed.data.title,
      city: parsed.data.city,
      state: stateOfCity(parsed.data.city),
      today: getToday(),
    });
    planId = r.planId;
  } catch (e) {
    if (e instanceof NotAPlanError) return { errors: { file: e.message }, values };
    if (e instanceof AiError) return { errors: { form: e.message }, values };
    console.error(e);
    return { errors: { form: "Something went wrong while reading the plan. Please try again." }, values };
  }
  revalidatePath("/plans");
  redirect(`/plans/${planId}`);
}

/** Runs a bundled sample plan through the same pipeline (its AI answer is cached). */
export async function analyseSample(form: FormData) {
  const user = await requireUser();
  const sample = getSample(String(form.get("sampleKey") ?? ""));
  if (!sample) redirect("/plans/new");
  const bytes = await readFile(path.join(process.cwd(), "public", "samples", `${sample.key}.pdf`));
  const { planId } = await analysePlan(db, {
    userId: user.id,
    bytes,
    mime: "application/pdf",
    fileName: `${sample.key}.pdf`,
    title: `${sample.title}, ${sample.city}`,
    city: sample.city,
    state: sample.state,
    sampleKey: sample.key,
    today: getToday(),
  });
  revalidatePath("/plans");
  redirect(`/plans/${planId}`);
}

export type ItemState = { errors: FieldErrors; ok?: boolean };

export async function editItem(_prev: ItemState, form: FormData): Promise<ItemState> {
  const user = await requireUser();
  const itemId = Number(form.get("itemId"));
  const planId = Number(form.get("planId"));
  const parsed = itemEditSchema.safeParse({
    quantity: form.get("quantity"),
    unitPrice: form.has("unitPrice") ? form.get("unitPrice") : undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const { quantity, unitPrice } = parsed.data;
  const ok = await updateItem(db, user.id, itemId, {
    quantity,
    unitPrice: unitPrice === undefined ? undefined : unitPrice === "" ? null : Math.round(unitPrice),
  });
  if (!ok) return { errors: { form: "That line was not found." } };
  revalidatePath(`/plans/${planId}`);
  return { errors: {}, ok: true };
}

export async function removeItem(form: FormData) {
  const user = await requireUser();
  await deleteItem(db, user.id, Number(form.get("itemId")));
  revalidatePath(`/plans/${Number(form.get("planId"))}`);
}

export async function acceptQuantities(form: FormData) {
  const user = await requireUser();
  const planId = Number(form.get("planId"));
  await acceptAllQuantities(db, user.id, planId);
  revalidatePath(`/plans/${planId}`);
}

export async function refreshPlanPrices(form: FormData) {
  const user = await requireUser();
  const planId = Number(form.get("planId"));
  await refreshPrices(db, user.id, planId, getToday());
  revalidatePath(`/plans/${planId}`);
  revalidatePath("/plans");
}

export async function removePlan(form: FormData) {
  const user = await requireUser();
  await deletePlan(db, user.id, Number(form.get("planId")));
  revalidatePath("/plans");
  redirect("/plans");
}

export type CityState = { errors: FieldErrors; ok?: boolean };

export async function saveCity(_prev: CityState, form: FormData): Promise<CityState> {
  const user = await requireUser();
  const parsed = citySchema.safeParse({ city: form.get("city") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await updateUserCity(db, user.id, parsed.data.city, stateOfCity(parsed.data.city));
  revalidatePath("/account");
  return { errors: {}, ok: true };
}
