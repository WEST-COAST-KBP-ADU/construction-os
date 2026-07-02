/**
 * Deterministic guardrail module — text-mode intake lab (TASK-0003).
 *
 * Screens candidate assistant responses for restricted claims (BOUNDARIES.md)
 * and sanitizes free text so PII never reaches an artifact. Pure functions,
 * no I/O, no model calls. This module backs the prompt layer; it is the
 * enforcement of last resort, so every rule here is a regex or string rule
 * that behaves identically on every run.
 *
 * LAB STATUS: synthetic data only. Not production-authorized.
 */

export type RestrictedClaimClass =
  | "price_promise"
  | "schedule_promise"
  | "permit_conclusion"
  | "code_conclusion"
  | "zoning_conclusion"
  | "buildability_conclusion"
  | "legal_advice"
  | "financing_tax_advice"
  | "binding_appointment";

export type GuardrailFinding = {
  claimClass: RestrictedClaimClass;
  /** Rule identifier, stable across runs — never the matched text itself. */
  ruleId: string;
};

export type GuardrailVerdict = {
  verdict: "pass" | "block";
  findings: GuardrailFinding[];
  /** Refusal text to use instead of the blocked response, when blocked. */
  refusal?: string;
};

type Rule = { claimClass: RestrictedClaimClass; ruleId: string; pattern: RegExp };

