// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {FeeTokenQuote, PriceFeed} from "../../src/frames/FeeTokenQuote.sol";

// Uses actual mainnet feed contracts on a pinned fork. No oracle substitutions.
contract FeeTokenQuoteTest is FeeTokenQuote {
    constructor()
        FeeTokenQuote(
            0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
            6,
            PriceFeed(0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419),
            PriceFeed(0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6),
            2 hours,
            2 days
        )
    {}

    function test_real_feeds() public view {
        uint256 amount = this.quote(token, 0.001 ether);
        require(amount == 2_657_314);
        require(this.quote(token, 0) == 0);
        require(this.quote(token, 0.002 ether) >= amount * 2 - 1);
    }

    function test_price_changes() public pure {
        require(convert(0.001 ether, 2000e8, 8, 1e8, 8, 6) == 2_000_000);
        require(convert(0.001 ether, 3000e8, 8, 1e8, 8, 6) == 3_000_000);
        require(convert(0.001 ether, 2000e8, 8, 5e7, 8, 6) == 4_000_000);
    }

    function test_mixed_decimals() public pure {
        require(convert(0.001 ether, 2000e18, 18, 1e6, 6, 6) == 2_000_000);
        require(convert(0.001 ether, 2000e6, 6, 1e18, 18, 18) == 2e18);
    }

    function test_rounding() public pure {
        require(convert(1, 2000e8, 8, 1e8, 8, 6) == 1);
        require(convert(0.001 ether, 2000e8, 8, 3e8, 8, 6) == 666_667);
    }

    function checkPrice(int256 price, uint256 updatedAt, uint256 maxAge, uint256 now_) external pure {
        validate(price, updatedAt, maxAge, now_);
    }

    function test_invalid_prices() public view {
        rejects(0, 100, 10, 100, InvalidPrice.selector);
        rejects(-1, 100, 10, 100, InvalidPrice.selector);
        rejects(1, 0, 10, 100, InvalidPrice.selector);
        rejects(1, 101, 10, 100, InvalidPrice.selector);
        rejects(1, 89, 10, 100, StalePrice.selector);
        this.checkPrice(1, 90, 10, 100);
    }

    function rejects(int256 price, uint256 updatedAt, uint256 age, uint256 now_, bytes4 expected) internal view {
        (bool success, bytes memory result) =
            address(this).staticcall(abi.encodeCall(this.checkPrice, (price, updatedAt, age, now_)));
        require(!success && bytes4(result) == expected);
    }

    function test_unsupported_token() public view {
        (bool success, bytes memory result) =
            address(this).staticcall(abi.encodeCall(this.quote, (address(1), 1 ether)));
        require(!success && bytes4(result) == UnsupportedToken.selector);
    }
}
