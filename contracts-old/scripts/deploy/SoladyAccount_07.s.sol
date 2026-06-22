// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {console} from "forge-std/console.sol";
import "forge-std/Test.sol";
import {SoladyAccount07} from "../../src/accounts/SoladyAccount_07.sol";
import {SoladyAccountFactory07} from "../../src/accounts/SoladyAccountFactory_07.sol";

contract Deploy is Test {
    function run() external {
        vm.startBroadcast(vm.envUint("PRIVATE_KEY"));

        SoladyAccount07 implementation = new SoladyAccount07{
            salt: bytes32(uint256(1337))
        }();
        new SoladyAccountFactory07{salt: bytes32(uint256(1337))}(
            address(implementation)
        );

        vm.stopBroadcast();
    }
}
