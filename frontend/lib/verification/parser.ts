import type {
  Confidence,
  VerificationResult,
  VerificationStatus,
} from "./types";

const STATUSES: VerificationStatus[] = [
  "VERIFIED",
  "REJECTED",
  "INSUFFICIENT_EVIDENCE",
  "CONFLICTING_EVIDENCE",
];

const LEVELS: Confidence[] = ["LOW", "MEDIUM", "HIGH"];

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function parseVerificationResult(
  raw: unknown,
  fallbackClaim = "",
): VerificationResult | null {
  let value: unknown = raw;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return {
        status: "INSUFFICIENT_EVIDENCE",
        operation: "CLAIM_VERIFICATION",
        project: "",
        claim: fallbackClaim,
        claim_type: "",
        evidence_checked: [],
        evidence_found: [typeof value === "string" ? value : ""],
        conflicts: [],
        analysis: typeof value === "string" ? value : "",
        reason: "The validator returned text instead of structured JSON.",
        timeline: [],
        confidence: "LOW",
        evidence_quality: "LOW",
      };
    }
  }

  if (
    value &&
    typeof value === "object" &&
    "result" in value &&
    typeof (value as { result?: unknown }).result === "string"
  ) {
    return parseVerificationResult(
      (value as { result: string }).result,
      fallbackClaim,
    );
  }

  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  const status = cleanString(item.status) as VerificationStatus;

  if (!STATUSES.includes(status)) return null;

  const confidence = cleanString(item.confidence) as Confidence;
  const evidenceQuality = cleanString(item.evidence_quality) as Confidence;

  return {
    status,
    operation: cleanString(item.operation),
    project: cleanString(item.project),
    claim: cleanString(item.claim) || fallbackClaim,
    claim_type: cleanString(item.claim_type),
    evidence_checked: cleanStringArray(item.evidence_checked),
    evidence_found: cleanStringArray(item.evidence_found),
    conflicts: cleanStringArray(item.conflicts),
    analysis: cleanString(item.analysis),
    reason: cleanString(item.reason),
    timeline: Array.isArray(item.timeline)
      ? item.timeline
          .filter(
            (entry): entry is Record<string, unknown> =>
              Boolean(entry) && typeof entry === "object",
          )
          .map((entry) => ({
            date: cleanString(entry.date),
            event: cleanString(entry.event),
          }))
      : [],
    confidence: LEVELS.includes(confidence) ? confidence : "LOW",
    evidence_quality: LEVELS.includes(evidenceQuality)
      ? evidenceQuality
      : "LOW",
  };
}

