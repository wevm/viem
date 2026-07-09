// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC7821} from "./vendor/ERC7821.sol";

/// @dev Minimal ERC-7821 batch executor (vendored solady implementation) used
/// to exercise the `erc7821` actions: self-executed call batches via EIP-7702
/// delegation, with `opData` surfaced through an event for observability.
contract Erc7821Example is ERC7821 {
    event OpData(bytes opData);

    function _execute(
        bytes32 mode,
        bytes calldata executionData,
        Call[] calldata calls,
        bytes calldata opData
    ) internal virtual override {
        mode = mode;
        executionData = executionData;

        require(msg.sender == address(this));
        if (opData.length > 0) {
            emit OpData(opData);
        }
        return _execute(calls, bytes32(0));
    }
}
