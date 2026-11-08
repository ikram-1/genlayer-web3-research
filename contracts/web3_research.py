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

    def _verify_claim(
        self,
        website: str,
        claim: str,
        required_evidence: str,
    ) -> str:

        def verify():
            web_data = gl.nondet.web.render(
                website,
                mode="text",
            )

            task = f"""
You are a Web3 project verification agent.

Your task is NOT to summarize the website.

You must verify a specific claim about a Web3 project using
evidence found on its official website.

OFFICIAL WEBSITE:
{website}

WEBSITE CONTENT:
{web_data}

CLAIM TO VERIFY:
{claim}

REQUIRED EVIDENCE:
{required_evidence}

Evaluate the claim using ONLY evidence contained in the
provided official website content.

Return ONLY valid JSON in exactly this structure:

{{
  "verdict": "VERIFIED",
  "claim": "{claim}",
  "evidence": "A concise description of the evidence found.",
  "reason": "Why the evidence supports or does not support the claim."
}}

The verdict MUST be exactly one of:

VERIFIED
REJECTED
INSUFFICIENT_EVIDENCE

Rules:

VERIFIED:
Use this only when the website contains clear evidence
supporting the claim and the required evidence is present.

REJECTED:
Use this when the website contains clear evidence that
contradicts the claim.

INSUFFICIENT_EVIDENCE:
Use this when the website does not provide enough evidence
to verify or reject the claim.

Do not guess.
Do not use outside knowledge.
Do not infer facts that are not supported by the website.
"""

            return gl.nondet.exec_prompt(task, response_format="text")

        result = gl.eq_principle.prompt_non_comparative(
            verify,
            task=(
                "Verify a specific Web3 project claim using "
                "evidence from the project's official website."
            ),
            criteria=(
                "The verdict must be based only on evidence from "
                "the official website. The result must use exactly "
                "one of VERIFIED, REJECTED, or INSUFFICIENT_EVIDENCE. "
                "The evidence must directly relate to the claim "
                "and required evidence. The validator must not "
                "invent or infer unsupported facts."
            ),
        )

        return result

    @gl.public.write
    def verify_project_claim(
        self,
        name: str,
        claim: str,
        required_evidence: str,
    ) -> str:

        website = self.projects[name]

        result = self._verify_claim(
            website,
            claim,
            required_evidence,
        )

        self.verification_results[name] = result

        return result

    @gl.public.view
    def get_verification(self, name: str) -> str:
        try:
            return self.verification_results[name]
        except Exception:
            return ""