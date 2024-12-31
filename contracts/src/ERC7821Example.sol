pragma solidity ^0.8.17;

// SPDX-License-Identifier: UNLICENSED

import "solady/accounts/ERC7821.sol";

contract ERC7821Example is ERC7821 {
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
