// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {ECDSA} from "solady/utils/ECDSA.sol";
import {Eoa} from "./Eoa.sol";

/// @dev Contract that initializes the EOA.
contract EoaInitializer {
    /// @dev Initializes an EOA.
    function initialize(address eoa) external {
        Eoa(eoa).initialize();
    }
}
