import pytest
from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


@pytest.mark.integration
def test_add_and_get_project():
    factory = get_contract_factory("Web3Research")
    contract = factory.deploy()

    add_result = contract.add_project(
        args=["GenLayer", "https://www.genlayer.com"]
    ).transact()

    assert tx_execution_succeeded(add_result)

    result = contract.get_project(
        args=["GenLayer"]
    ).call()

    assert result == "https://www.genlayer.com"


@pytest.mark.integration
def test_verify_project_claim_v2():
    factory = get_contract_factory("Web3Research")
    contract = factory.deploy()

    add_result = contract.add_project(
        args=["GenLayer", "https://www.genlayer.com"]
    ).transact()

    assert tx_execution_succeeded(add_result)

    verify_result = contract.verify_project_claim(
        args=[
            "GenLayer",
            "CLAIM_VERIFICATION",
            "Technology & Product",
            "GenLayer enables smart contracts to interact with web data.",
            "Official GenLayer website evidence stating that smart contracts can interact with web data.",
            "The official GenLayer website should contain evidence supporting this claim.",
        ]
    ).transact()

    assert tx_execution_succeeded(verify_result)

    result = contract.get_verification(
        args=["GenLayer"]
    ).call()

    assert result

    print("\nGET_VERIFICATION RESULT:", repr(result))