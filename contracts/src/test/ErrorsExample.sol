// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

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

    function revertWrite() public {
        revert("This is a revert message");
    }

    function assertWrite() public {
        assert(false);
    }

    function overflowWrite() public returns (uint256) {
        uint256 a = 2 ** 256 - 1;
        uint256 b = 1;
        uint256 c = a + b;
        return c;
    }

    function divideByZeroWrite() public returns (uint256) {
        uint256 a = 69;
        uint256 b = 0;
        uint256 c = a / b;
        return c;
    }

    function requireWrite() public {
        require(false);
    }

    function simpleCustomWrite() public {
        revert SimpleError("bugger");
    }

    function complexCustomWrite() public {
        revert ComplexError(
            Foo({sender: 0x0000000000000000000000000000000000000000, bar: 69}),
            "bugger",
            69
        );
    }
}
