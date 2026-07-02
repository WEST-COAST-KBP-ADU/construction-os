/**
 * OwnerReview packet candidate builder — text-mode intake lab (TASK-0003).
 *
 * Implements `create_ownerreview_packet` (DR-0006, effect class: local_write).
 * A packet is ALWAYS a candidate: nothing here executes, contacts anyone, or
 * persists anything. Priority is an internal, deterministic prioritization —
 * never a feasibility, entitlement, or approval statement.
 *
 * LAB STATUS: synthetic data only. Not production-authorized.
 */

import { screenResponse } from "./guardrails";
import type { IntakeArtifact } from "./intakeArtifact";

export type CandidatePriority = "high" | "medium" | "low";

export type OwnerReviewPacket = {
  packetId: string;
  status: "candidate";
  source: "text_lab";
  createdAt: string;
  classification: {
    inquiryType: IntakeArtifact["inquiryType"];
    priority: CandidatePriority;
    reasoning: string[];
  };
  summarySanitized: string;
  missingInformation: string[];
  /** Single next action; executing it requires owner approval. */
  proposedNextAction: string;
  restrictedClaimCheck: {
    passed: boolean;
    findings: string[];
  };
};

const CORE_SERVICES: IntakeArtifact["inquiryType"][] = [
  "adu",
  "garage_conversion",
  "residential_gc",
];

const IN_AREA: IntakeArtifact["jurisdictionCategory"][] = [
  "roseville",
  "rocklin",
  "lincoln",
  "folsom",
  "granite_bay",
  "el_dorado_hills",
  "citrus_heights",
  "sacramento_region_other",
];

/**
 * Deterministic lab heuristic for internal prioritization. Documented rules,
 * no model in the loop, identical output for identical input.
 */
function classifyPriority(a: IntakeArtifact): { priority: CandidatePriority; reasoning: string[] } {
  const reasoning: string[] = [];
  let score = 0;

  if (CORE_SERVICES.includes(a.inquiryType)) {
    score += 2;
    reasoning.push(`core service inquiry (${a.inquiryType})`);
  } else {
    reasoning.push(`non-core inquiry (${a.inquiryType})`);
  }

  if (IN_AREA.includes(a.jurisdictionCategory)) {
    score += 2;
    reasoning.push(`inside service area (${a.jurisdictionCategory})`);
  } else if (a.jurisdictionCategory === "outside_service_area") {
    score -= 2;
    reasoning.push("outside service area");
  } else {
    reasoning.push("jurisdiction unknown — requires official source verification");
  }

  if (a.timelineCategory === "ready_now") {
    score += 2;
    reasoning.push("timeline: ready now");
  } else if (a.timelineCategory === "planning_this_year") {
    score += 1;
    reasoning.push("timeline: planning this year");
  } else {
    reasoning.push(`timeline: ${a.timelineCategory}`);
  }

  if (a.budgetBand === "100k_250k" || a.budgetBand === "over_250k") {
    score += 1;
    reasoning.push(`budget band disclosed (${a.budgetBand})`);
  }

  const priority: CandidatePriority = score >= 5 ? "high" : score >= 3 ? "medium" : "low";
  return { priority, reasoning };
}

/**
 * Build an OwnerReview packet candidate from a sanitized intake artifact.
 * The packet re-screens its own text through the guardrails so a restricted
 * claim can never ride into owner review unnoticed.
 */
export function buildOwnerReviewPacket(artifact: IntakeArtifact): OwnerReviewPacket {
  const { priority, reasoning } = classifyPriority(artifact);

  const missingInformation = [...artifact.missingInfo];
  if (artifact.jurisdictionCategory === "unknown") {
    missingInformation.push("Jurisdiction unconfirmed. Requires official source verification.");
  }
  if (artifact.budgetBand === "undisclosed") {
    missingInformation.push("Budget range not discussed.");
  }

  const proposedNextAction =
    priority === "low" && artifact.jurisdictionCategory === "outside_service_area"
      ? "Owner decision: decline politely or refer out (outside service area)."
      : "Owner decision: approve a follow-up call to the inquirer.";

  const claimScreen = screenResponse(artifact.summarySanitized);

  return {
    packetId: `ORP-text_lab-${artifact.testVariantId}`,
    status: "candidate",
    source: "text_lab",
    createdAt: artifact.createdAt,
    classification: {
      inquiryType: artifact.inquiryType,
      priority,
      reasoning,
    },
    summarySanitized: artifact.summarySanitized,
    missingInformation,
    proposedNextAction,
    restrictedClaimCheck: {
      passed: claimScreen.verdict === "pass",
      findings: claimScreen.findings.map((f) => f.ruleId),
    },
  };
}
