// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract GlobalMsgExample {
    function getMsgSender() public view returns (address) {
        return msg.sender;
    }
}
