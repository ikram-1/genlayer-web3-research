"""Tests for Web3Research project storage."""


def test_add_and_get_project(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/web3_research.py")
    direct_vm.sender = direct_alice

    contract.add_project(
        "GenLayer",
        "https://www.genlayer.com"
    )

    result = contract.get_project("GenLayer")

    assert result == "https://www.genlayer.com"


def test_research_project(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/web3_research.py")
    direct_vm.sender = direct_alice

    direct_vm.mock_web(
        "https://www.genlayer.com",
        {
            "method": "GET",
            "status": 200,
            "body": """
            GenLayer is a blockchain for intelligent contracts.
            It enables smart contracts to interact with web data
            and AI models.
            """
        }
    )

    direct_vm.mock_llm(
        "Analyze this Web3 project website:",
        "GenLayer is a blockchain for intelligent contracts. "
        "It uses web data and AI models to provide intelligent "
        "contract functionality."
    )

    contract.add_project(
        "GenLayer",
        "https://www.genlayer.com"
    )

    result = contract.research_project("GenLayer")

    assert isinstance(result, str)
    assert len(result) > 0