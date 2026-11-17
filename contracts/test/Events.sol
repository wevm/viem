// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Emits deterministic, self-hosted events so log-reading actions
/// (`getLogs` and friends) can be exercised without relying on mainnet
/// deployments. `Transfer`/`Approval` mirror the ERC-20 event shapes (two
/// indexed topics + one non-indexed word) and `Message` carries only
/// non-indexed data, covering both indexed-arg filtering and data decoding.
contract Events {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Message(string message);

    function emitTransfer(address from, address to, uint256 value) external {
        emit Transfer(from, to, value);
    }

    function emitApproval(
        address owner,
        address spender,
        uint256 value
    ) external {
        emit Approval(owner, spender, value);
    }

    function emitMessage(string calldata message) external {
        emit Message(message);
    }
}
