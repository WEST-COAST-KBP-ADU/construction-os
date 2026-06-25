type VoiceLabVariantId = "A" | "B" | "C";

export type VoiceLabVariant = {
  id: VoiceLabVariantId;
  label: string;
  model: string;
  voice: string;
  instructions: string;
  temperature?: number;
};

const DEFAULT_TEMPERATURE = 0.6;

const SECRETARY_BASE_INSTRUCTIONS = [
  "You are a private lab-only automated phone assistant for West Coast KBP testing.",
  "Disclose early that you are an automated assistant and this is a private lab test.",
  "Use a premium, calm, concise tone with natural pauses.",
  "Ask one question at a time.",
  "Collect only test-safe intake fields: project type, city or general area, desired help category, and best human-review next step.",
  "Do not ask for or retain a caller phone number, exact address, email, permit number, parcel number, payment data, or other sensitive personal data.",
  "Do not provide pricing, schedule promises, buildability judgments, permit, zoning, code, legal, financing, or tax conclusions.",
  "Do not book or confirm a binding appointment.",
  "If asked for restricted guidance, briefly explain that a human must review it and offer to route the note for human review.",
  "Do not record, summarize for storage, or claim that a transcript will be retained.",
].join(" ");

const VARIANT_LABELS: Record<VoiceLabVariantId, string> = {
  A: "Premium calm baseline",
  B: "Warmer concierge",
  C: "Crisper intake screener",
};

const VARIANT_STYLE: Record<VoiceLabVariantId, string> = {
  A: "Keep the delivery balanced, composed, and unhurried.",
  B: "Sound slightly warmer and more concierge-like while staying concise.",
  C: "Sound efficient and crisp, with short responses and clear turn-taking.",
};

function getEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function getRequiredEnv(name: string): string {
  const value = getEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getActiveVariantId(): VoiceLabVariantId {
  const raw = getEnv("VOICE_LAB_ACTIVE_VARIANT") ?? "A";

  if (raw === "A" || raw === "B" || raw === "C") {
    return raw;
  }

  throw new Error("VOICE_LAB_ACTIVE_VARIANT must be A, B, or C");
}

function getVariantVoice(id: VoiceLabVariantId): string {
  return getRequiredEnv(`VOICE_LAB_VARIANT_${id}_VOICE`);
}

export function getActiveVoiceLabVariant(): VoiceLabVariant {
  const id = getActiveVariantId();
  const model = getRequiredEnv("OPENAI_REALTIME_MODEL");

  return {
    id,
    label: VARIANT_LABELS[id],
    model,
    voice: getVariantVoice(id),
    temperature: DEFAULT_TEMPERATURE,
    instructions: `${SECRETARY_BASE_INSTRUCTIONS} ${VARIANT_STYLE[id]}`,
  };
}

export function getVoiceLabVariantSummaries() {
  return (["A", "B", "C"] as const).map((id) => ({
    id,
    label: VARIANT_LABELS[id],
    voiceEnv: `VOICE_LAB_VARIANT_${id}_VOICE`,
  }));
}
