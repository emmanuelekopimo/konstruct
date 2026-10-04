import { createHash } from "node:crypto";
import { buildPrompt, extractionJsonSchema } from "./extraction";

// The only place the app talks to an AI model. One request per new file:
// the drawing goes in, a structured take-off comes out.

export const DEFAULT_MODEL = "google/gemini-3.8-flash";

export function aiModel(env: Record<string, string | undefined> = process.env): string {
  return env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export type AiInput = { bytes: Uint8Array; mime: string; fileName: string; city: string };

export class AiError extends Error {}

export async function callExtractionModel(input: AiInput): Promise<{ result: unknown; model: string }> {
  const mode = process.env.KONSTRUCT_AI_MODE;
  if (mode === "mock") return { result: mockExtraction(input), model: "mock" };

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new AiError("The AI service is not configured. Try one of the sample plans.");
  const model = aiModel();
  const b64 = Buffer.from(input.bytes).toString("base64");
  const filePart =
    input.mime === "application/pdf"
      ? { type: "file", file: { filename: input.fileName, file_data: `data:application/pdf;base64,${b64}` } }
      : { type: "image_url", image_url: { url: `data:${input.mime};base64,${b64}` } };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://konstruct.app",
      "X-Title": "Konstruct",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 12000,
      // Low reasoning keeps a new upload near 30 seconds without hurting the take-off.
      reasoning: { effort: process.env.OPENROUTER_REASONING || "low" },
      messages: [{ role: "user", content: [{ type: "text", text: buildPrompt(input.city) }, filePart] }],
      response_format: { type: "json_schema", json_schema: extractionJsonSchema },
    }),
    signal: AbortSignal.timeout(240_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("OpenRouter error", res.status, body.slice(0, 500));
    throw new AiError("The AI service could not read this file right now. Please try again.");
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; cost?: number };
  };
  console.log("OpenRouter usage", model, JSON.stringify(data.usage ?? {}));
  const text = data.choices?.[0]?.message?.content ?? "";
  return { result: parseJsonLoose(text), model };
}

/** Accepts plain JSON or JSON wrapped in a ```json fence. */
export function parseJsonLoose(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new AiError("The AI reply was empty. Please try again.");
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new AiError("The AI reply was not readable. Please try again.");
  }
}

/** Deterministic stand-in used by tests (KONSTRUCT_AI_MODE=mock). */
export function mockExtraction(input: AiInput): unknown {
  const name = input.fileName.toLowerCase();
  if (name.includes("not-a-plan")) {
    return {
      is_building_plan: false, title: "Unknown", building_type: "other", floors: 1, bedrooms: 0,
      floor_area_m2: 0, summary: "", items: [], assumptions: [],
    };
  }
  const item = (code: string, quantity: number, confidence = "high", unit = "") => ({
    code, description: code, quantity, unit, confidence, basis: "mock take-off",
  });
  return {
    is_building_plan: true,
    title: "Mock Bungalow",
    building_type: "bungalow",
    floors: 1,
    bedrooms: 2,
    floor_area_m2: 90,
    summary: `Mock take-off for ${input.fileName} in ${input.city}.`,
    items: [
      item("CEM-50", 410),
      item("SAND-SHARP", 38.5),
      item("GRANITE-34", 22),
      item("BLOCK-9", 2650),
      item("BLOCK-6", 900),
      item("ROD-12", 85),
      item("ROOF-ALU", 135),
      item("DOOR-SECURITY", 2),
      item("PAINT-EMULSION", 9, "medium"),
      item("OTHER", 2, "low", "set"),
    ].map((x, i) => (x.code === "OTHER" ? { ...x, description: "Burglary proof grilles", unit: "set" } : { ...x, description: `item ${i}` })),
    assumptions: ["Mock mode: quantities are fixed test values."],
  };
}
