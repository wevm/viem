// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Deterministic, self-hosted contract exercising write-specific calldata
/// encoding: a `payable` function (so the `value` field can be threaded and
/// asserted on-chain) and an overloaded function (so overload selection by
/// `args` can be verified). Used by the `contract.write` tests.
contract WriteExample {
    function pay() external payable {}

    function foo() external {}

    function foo(uint256 x) external returns (uint256) {
        return x;
    }

    function foo(uint256 x, uint256 y) external returns (uint256) {
        return x + y;
    }
}
