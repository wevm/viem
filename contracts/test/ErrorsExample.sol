// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Deterministic, self-hosted contract exercising every revert shape a
/// read action can surface: string reverts (`Error(string)`), panics
/// (`assert`/overflow/divide-by-zero), bare `require`, and custom errors with
/// and without arguments. Used by the contract-error tests.
contract ErrorsExample {
    struct Foo {
        address sender;
        uint256 bar;
    }

    error SimpleError(string message);
    error SimpleErrorNoArgs();
    error ComplexError(Foo foo, string message, uint256 number);

    function revertRead() public pure {
        revert("This is a revert message");
    }

    function assertRead() public pure {
        assert(false);
    }

    function overflowRead() public pure returns (uint256) {
        uint256 a = 2 ** 256 - 1;
        uint256 b = 1;
        uint256 c = a + b;
        return c;
    }

    function divideByZeroRead() public pure returns (uint256) {
        uint256 a = 69;
        uint256 b = 0;
        uint256 c = a / b;
        return c;
    }

    function requireRead() public pure {
        require(false);
    }

    function simpleCustomRead() public pure {
        revert SimpleError("bugger");
    }

    function simpleCustomReadNoArgs() public pure {
        revert SimpleErrorNoArgs();
    }

    function complexCustomRead() public pure {
        revert ComplexError(
            Foo({sender: 0x0000000000000000000000000000000000000000, bar: 69}),
            "bugger",
            69
        );
    }
}
