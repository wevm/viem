// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract EIP7702 {
    event WeGucci(address indexed from, bytes indexed data);

    function exec(bytes calldata data) public {
        emit WeGucci(msg.sender, data);
        return;
    }
}
