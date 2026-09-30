// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// Frame instructions missing from Solidity's inline assembly vocabulary.
/// Call through delegatecall to retain the payer's address for APPROVE.
contract FrameInstructions {
    constructor() {
        // Calldata contains the handler offset, first operand, and second operand.
        bytes memory runtime = bytes.concat(
            hex"5f3556", // Jump to the requested handler.
            hex"5b602035b05f5260205ff3", // 3: TXPARAM(first), return word.
            hex"5b602035604035b15f5260205ff3", // 14: FRAMEDATALOAD(first, second).
            hex"5b604035602035b35f5260205ff3", // 28: FRAMEPARAM(first, second).
            hex"5b604035602035b45f5260205ff3", // 42: SIGPARAM(first, second).
            hex"5b6020356040355f5fb56040355ff3", // 56: Copy and return second bytes from signature first.
            hex"5b60015f5faa00" // 71: APPROVE_PAYMENT with empty return data.
        );
        assembly ("memory-safe") {
            return(add(runtime, 32), mload(runtime))
        }
    }
}
