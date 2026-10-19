// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract StaticCall {
    function query(address target, bytes calldata data) external view {
        assembly {
            calldatacopy(0, data.offset, data.length)
            if iszero(staticcall(gas(), target, 0, data.length, 0, 0)) {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
            returndatacopy(0, 0, returndatasize())
            return(0, returndatasize())
        }
    }
}
