import type { DB } from "@/db";
import { createPlan, getCachedExtraction, putCachedExtraction } from "@/db/queries";
import { AiError, callExtractionModel, sha256 } from "@/lib/ai";
import { normalizeExtraction } from "@/lib/extraction";

export type AnalyseInput = {
  userId: number;
  bytes: Buffer;
  mime: string;
  fileName: string;
  title?: string;
  city: string;
  state: string;
  sampleKey?: string | null;
  today: string;
};

export class NotAPlanError extends Error {}

/**
 * Upload pipeline: hash the file, reuse a cached AI answer for the same bytes,
 * otherwise make the one AI call, then clean the answer and price it.
 */
export async function analysePlan(db: DB, input: AnalyseInput): Promise<{ planId: number; cached: boolean }> {
  const fileHash = sha256(input.bytes);
  const cached = await getCachedExtraction(db, fileHash);
  let raw: unknown;
  let model: string;
  if (cached) {
    raw = cached.result;
    model = cached.model;
  } else {
    const r = await callExtractionModel({ bytes: input.bytes, mime: input.mime, fileName: input.fileName, city: input.city });
    raw = r.result;
    model = r.model;
  }

  let extraction;
  try {
    extraction = normalizeExtraction(raw);
  } catch {
    throw new AiError("The AI reply did not have the expected shape. Please try again.");
  }
  if (!extraction.isBuildingPlan || extraction.items.length === 0) {
    throw new NotAPlanError("This file does not look like a building plan. Upload a floor plan or drawing sheet.");
  }
  if (!cached) await putCachedExtraction(db, fileHash, model, raw);

  const planId = await createPlan(db, {
    userId: input.userId,
    extraction,
    title: input.title,
    city: input.city,
    state: input.state,
    fileName: input.fileName,
    fileHash,
    aiModel: model,
    sampleKey: input.sampleKey,
    file: { mime: input.mime, bytes: input.bytes },
    today: input.today,
  });
  return { planId, cached: Boolean(cached) };
}
