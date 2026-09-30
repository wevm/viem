// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface PriceFeed {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

/// Quotes token reimbursement from USD price feeds during transaction preparation.
contract FeeTokenQuote {
    address public immutable token;
    uint8 public immutable tokenDecimals;
    PriceFeed public immutable ethUsd;
    PriceFeed public immutable tokenUsd;
    uint256 public immutable ethMaxAge;
    uint256 public immutable tokenMaxAge;

    error InvalidConfiguration();
    error UnsupportedToken();
    error InvalidPrice();
    error StalePrice();
    error UnsupportedDecimals();

    constructor(
        address token_,
        uint8 tokenDecimals_,
        PriceFeed ethUsd_,
        PriceFeed tokenUsd_,
        uint256 ethMaxAge_,
        uint256 tokenMaxAge_
    ) {
        if (
            token_ == address(0) || address(ethUsd_).code.length == 0 || address(tokenUsd_).code.length == 0
                || ethMaxAge_ == 0 || tokenMaxAge_ == 0
        ) {
            revert InvalidConfiguration();
        }
        if (tokenDecimals_ > 18) revert UnsupportedDecimals();

        token = token_;
        tokenDecimals = tokenDecimals_;
        ethUsd = ethUsd_;
        tokenUsd = tokenUsd_;
        ethMaxAge = ethMaxAge_;
        tokenMaxAge = tokenMaxAge_;
    }

    function quote(address token_, uint256 maxCostWei) external view returns (uint256) {
        if (token_ != token) revert UnsupportedToken();

        (, int256 ethPrice,, uint256 ethUpdatedAt,) = ethUsd.latestRoundData();
        (, int256 tokenPrice,, uint256 tokenUpdatedAt,) = tokenUsd.latestRoundData();
        validate(ethPrice, ethUpdatedAt, ethMaxAge, block.timestamp);
        validate(tokenPrice, tokenUpdatedAt, tokenMaxAge, block.timestamp);

        return convert(
            maxCostWei, uint256(ethPrice), ethUsd.decimals(), uint256(tokenPrice), tokenUsd.decimals(), tokenDecimals
        );
    }

    function validate(int256 price, uint256 updatedAt, uint256 maxAge, uint256 now_) internal pure {
        if (price <= 0 || updatedAt == 0 || updatedAt > now_) revert InvalidPrice();
        if (now_ - updatedAt > maxAge) revert StalePrice();
    }

    function convert(
        uint256 weiCost,
        uint256 ethPrice,
        uint8 ethDecimals,
        uint256 tokenPrice,
        uint8 priceDecimals,
        uint8 decimals_
    ) internal pure returns (uint256) {
        if (ethDecimals > 18 || priceDecimals > 18 || decimals_ > 18) revert UnsupportedDecimals();
        if (ethPrice == 0 || tokenPrice == 0) revert InvalidPrice();

        // Checked arithmetic rejects extreme inputs; preserve precision until the final division.
        uint256 numerator = weiCost * ethPrice * 10 ** (uint256(priceDecimals) + decimals_);
        uint256 denominator = tokenPrice * 10 ** (uint256(ethDecimals) + 18);
        return numerator / denominator + (numerator % denominator == 0 ? 0 : 1);
    }
}
