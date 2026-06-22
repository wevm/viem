// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Minimal ERC-5267 implementation exposing a static `eip712Domain` so the
/// `getEip712Domain` action can be exercised against deterministic data.
contract Eip712 {
    function eip712Domain()
        external
        view
        returns (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainId,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        )
    {
        return (
            hex"0f",
            "ExampleContract",
            "1",
            block.chainid,
            address(this),
            bytes32(0),
            new uint256[](0)
        );
    }
}
