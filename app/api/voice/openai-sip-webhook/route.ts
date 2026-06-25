import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getActiveVoiceLabVariant } from "@/src/lib/voiceLabConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OpenAIRealtimeIncomingCallEvent = {
  type: "realtime.call.incoming";
  data?: {
    call_id?: string;
  };
};

type OpenAIWebhookEvent = OpenAIRealtimeIncomingCallEvent | { type?: string; data?: unknown };

type WebhookLogEntry = {
  timestamp: string;
  variantId?: string;
  eventType: string;
  result: "accepted" | "rejected" | "error";
  latencyMs?: number;
  errorClass?: string;
};

function labLog(entry: WebhookLogEntry) {
  console.info("voice_lab_event", entry);
}

function getOpenAIClient() {
  if (!process.env.OPENAI_WEBHOOK_SECRET) {
    throw new Error("LAB_ONLY_UNVERIFIED: OPENAI_WEBHOOK_SECRET is required before this route can accept calls.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    webhookSecret: process.env.OPENAI_WEBHOOK_SECRET,
  });
}

async function parseWebhookEvent(request: Request): Promise<OpenAIWebhookEvent> {
  const rawBody = await request.text();
  const client = getOpenAIClient();
  return client.webhooks.unwrap(rawBody, Object.fromEntries(request.headers.entries())) as Promise<OpenAIWebhookEvent>;
}

function getCallIdFromData(data: unknown): string | undefined {
  if (data && typeof data === "object" && "call_id" in data && typeof data.call_id === "string") {
    return data.call_id;
  }

  return undefined;
}

function getIncomingCallId(event: OpenAIWebhookEvent): string | undefined {
  if (event.type !== "realtime.call.incoming") {
    return undefined;
  }

  return getCallIdFromData(event.data);
}

async function acceptCall(callId: string) {
  const variant = getActiveVoiceLabVariant();
  const client = getOpenAIClient();

  await client.realtime.calls.accept(callId, {
    type: "realtime",
    model: variant.model,
    instructions: variant.instructions,
    output_modalities: ["audio"],
    audio: {
      input: {
        turn_detection: {
          type: "server_vad",
          interrupt_response: true,
        },
      },
      output: {
        voice: variant.voice,
      },
    },
    tracing: null,
  });

  return variant;
}

async function rejectCall(callId: string) {
  const client = getOpenAIClient();
  await client.realtime.calls.reject(callId, { status_code: 603 });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let eventType = "unknown";
  let variantId: string | undefined;

  try {
    const event = await parseWebhookEvent(request);
    eventType = event.type ?? "unknown";
    const callId = getIncomingCallId(event);

    if (!callId) {
      const unsupportedCallId = getCallIdFromData(event.data);

      if (unsupportedCallId) {
        await rejectCall(unsupportedCallId);
      }

      labLog({
        timestamp: new Date().toISOString(),
        eventType,
        result: "rejected",
        latencyMs: Date.now() - startedAt,
      });

      return NextResponse.json({ ok: false, result: "unsupported_event" }, { status: 202 });
    }

    const variant = await acceptCall(callId);
    variantId = variant.id;

    labLog({
      timestamp: new Date().toISOString(),
      variantId,
      eventType,
      result: "accepted",
      latencyMs: Date.now() - startedAt,
    });

    return NextResponse.json({ ok: true, result: "accepted", variant: variant.id });
  } catch (error) {
    const errorClass = error instanceof Error ? error.name : "UnknownError";
    const message = error instanceof Error ? error.message : "Unknown error";

    labLog({
      timestamp: new Date().toISOString(),
      variantId,
      eventType,
      result: "error",
      latencyMs: Date.now() - startedAt,
      errorClass,
    });

    const status = message.startsWith("LAB_ONLY_UNVERIFIED") ? 501 : 400;

    return NextResponse.json(
      {
        ok: false,
        result: "rejected",
        error: status === 501 ? "LAB_ONLY_UNVERIFIED" : errorClass,
      },
      { status },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "method_not_allowed",
      labOnly: true,
    },
    { status: 405 },
  );
}
