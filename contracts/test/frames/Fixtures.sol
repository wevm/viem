// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {FrameInstructions} from "../../src/frames/FrameInstructions.sol";

contract FrameToken {
    mapping(address => uint256) public balanceOf;

    constructor(address owner) {
        balanceOf[owner] = 1_000_000_000;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        return true;
    }
}

contract FrameFixedQuote {
    function quote(address, uint256 cost) external pure returns (uint256) {
        return cost / 500_000_000 + (cost % 500_000_000 == 0 ? 0 : 1);
    }
}

contract FrameSignatureVerifier {
    address public immutable owner;

    constructor(address owner_) {
        owner = owner_;
    }

    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4) {
        if (signature.length != 96) return 0xffffffff;
        (bytes32 r, bytes32 s, uint8 v) = abi.decode(signature, (bytes32, bytes32, uint8));
        if (v > 1 || uint256(s) > 0x7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0) {
            return 0xffffffff;
        }
        return ecrecover(hash, v + 27, r, s) == owner ? bytes4(0x1626ba7e) : bytes4(0xffffffff);
    }
}


contract FrameWitnessReader {
    address private immutable instructions = address(new FrameInstructions());

    function check(uint256 index, bytes4 expected) external {
        (bool success, bytes memory witness) = instructions.delegatecall(abi.encode(56, index, 4));
        require(success && bytes4(witness) == expected, "Unexpected witness");
    }
}


contract FrameVariableCostToken {
    mapping(address => uint256) public balanceOf;
    uint256 public transferred;

    constructor(address owner) {
        balanceOf[owner] = 1_000_000_000;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        if (amount > 1) transferred += amount;
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        return true;
    }
}
