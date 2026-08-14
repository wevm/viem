// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract StaticCall {
    constructor(address target, bytes memory data) {
        assembly {
            if iszero(staticcall(gas(), target, add(data, 0x20), mload(data), 0, 0)) {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
            returndatacopy(0, 0, returndatasize())
            return(0, returndatasize())
        }
    }
}
