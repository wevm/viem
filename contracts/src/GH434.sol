// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract GH434 {
    function foo() public pure returns (uint256 a, bool b) {
        return (42069, true);
    }

    function bar() public pure returns (string memory) {
        return "hi";
    }

    function baz() public pure returns (uint256) {
        return 69420;
    }
}
