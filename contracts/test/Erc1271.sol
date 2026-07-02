// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @dev Self-hosted ERC-1271/6492/8010 fixtures so onchain signature
/// verification can be exercised without mainnet deployments or external
/// libraries. Signatures are plain 65-byte `r || s || v` ECDSA over the
/// raw hash (no nested/replay-safe hashing), so tests can produce them
/// with a local account's `sign({ hash })`.
library Ecdsa {
    function recover(
        bytes32 hash,
        bytes calldata signature
    ) internal pure returns (address) {
        if (signature.length != 65) return address(0);
        bytes32 r = bytes32(signature[0:32]);
        bytes32 s = bytes32(signature[32:64]);
        uint8 v = uint8(signature[64]);
        if (v < 27) v += 27;
        return ecrecover(hash, v, r, s);
    }
}

/// @dev ERC-1271 account owned by a fixed signer (deployed and, via
/// `Erc1271AccountFactory`, counterfactual ERC-6492 verification).
contract Erc1271Account {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external view returns (bytes4) {
        if (Ecdsa.recover(hash, signature) == owner) return 0x1626ba7e;
        return 0xffffffff;
    }
}

/// @dev CREATE2 factory for `Erc1271Account` (counterfactual deployments).
contract Erc1271AccountFactory {
    function createAccount(
        address owner,
        bytes32 salt
    ) external returns (address) {
        return address(new Erc1271Account{salt: salt}(owner));
    }
}

/// @dev ERC-7702 delegate that validates signatures against the delegating
/// account itself, gated on initialization (ERC-8010 required-init-data case).
contract Eoa {
    bool public isInitialized;

    function initialize() external {
        isInitialized = true;
    }

    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external view returns (bytes4) {
        if (!isInitialized) return 0xffffffff;
        if (Ecdsa.recover(hash, signature) == address(this)) return 0x1626ba7e;
        return 0xffffffff;
    }
}

/// @dev ERC-7702 delegate without an initialization gate (ERC-8010 optional
/// init data case).
contract EoaOptional {
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external view returns (bytes4) {
        if (Ecdsa.recover(hash, signature) == address(this)) return 0x1626ba7e;
        return 0xffffffff;
    }
}

/// @dev Initializes an `Eoa` delegate (the ERC-8010 init call target).
contract EoaInitializer {
    function initialize(address eoa) external {
        Eoa(eoa).initialize();
    }
}
