import { describe, expect, it } from "vitest";
import { REFUSAL_TEMPLATES, sanitizeText, screenResponse } from "./guardrails";

describe("screenResponse — restricted claims (fail-closed suite)", () => {
  const blocked: Array<[string, string]> = [
    ["price_promise dollar", "A detached ADU like that usually runs $180,000 all in."],
    ["price_promise phrase", "The cost will be around 200 grand, maybe less. Our estimate is about 195000."],
    ["price_promise per sqft", "We build at 350 per sq ft typically."],
    ["schedule completion", "It will be finished by summer, no problem."],
    ["schedule start", "Our crew can start next Monday."],
    ["schedule duration", "A garage conversion takes about 6 weeks."],
    ["permit not required", "For a unit that small you don't need a permit."],
    ["permit approval", "Your permit will be approved quickly in Roseville."],
    ["code conclusion", "That design is up to code already."],
    ["zoning determination", "Your lot is zoned R-1, so zoning allows a second unit."],
    ["zoning adu allowed", "An ADU is allowed on your property for sure."],
    ["buildability", "It's definitely buildable — we can absolutely fit a 1200 sq unit there. It's feasible."],
    ["legal advice", "Legally you can evict the tenant first; you don't need a lawyer for that."],
    ["financing advice", "With a HELOC you should qualify easily and save on taxes."],
    ["binding appointment", "I've booked you for Tuesday at 10am."],
  ];

  it.each(blocked)("blocks: %s", (_name, text) => {
    const result = screenResponse(text);
    expect(result.verdict).toBe("block");
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.refusal).toBeTruthy();
  });

  const safe: Array<[string, string]> = [
    ["greeting", "Thanks for calling West Coast KBP. How can I help you today?"],
    ["safe intake question", "Could you tell me which city the property is in?"],
    [
      "safe deferral",
      "The owner reviews every project personally and will follow up with you about pricing and timing.",
    ],
    ["safe classification", "It sounds like you're exploring a garage conversion. Let me note that down."],
  ];

  it.each(safe)("passes: %s", (_name, text) => {
    const result = screenResponse(text);
    expect(result.verdict).toBe("pass");
    expect(result.findings).toHaveLength(0);
  });

  it("returns the refusal template of the first finding", () => {
    const result = screenResponse("The price will be around 250000 dollars.");
    expect(result.refusal).toBe(REFUSAL_TEMPLATES.price_promise);
  });
});

describe("sanitizeText — PII redaction", () => {
  it("redacts phone numbers in common formats", () => {
    const { sanitized, redacted } = sanitizeText(
      "Call me at (916) 555-0182 or 916.555.0182 or +1 916-555-0182."
    );
    expect(sanitized).not.toMatch(/\d{3}[\s.-]?\d{4}/);
    expect(redacted.phone).toBe(3);
  });

  it("redacts emails", () => {
    const { sanitized, redacted } = sanitizeText("Reach me at maria.gonzalez+adu@example.com please");
    expect(sanitized).toContain("[email]");
    expect(sanitized).not.toContain("@example.com");
    expect(redacted.email).toBe(1);
  });

  it("redacts street addresses", () => {
    const { sanitized, redacted } = sanitizeText("The property is 4821 Sierra College Blvd near the park.");
    expect(sanitized).toContain("[street_address]");
    expect(sanitized).not.toContain("4821");
    expect(redacted.street_address).toBe(1);
  });

  it("redacts APN-like identifiers", () => {
    const { sanitized, redacted } = sanitizeText("Parcel is 048-231-015 I think, APN: 048231015.");
    expect(sanitized).not.toContain("048-231-015");
    expect(redacted.parcel_apn).toBeGreaterThanOrEqual(1);
  });

  it("leaves clean text untouched", () => {
    const input = "Homeowner exploring a detached ADU, backyard access from the alley.";
    const { sanitized, redacted } = sanitizeText(input);
    expect(sanitized).toBe(input);
    expect(Object.keys(redacted)).toHaveLength(0);
  });
});
