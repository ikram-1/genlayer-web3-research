# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class Web3Research(gl.Contract):
    projects: TreeMap[str, str]
    research_results: TreeMap[str, str]

    def __init__(self):
        pass

    @gl.public.write
    def add_project(self, name: str, website: str) -> None:
        self.projects[name] = website

    @gl.public.view
    def get_project(self, name: str) -> str:
        return self.projects[name]

    def _research_project(self, website: str) -> str:
        def research():
            web_data = gl.nondet.web.render(
                website,
                mode="text"
            )

            task = f"""
Analyze this Web3 project website:

{web_data}

Give a short summary of the project and explain:

1. What the project does
2. Its main technology
3. Its main use case

Return only plain text.
"""

            return gl.nondet.exec_prompt(task)

        result = gl.eq_principle.prompt_non_comparative(
            research,
            task="Analyze the provided Web3 project website and return an accurate summary.",
            criteria=(
                "The answer must be based only on the website content "
                "and must accurately describe the project's purpose, "
                "technology, and main use case."
            )
        )

        return result

    @gl.public.write
    def research_project(self, name: str) -> str:
        website = self.projects[name]

        result = self._research_project(website)

        self.research_results[name] = result

        return result

    @gl.public.view
    def get_research(self, name: str) -> str:
        return self.research_results[name]