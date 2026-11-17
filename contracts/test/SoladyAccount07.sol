// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;

import {ERC4337} from "solady-6c2d0da/accounts/ERC4337.sol";

contract SoladyAccount07 is ERC4337 {
    function _domainNameAndVersion()
        internal
        pure
        override
        returns (string memory, string memory)
    {
        return ("SoladyAccount", "1");
    }
}
