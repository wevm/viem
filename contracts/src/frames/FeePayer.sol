// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {FrameInstructions} from "./FrameInstructions.sol";
import {IFeePayer} from "./IFeePayer.sol";

interface FeePricing {
    function quote(address token, uint256 maxCostWei) external view returns (uint256);
}

interface SignatureVerifier {
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4);
}

/// Pays ETH gas after authenticating the sponsor and its signed ERC-20 reimbursement.
contract FeePayer is IFeePayer {
    uint256 private constant TXPARAM = 3;
    uint256 private constant FRAMEDATALOAD = 14;
    uint256 private constant FRAMEPARAM = 28;
    uint256 private constant SIGPARAM = 42;
    uint256 private constant SIGDATACOPY = 56;
    uint256 private constant APPROVE_PAYMENT = 71;

    uint256 public immutable scheme;
    address public immutable signer;
    address public immutable verifier;
    FeePricing public immutable pricing;
    address private immutable instructions;

    error InvalidConfiguration();
    error InvalidApproval();
    error InvalidSignature();
    error InvalidReimbursement();

    /// Authentication is immutable; arbitrary schemes use verifier instead of signer.
    constructor(uint256 scheme_, address signer_, address verifier_, address pricing_) {
        if (scheme_ > 2 || pricing_.code.length == 0) revert InvalidConfiguration();
        if (scheme_ == 0) {
            if (signer_ != address(0) || verifier_.code.length == 0) revert InvalidConfiguration();
        } else if (signer_ == address(0) || verifier_ != address(0)) {
            revert InvalidConfiguration();
        }

        scheme = scheme_;
        signer = signer_;
        verifier = verifier_;
        pricing = FeePricing(pricing_);
        instructions = address(new FrameInstructions());
    }

    receive() external payable {}

    /// Reads prices during preparation; payment verification never re-reads mutable prices.
    function quote(address token, uint256 maxCostWei) external view returns (uint256) {
        return pricing.quote(token, maxCostWei);
    }

    /// Returns pricing and immutable authentication in one preparation read.
    function quoteAndAuthentication(address token, uint256 maxCostWei)
        external view returns (uint256 amount, uint256 scheme_, address signer_, address verifier_)
    {
        return (pricing.quote(token, maxCostWei), scheme, signer, verifier);
    }

    /// Approves gas payment after checking the canonical signature and next transfer frame.
    function pay(address token, uint256 amount) external {
        if (msg.sender != address(0xaa)) revert InvalidApproval();
        if (token == address(0) || amount == 0) revert InvalidReimbursement();

        // The default sender owns slot zero; this payer owns slot one.
        if (_read(TXPARAM, 0x0b, 0) != 2 || _read(SIGPARAM, 1, 1) != scheme || _read(SIGPARAM, 1, 2) != 0) {
            revert InvalidSignature();
        }
        if (scheme == 0) {
            uint256 length = _read(SIGPARAM, 1, 3);
            if (length == 0 || length > 4096) revert InvalidSignature();
            bytes memory witness = _execute(SIGDATACOPY, 1, length);
            bytes32 hash = bytes32(_read(TXPARAM, 8, 0));
            if (SignatureVerifier(verifier).isValidSignature(hash, witness) != 0x1626ba7e) {
                revert InvalidSignature();
            }
        } else if (_read(SIGPARAM, 1, 0) != uint160(signer)) {
            revert InvalidSignature();
        }

        uint256 current = _read(TXPARAM, 0x0a, 0);
        if (
            _read(FRAMEPARAM, current, 0) != uint160(address(this)) || _read(FRAMEPARAM, current, 2) != 1
                || _read(FRAMEPARAM, current, 3) != 1
        ) {
            revert InvalidApproval();
        }

        uint256 payment = current + 1;
        if (payment >= _read(TXPARAM, 9, 0)) revert InvalidReimbursement();
        if (
            _read(FRAMEPARAM, payment, 0) != uint160(token) || _read(FRAMEPARAM, payment, 2) != 2
                || _read(FRAMEPARAM, payment, 3) != 0 || _read(FRAMEPARAM, payment, 8) != 0
                || _read(FRAMEPARAM, payment, 4) != 68
        ) {
            revert InvalidReimbursement();
        }
        if (
            _read(FRAMEDATALOAD, payment, 0) >> 224 != 0xa9059cbb
                || _read(FRAMEDATALOAD, payment, 4) != uint160(address(this))
                || _read(FRAMEDATALOAD, payment, 36) != amount
        ) {
            revert InvalidReimbursement();
        }

        // Payment approval spends ETH even if the following token transfer fails.
        _execute(APPROVE_PAYMENT, 0, 0);
    }

    function _read(uint256 handler, uint256 first, uint256 second) private returns (uint256) {
        return abi.decode(_execute(handler, first, second), (uint256));
    }

    function _execute(uint256 handler, uint256 first, uint256 second) private returns (bytes memory result) {
        bytes memory input = abi.encode(handler, first, second);
        address target = instructions;
        assembly ("memory-safe") {
            let success := delegatecall(gas(), target, add(input, 32), mload(input), 0, 0)
            let size := returndatasize()
            result := mload(0x40)
            mstore(result, size)
            returndatacopy(add(result, 32), 0, size)
            mstore(0x40, and(add(add(result, 63), size), not(31)))
            if iszero(success) { revert(add(result, 32), size) }
        }
    }
}
