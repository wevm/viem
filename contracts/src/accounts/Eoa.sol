// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ECDSA} from "solady/utils/ECDSA.sol";

/// @dev Contract that requires initialization (required init data case)
contract Eoa {
    /// @dev Flag that determines if signature verification is enabled.
    /// Must be initialized via `initialize()` for signatures to pass.
    bool public isInitialized;

    /// @dev Initializes the contract to enable signature verification.
    /// This function represents the initialization data that would be
    /// executed during ERC-8010 pre-delegation verification.
    function initialize() external {
        isInitialized = true;
    }

    /// @dev Validates the signature with ERC1271 return.
    /// This enables the EOA to still verify regular ECDSA signatures if the contract
    /// checks that it has code and calls this function instead of `ecrecover`.
    /// Signatures will only pass if the contract has been initialized.
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) public view virtual returns (bytes4 result) {
        // Only validate signatures if initialized
        if (!isInitialized) {
            return 0xffffffff;
        }

        bool success = ECDSA.recoverCalldata(hash, signature) == address(this);
        /// @solidity memory-safe-assembly
        assembly {
            // `success ? bytes4(keccak256("isValidSignature(bytes32,bytes)")) : 0xffffffff`.
            // We use `0xffffffff` for invalid, in convention with the reference implementation.
            result := shl(224, or(0x1626ba7e, sub(0, iszero(success))))
        }
    }
}
