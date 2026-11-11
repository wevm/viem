// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @dev Contract whose `isValidSignature` reverts with the ERC1271 magic value as revert data.
contract EoaReverting {
    function isValidSignature(
        bytes32,
        bytes calldata
    ) public view virtual returns (bytes4) {
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, shl(224, 0x1626ba7e))
            revert(0x00, 0x04)
        }
    }
}
