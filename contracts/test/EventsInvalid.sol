// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Emits a `Transfer` event with the same signature as the standard
/// ERC-20 event (`Transfer(address,address,uint256)`, identical topic0) but a
/// non-conforming indexing layout: only `from` is indexed, so the standard
/// two-indexed `Transfer` definition mismatches it. Used to exercise the
/// `strict` filtering path of log-reading actions.
contract EventsInvalid {
    event Transfer(address indexed from, address to, uint256 value);

    function emitTransfer(address from, address to, uint256 value) external {
        emit Transfer(from, to, value);
    }
}
