pragma solidity ^0.8.17;

// SPDX-License-Identifier: UNLICENSED

// https://eips.ethereum.org/EIPS/eip-7679#counterfactual-call-contract

contract DeploylessCallViaFactory {
    error CounterfactualDeployFailed(bytes error);
    constructor(
        address to,
        bytes memory data,
        address factory, 
        bytes memory factoryData
    ) { 
        if (address(to).code.length == 0) {
            (bool success, bytes memory ret) = factory.call(factoryData);
            if (!success || address(to).code.length == 0) revert CounterfactualDeployFailed(ret);
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