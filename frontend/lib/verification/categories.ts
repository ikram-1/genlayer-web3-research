import type { VerificationOperation } from "./types";

export const CLAIM_CATEGORIES = [
  "Token & Tokenomics",
  "Smart Contracts",
  "Security & Audits",
  "Blockchain & Infrastructure",
  "Governance",
  "Funding & Investors",
  "Partnerships & Integrations",
  "Metrics & Adoption",
  "DeFi",
  "Technology & Product",
  "Team & Organization",
  "Documentation & Compliance",
  "Roadmap & Milestones",
  "Airdrops",
  "NFTs",
] as const;

export const OPERATION_OPTIONS: Array<{
  value: VerificationOperation;
  label: string;
  description: string;
}> = [
  {
    value: "CLAIM_VERIFICATION",
    label: "Verify a Claim",
    description: "Check a specific factual claim against available evidence.",
  },
  {
    value: "SECURITY_INCIDENT",
    label: "Investigate an Incident",
    description: "Investigate hacks, exploits, bridge attacks, or access incidents.",
  },
  {
    value: "SCAM_INVESTIGATION",
    label: "Investigate a Scam",
    description: "Assess risk indicators and evidence without treating suspicion as proof.",
  },
  {
    value: "FAILURE_INVESTIGATION",
    label: "Analyze a Failed Project",
    description: "Investigate shutdowns, failures, funding issues, or token collapse.",
  },
  {
    value: "AIRDROP_VERIFICATION",
    label: "Verify an Airdrop",
    description: "Check eligibility, snapshot, allocation, contract, and official claim information.",
  },
  {
    value: "NFT_VERIFICATION",
    label: "Verify an NFT",
    description: "Check collection authenticity, contract, metadata, supply, and claims.",
  },
  {
    value: "ONCHAIN_VERIFICATION",
    label: "Check Onchain Evidence",
    description: "Use the project claim as the starting point for onchain verification.",
  },
];

export const INVESTIGATION_TYPES = [
  "Hacks / Exploits",
  "Bridge Attacks",
  "Wallet Compromise",
  "Oracle Manipulation",
  "Governance Attack",
  "Exchange Incident",
  "Insider / Access Compromise",
  "Phishing / Social Engineering",
  "Rug Pull",
  "Fake Project",
  "Fake Audit",
  "Fake Partnership",
  "Impersonation",
  "Liquidity Removal",
  "Insider Dump",
  "Suspicious Wallet Movement",
  "Token Manipulation",
  "Funding Failure",
  "Technical Failure",
  "Low Adoption",
  "Regulatory Issue",
  "Team Decision",
  "Competition",
  "Token Collapse",
  "Insolvency",
  "Unknown",
] as const;
