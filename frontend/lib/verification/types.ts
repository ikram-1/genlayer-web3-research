export type VerificationStatus =
  | "VERIFIED"
  | "REJECTED"
  | "INSUFFICIENT_EVIDENCE"
  | "CONFLICTING_EVIDENCE";

export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export type VerificationOperation =
  | "CLAIM_VERIFICATION"
  | "SECURITY_INCIDENT"
  | "SCAM_INVESTIGATION"
  | "FAILURE_INVESTIGATION"
  | "AIRDROP_VERIFICATION"
  | "NFT_VERIFICATION"
  | "ONCHAIN_VERIFICATION";

export type EvidenceSourceType =
  | "user_document"
  | "official_source"
  | "independent_source"
  | "onchain"
  | "archived_source"
  | "security_report";

export interface EvidenceItem {
  source_type: EvidenceSourceType;
  title: string;
  url?: string;
  description?: string;
  hash?: string;
}

export interface TimelineItem {
  date: string;
  event: string;
}

export interface VerificationResult {
  status: VerificationStatus;
  operation: string;
  project: string;
  claim: string;
  claim_type: string;
  evidence_checked: string[];
  evidence_found: string[];
  conflicts: string[];
  analysis: string;
  reason: string;
  timeline: TimelineItem[];
  confidence: Confidence;
  evidence_quality: Confidence;
}

export interface VerificationInput {
  projectName: string;
  website: string;
  operation: VerificationOperation;
  claimType: string;
  claim: string;
  requiredEvidence: string;
  evidenceSummary: string;
  evidenceItems: EvidenceItem[];
}
