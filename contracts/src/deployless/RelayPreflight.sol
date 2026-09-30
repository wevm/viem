// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Reads fee-token balances and virtual recipients in one eth_call.
contract RelayPreflight {
    constructor(
        address account,
        address feeManager,
        address[] memory tokens,
        address registry,
        bytes4[] memory masterIds
    ) {
        (, uint256 preference) = query(feeManager, abi.encodeWithSignature("userTokens(address)", account));
        address preferred = preference <= type(uint160).max ? address(uint160(preference)) : address(0);
        uint256[] memory balances = new uint256[](tokens.length);
        uint256 preferredBalance;
        bool found;
        bytes memory balanceCall = abi.encodeWithSignature("balanceOf(address)", account);
        for (uint256 i; i < tokens.length; ++i) {
            (, balances[i]) = query(tokens[i], balanceCall);
            if (tokens[i] == preferred) {
                found = true;
                preferredBalance = balances[i];
            }
        }
        if (!found && preferred != address(0)) (, preferredBalance) = query(preferred, balanceCall);

        address[] memory masters = new address[](masterIds.length);
        bool resolved = true;
        for (uint256 i; i < masterIds.length; ++i) {
            (bool success, uint256 master) = query(registry, abi.encodeWithSignature("getMaster(bytes4)", masterIds[i]));
            if (!success || master > type(uint160).max) resolved = false;
            else masters[i] = address(uint160(master));
        }
        bytes memory result = abi.encode(preferred, preferredBalance, balances, resolved, masters);
        assembly { return(add(result, 32), mload(result)) }
    }

    /// @dev Bound gas and copied return data so one candidate cannot exhaust the entire read.
    function query(address target, bytes memory data) private view returns (bool success, uint256 value) {
        assembly {
            let output := mload(0x40)
            success := staticcall(100000, target, add(data, 32), mload(data), output, 32)
            success := and(success, iszero(lt(returndatasize(), 32)))
            if success { value := mload(output) }
        }
    }
}