// Rules are intentionally broad: a false block costs a rephrase; a false pass
// costs an overclaim to a client. Fail-closed direction mirrors the Core gate.
const RULES: Rule[] = [
  // Price promises: dollar amounts in promissory context, or commitment verbs
  // around price/cost/quote.
  { claimClass: "price_promise", ruleId: "price.dollar_amount", pattern: /\$\s?\d[\d,]*(\.\d+)?\s?(k|K)?/ },
  { claimClass: "price_promise", ruleId: "price.commitment_phrase", pattern: /\b(price|cost|quote|estimate)\b[^.?!]{0,40}\b(is|will be|would be|comes to|around|about|roughly)\b[^.?!]{0,20}\d/i },
  { claimClass: "price_promise", ruleId: "price.per_unit", pattern: /\b\d[\d,]*\s?(per|\/)\s?(sq\.?\s?ft|square foot|sf)\b/i },

  // Schedule promises: committed dates/durations.
  { claimClass: "schedule_promise", ruleId: "schedule.completion_commitment", pattern: /\b(done|finished|completed|ready|built)\b[^.?!]{0,30}\b(by|within|in)\b[^.?!]{0,20}\b(week|month|day|spring|summer|fall|winter|january|february|march|april|may|june|july|august|september|october|november|december)/i },
  { claimClass: "schedule_promise", ruleId: "schedule.start_commitment", pattern: /\b(we|crew|team)\b[^.?!]{0,20}\b(can|will|could)\s(start|begin|break ground)\b[^.?!]{0,30}\b(next|this|on|by|within)\b/i },
  { claimClass: "schedule_promise", ruleId: "schedule.duration_commitment", pattern: /\b(takes?|take)\s(only\s)?(about\s|around\s)?\d+\s?(-\s?\d+\s?)?(week|month|day)s?\b/i },

  // Permit conclusions.
  { claimClass: "permit_conclusion", ruleId: "permit.not_required", pattern: /\b(no|don'?t|won'?t|isn'?t|not)\b[^.?!]{0,30}\bpermits?\b|\bpermits?\b[^.?!]{0,30}\b(not|isn'?t|aren'?t)\s(required|needed|necessary)\b/i },
  { claimClass: "permit_conclusion", ruleId: "permit.approval_promise", pattern: /\bpermits?\b[^.?!]{0,40}\b(will|would|should)\s(be\s)?(approved|granted|issued|go through|pass)\b/i },

  // Code conclusions.
  { claimClass: "code_conclusion", ruleId: "code.compliance_conclusion", pattern: /\b(meets?|complies?|compliant|satisfies|passes)\b[^.?!]{0,30}\b(building\s)?codes?\b|\b(up\s)?to\s?code\b/i },

  // Zoning conclusions.
  { claimClass: "zoning_conclusion", ruleId: "zoning.determination", pattern: /\b(your|the)\s(lot|parcel|property|land)\b[^.?!]{0,30}\b(is|isn'?t)\szoned\b|\bzoning\b[^.?!]{0,30}\b(allows?|permits?|prohibits?)\b/i },
  { claimClass: "zoning_conclusion", ruleId: "zoning.adu_allowed", pattern: /\badu\b[^.?!]{0,30}\b(is|are)\s(allowed|permitted|legal)\b[^.?!]{0,30}\b(on|for)\s(your|the|this)\b/i },

  // Buildability conclusions.
  { claimClass: "buildability_conclusion", ruleId: "buildability.feasibility", pattern: /\b(definitely|certainly|absolutely|for sure)\b[^.?!]{0,20}\b(can|able to)\s(build|fit|construct)\b|\b(is|it'?s)\s(buildable|feasible)\b/i },

  // Legal advice.
  { claimClass: "legal_advice", ruleId: "legal.advice", pattern: /\b(legally|the law)\b[^.?!]{0,30}\b(you\s(can|cannot|can'?t|must|don'?t have to)|allows?|requires?)\b|\byou\s(don'?t\s)?need\sa\slawyer\b/i },

  // Financing / tax advice.
  { claimClass: "financing_tax_advice", ruleId: "financing.advice", pattern: /\b(tax(es)?|deduct(ion|ible)?|write[-\s]?off|loan|financing|heloc|refinanc)\w*\b[^.?!]{0,40}\b(you\s(should|can|will|qualify)|save|benefit)\b/i },

  // Binding appointments.
  { claimClass: "binding_appointment", ruleId: "appointment.booking", pattern: /\b(i'?ve|i have|you'?re|your appointment is)\s(booked|scheduled|confirmed)\b|\b(book|schedule|confirm)(ed|ing)?\s(you|your\s(visit|appointment|consultation))\b/i },
];

/**
 * Refusal templates — the safe replacement voice line per claim class.
 * Calm, premium, no promises; routes the caller toward owner review.
 */
export const REFUSAL_TEMPLATES: Record<RestrictedClaimClass, string> = {
  price_promise:
    "I'm not able to give pricing on this call. The owner reviews every project personally and will follow up with accurate numbers.",
  schedule_promise:
    "I can't commit to dates on this call. Once the owner reviews your project, you'll get a realistic timeline directly.",
  permit_conclusion:
    "Permit questions need an official review — I can't make that determination. We'll flag it for the owner's follow-up.",
  code_conclusion:
    "Building-code questions require a formal review by the proper professionals. I'll note it so it's covered in your follow-up.",
  zoning_conclusion:
    "Zoning has to be verified against official sources — I can't confirm that here. We'll include it in the owner's review.",
  buildability_conclusion:
    "Whether that's buildable takes a formal review. I'll capture the details so the owner can assess it properly.",
  legal_advice:
    "That's a legal question I'm not able to answer. A human will review it and point you in the right direction.",
  financing_tax_advice:
    "Financing and tax questions are outside what I can advise on. The owner can discuss options with you directly.",
  binding_appointment:
    "I can't book appointments directly. I'll pass your preferred times to the owner, who will confirm with you personally.",
};

/**
 * Screen a candidate response. Any restricted claim blocks the whole response
 * (fail-closed): the caller must use `refusal` instead of the original text.
 */
export function screenResponse(text: string): GuardrailVerdict {
  const findings: GuardrailFinding[] = [];
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      findings.push({ claimClass: rule.claimClass, ruleId: rule.ruleId });
    }
  }
  if (findings.length === 0) {
    return { verdict: "pass", findings };
  }
  return {
    verdict: "block",
    findings,
    refusal: REFUSAL_TEMPLATES[findings[0].claimClass],
  };
}

export type PiiClass = "phone" | "email" | "street_address" | "parcel_apn";

type PiiRule = { piiClass: PiiClass; pattern: RegExp };

// Replacement order matters: longer/more specific shapes first so an APN is
// not half-eaten by the phone rule.
const PII_RULES: PiiRule[] = [
  { piiClass: "email", pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
  { piiClass: "phone", pattern: /(\+?1[\s.-]?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g },
  { piiClass: "parcel_apn", pattern: /\b\d{3}[- ]\d{3}[- ]\d{2,3}\b|\bAPN[:\s#]*[\dA-Z-]{6,}\b/gi },
  { piiClass: "street_address", pattern: /\b\d{1,6}\s+[A-Za-z][A-Za-z .]{2,40}\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd|way|circle|cir|place|pl|trail|trl|parkway|pkwy)\b\.?/gi },
];

export type SanitizationResult = {
  sanitized: string;
  /** Classes found and redacted — counts only, never the values. */
  redacted: Partial<Record<PiiClass, number>>;
};

/**
 * Redact PII from free text before it may enter any artifact, log, or event.
 * Sanitization happens BEFORE emission (DR-0004 / core-compatibility rule):
 * callers must never store the input, only the returned `sanitized` value.
 */
export function sanitizeText(text: string): SanitizationResult {
  let sanitized = text;
  const redacted: Partial<Record<PiiClass, number>> = {};
  for (const rule of PII_RULES) {
    sanitized = sanitized.replace(rule.pattern, () => {
      redacted[rule.piiClass] = (redacted[rule.piiClass] ?? 0) + 1;
      return `[${rule.piiClass}]`;
    });
  }
  return { sanitized, redacted };
}
