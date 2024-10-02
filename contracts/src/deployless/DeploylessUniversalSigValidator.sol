pragma solidity ^0.8.17;

// SPDX-License-Identifier: UNLICENSED

// https://github.com/AmbireTech/signature-validator
import { VerifySig } from "../UniversalSigValidator.sol";

contract DeploylessVerifySig is VerifySig {
    constructor(address _signer, bytes32 _hash, bytes memory _signature) {
        bool isValidSig = isValidUniversalSig(_signer, _hash, _signature);
        assembly {
            mstore(0, isValidSig)
            return(31, 1)
        }
    }
}
