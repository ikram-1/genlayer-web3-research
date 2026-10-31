import pytest
from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


@pytest.mark.integration
def test_add_and_get_project():
    factory = get_contract_factory("Web3Research")
    contract = factory.deploy()

    add_result = contract.add_project(
        args=["GenLayer", "https://www.genlayer.com"]
    )
    assert tx_execution_succeeded(add_result)

    result = contract.get_project(args=["GenLayer"])

    assert result == "https://www.genlayer.com"