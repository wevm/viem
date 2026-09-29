// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

abstract contract FundingRead {
    /// @dev Bound copied return data and preserve errors from the funding contracts.
    function query(address target, bytes memory data) internal view returns (bytes memory result) {
        bool success;
        uint256 size;
        assembly {
            success := staticcall(gas(), target, add(data, 32), mload(data), 0, 0)
            size := returndatasize()
        }
        require(size <= 1048576, "Funding return data exceeds limit");
        result = new bytes(size);
        assembly {
            returndatacopy(add(result, 32), 0, size)
            if iszero(success) { revert(add(result, 32), size) }
        }
    }
}

/// @notice Reads access-key authority and its current policy commitment in one call.
contract FundingPreflight is FundingRead {
    struct Policy {
        address[] admins;
        bytes32 rulesHash;
    }

    constructor(address keychain, address policies, address account, address keyId, uint64 proposedPolicy) {
        bytes memory metadata = query(keychain, abi.encodeWithSignature("getKey(address,address)", account, keyId));
        (, address installedKey,,, bool revoked) = abi.decode(metadata, (uint8, address, uint64, bool, bool));
        uint64 policyId = proposedPolicy;
        if (installedKey == keyId && !revoked) {
            policyId = abi.decode(
                query(keychain, abi.encodeWithSignature("getFundingPolicyId(address,address)", account, keyId)),
                (uint64)
            );
        }
        bytes32 rulesHash;
        if (policyId != 0 && !revoked) {
            rulesHash =
            abi.decode(query(policies, abi.encodeWithSignature("getPolicy(uint64)", policyId)), (Policy)).rulesHash;
        }
        bytes memory result = abi.encode(block.number, block.timestamp, metadata, policyId, rulesHash);
        assembly { return(add(result, 32), mload(result)) }
    }
}

/// @notice Discovers multiple output routes against the same read-only state.
contract FundingDiscover is FundingRead {
    constructor(address discovery, bytes[] memory calls) {
        require(calls.length <= 64, "Funding batch exceeds limit");
        bytes[] memory results = new bytes[](calls.length);
        uint256 size = 64 + 64 * calls.length;
        for (uint256 i; i < calls.length; ++i) {
            results[i] = query(discovery, calls[i]);
            size += (results[i].length + 31) & ~uint256(31);
            require(size <= 1048576, "Funding batch return data exceeds limit");
        }
        bytes memory result = abi.encode(results);
        assembly { return(add(result, 32), mload(result)) }
    }
}
