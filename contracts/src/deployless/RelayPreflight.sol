// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @notice Reads liquid fee-token balances and virtual recipients in one eth_call.
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
        address validator;
        if (account != address(0)) {
            (bool success, uint256 token) = query(feeManager, abi.encodeWithSignature("validatorTokens(address)", block.coinbase));
            if (success && token <= type(uint160).max)
                validator = token == 0 ? address(0x20C0000000000000000000000000000000000000) : address(uint160(token));
        }
        uint256[] memory balances = new uint256[](tokens.length);
        uint256 preferredBalance;
        bool found;
        bytes memory balanceCall = abi.encodeWithSignature("balanceOf(address)", account);
        for (uint256 i; i < tokens.length; ++i) {
            balances[i] = liquidBalance(tokens[i], balanceCall, feeManager, validator);
            if (tokens[i] == preferred) {
                found = true;
                preferredBalance = balances[i];
            }
        }
        if (!found && preferred != address(0)) preferredBalance = liquidBalance(preferred, balanceCall, feeManager, validator);

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

    /// @dev Zero balances exclude unfunded tokens and routes with no validator-token liquidity.
    function liquidBalance(address token, bytes memory balanceCall, address feeManager, address validator) private view returns (uint256) {
        (, uint256 balance) = query(token, balanceCall);
        if (balance == 0 || validator == address(0)) return 0;
        if (token == validator || hasLiquidity(feeManager, token, validator)) return balance;
        (, uint256 quote) = query(token, abi.encodeWithSignature("quoteToken()"));
        if (quote == 0 || quote > type(uint160).max) return 0;
        address intermediate = address(uint160(quote));
        if (intermediate == token || intermediate == validator) return 0;
        if (hasLiquidity(feeManager, token, intermediate) && hasLiquidity(feeManager, intermediate, validator)) return balance;
        return 0;
    }

    /// @dev Only the output reserve can fund a fee swap; bound gas and return-data copying.
    function hasLiquidity(address feeManager, address token, address validator) private view returns (bool liquid) {
        bytes memory data = abi.encodeWithSignature("getPool(address,address)", token, validator);
        assembly {
            let output := mload(0x40)
            let success := staticcall(100000, feeManager, add(data, 32), mload(data), output, 64)
            liquid := and(and(success, iszero(lt(returndatasize(), 64))), gt(mload(add(output, 32)), 0))
        }
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
