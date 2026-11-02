// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;

import {ERC4337Factory} from "solady-6c2d0da/accounts/ERC4337Factory.sol";

contract SoladyAccountFactory07 is ERC4337Factory {
    constructor(address erc4337) ERC4337Factory(erc4337) {}
}
