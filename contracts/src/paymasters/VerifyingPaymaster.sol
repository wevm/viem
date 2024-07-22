// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {VerifyingPaymaster as VerifyingPaymaster_} from "account-abstraction/samples/VerifyingPaymaster.sol";

contract VerifyingPaymaster is VerifyingPaymaster_ {
    constructor(
        IEntryPoint entryPoint,
        address verifyingSigner
    ) VerifyingPaymaster_(entryPoint, verifyingSigner) {}
}
