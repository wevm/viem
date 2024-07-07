// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC4337} from "solady-dc09481/accounts/ERC4337.sol";

contract Mock4337Account06 is ERC4337 {
    function _domainNameAndVersion()
        internal
        pure
        override
        returns (string memory, string memory)
    {
        return ("Mock4337Account", "1");
    }
}
