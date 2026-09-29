// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFundingInferenceToken {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract FundingInference {
    function revertWithData(bytes memory data) external pure {
        assembly { revert(add(data, 32), mload(data)) }
    }

    function roundTrip(IFundingInferenceToken token) external {
        token.transferFrom(msg.sender, address(this), 100);
        token.transfer(msg.sender, 90);
        token.transferFrom(msg.sender, address(this), 20);
    }

    function receiveFirst(IFundingInferenceToken token) external {
        token.transfer(msg.sender, 100);
        token.transferFrom(msg.sender, address(this), 100);
    }

    function sweep(IFundingInferenceToken token) external {
        token.transferFrom(msg.sender, address(this), token.balanceOf(msg.sender));
    }

    function checkBalance(IFundingInferenceToken token) external view {
        require(token.balanceOf(msg.sender) >= 100, "balance too low");
    }

    function remainingBalance(IFundingInferenceToken token) external {
        token.transferFrom(msg.sender, address(this), 100);
        require(token.balanceOf(msg.sender) >= 1, "no remaining balance");
    }

    function caughtTransfer(IFundingInferenceToken token) external {
        try token.transfer(msg.sender, 10000) {} catch {}
        token.transferFrom(msg.sender, address(this), 20);
    }

    function caughtRevert(IFundingInferenceToken token) external {
        try this.revertAfterTransfer(token, msg.sender) {} catch {}
        token.transferFrom(msg.sender, address(this), 20);
    }

    function revertAfterTransfer(IFundingInferenceToken token, address from) external {
        token.transferFrom(from, address(this), 100);
        revert("payment rejected");
    }
}
