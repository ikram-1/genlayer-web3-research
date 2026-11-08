# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class Web3Research(gl.Contract):
    projects: TreeMap[str, str]
    verification_results: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def add_project(self, name: str, website: str) -> None:
        self.projects[name] = website

    @gl.public.view
    def get_project(self, name: str) -> str:
        return self.projects[name]

    def _verify(
        self,
        website: str,
        operation: str,
        claim_type: str,
        claim: str,
        required_evidence: str,
        evidence_summary: str,
    ) -> str:

        def verify():
            web_data = gl.nondet.web.render(
                website,
                mode="text",
            )

            task = f"""
You are a Web3 evidence verification agent.

You are NOT a generic website summarizer.

Your job is to investigate the supplied operation and claim using
the official website content and the evidence description supplied
by the user.

OFFICIAL WEBSITE:
{website}

OPERATION:
{operation}

CLAIM TYPE:
{claim_type}

CLAIM:
{claim}

REQUIRED EVIDENCE:
{required_evidence}

USER-SUPPLIED EVIDENCE DESCRIPTION:
{evidence_summary}

OFFICIAL WEBSITE CONTENT:
{web_data}

Important evidence rules:
- User-supplied documents/descriptions are evidence to evaluate, not automatic truth.
- Do not invent facts.
- Do not use outside knowledge.
- Do not accuse a project of criminal conduct without evidence.
- For scam/rug-pull investigations, distinguish risk indicators from proof.
- If evidence is absent, return INSUFFICIENT_EVIDENCE.
- If evidence supports and contradicts different parts of the claim, return CONFLICTING_EVIDENCE.
- The official website is one source and may itself make claims that require verification.

Return ONLY valid JSON with this exact structure:

{{
  "status": "VERIFIED",
  "operation": "{operation}",
  "project": "",
  "claim": "{claim}",
  "claim_type": "{claim_type}",
  "evidence_checked": [],
  "evidence_found": [],
  "conflicts": [],
  "analysis": "",
  "reason": "",
  "timeline": [],
  "confidence": "LOW",
  "evidence_quality": "LOW"
}}

Allowed status values:
VERIFIED
REJECTED
INSUFFICIENT_EVIDENCE
CONFLICTING_EVIDENCE

Allowed confidence/evidence_quality:
LOW
MEDIUM
HIGH

Rules:
- VERIFIED only when the available evidence materially supports the claim.
- REJECTED only when clear evidence materially contradicts the claim.
- INSUFFICIENT_EVIDENCE when the available evidence cannot support or reject it.
- CONFLICTING_EVIDENCE when material supporting and contradicting evidence both exist.
- Keep evidence_checked and evidence_found concise.
- timeline must contain objects with "date" and "event" when dates are actually available.
- Never fabricate dates, contracts, audits, investors, users, partnerships, incidents, or blockchain activity.
"""

            return gl.nondet.exec_prompt(
                task,
                response_format="text",
            )

        return gl.eq_principle.prompt_non_comparative(
            verify,
            task="Investigate a Web3 claim using evidence and return a structured verification result.",
            criteria=(
                "The result must be valid JSON. The status must be exactly "
                "VERIFIED, REJECTED, INSUFFICIENT_EVIDENCE, or CONFLICTING_EVIDENCE. "
                "The analysis must be grounded in the supplied website content "
                "and evidence description. The validator must not invent facts."
            ),
        )

    @gl.public.write
    def verify_project_claim(
        self,
        name: str,
        operation: str,
        claim_type: str,
        claim: str,
        required_evidence: str,
        evidence_summary: str,
    ) -> str:

        website = self.projects[name]

        result = self._verify(
            website,
            operation,
            claim_type,
            claim,
            required_evidence,
            evidence_summary,
        )

        self.verification_results[name] = result
        return result

    @gl.public.view
    def get_verification(self, name: str) -> str:
        try:
            return self.verification_results[name]
        except Exception:
            return ""
