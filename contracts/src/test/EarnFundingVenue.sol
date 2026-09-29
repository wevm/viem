// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EarnFundingVenue is ERC4626 {
    constructor(IERC20 asset_) ERC20("Earn Funding Test Vault", "eftVAULT") ERC4626(asset_) {}

    function donate(uint256 assets) external {
        require(IERC20(asset()).transferFrom(msg.sender, address(this), assets));
    }
}
