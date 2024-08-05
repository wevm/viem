// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract Event {
    event MessageEmitted(address indexed to, uint256 value, bytes data);

    function execute() external payable {
        emit MessageEmitted(msg.sender, msg.value, msg.data);
    }
}
