// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import {ERC4337} from "solady/accounts/ERC4337.sol";

contract SoladyAccount07 is ERC4337 {
    function _domainNameAndVersion()
        internal
        pure
        override
        returns (string memory, string memory)
    {
        return ("SoladyAccount", "1");
    }

    function forceTransferOwnership(address newOwner) public payable virtual {
        /// @solidity memory-safe-assembly
        assembly {
            if iszero(shl(96, newOwner)) {
                mstore(0x00, 0x7448fbae) // `NewOwnerIsZeroAddress()`.
                revert(0x1c, 0x04)
            }
        }
        _setOwner(newOwner);
    }
}
