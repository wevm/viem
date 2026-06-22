// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Minimal ERC-721-shaped contract used as a deterministic, self-hosted
/// stand-in for the mainnet `wagmi`/`bayc` deployments that tests previously
/// relied on. `name`/`symbol` occupy storage slots 0 and 1 so `getStorageAt`
/// reads are stable; `mint`/`setApprovalForAll` succeed returning no data; and
/// `ownerOf` reverts for a nonexistent token so error paths (e.g.
/// `CallExecutionError`) can be exercised. Unknown selectors revert (no
/// fallback), which the multicall batch tests rely on.
contract ERC721 {
    string public name = "wagmi";
    string public symbol = "WAGMI";

    function mint() external {}

    function setApprovalForAll(address, bool) external {}

    function totalSupply() external pure returns (uint256) {
        return 1;
    }

    function ownerOf(uint256) external pure returns (address) {
        revert();
    }
}
