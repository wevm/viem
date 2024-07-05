// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC4337Factory} from "solady-0.6/accounts/ERC4337Factory.sol";

contract Mock4337AccountFactory06 is ERC4337Factory {
    constructor(address erc4337) ERC4337Factory(erc4337) {}
}
