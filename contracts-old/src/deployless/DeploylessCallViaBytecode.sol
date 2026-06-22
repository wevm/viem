pragma solidity ^0.8.17;

// SPDX-License-Identifier: UNLICENSED

contract DeploylessCallViaBytecode {
    constructor(
        bytes memory bytecode,
        bytes memory data
    ) { 
        address to;
        assembly {
            to := create2(0, add(bytecode, 0x20), mload(bytecode), 0)
            if iszero(extcodesize(to)) {
                revert(0, 0)
            }
        }

        assembly {
            let success := call(gas(), to, 0, add(data, 0x20), mload(data), 0, 0)
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, returndatasize())
            if iszero(success) {
                revert(ptr, returndatasize())
            }
            return(ptr, returndatasize())
        }
    }
}