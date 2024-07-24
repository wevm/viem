// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {console} from "forge-std/console.sol";
import "forge-std/Test.sol";
import {SoladyAccount06} from "../../src/accounts/SoladyAccount_06.sol";
import {SoladyAccountFactory06} from "../../src/accounts/SoladyAccountFactory_06.sol";

contract Deploy is Test {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        SoladyAccount06 implementation = new SoladyAccount06{
            salt: bytes32(uint256(1337))
        }();
        new SoladyAccountFactory06{salt: bytes32(uint256(1337))}(
            address(implementation)
        );

        vm.stopBroadcast();
    }
}
