// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;

/// ENSIP-10 wildcard resolver that answers every profile via an offchain
/// gateway, verifying the gateway's signature over the result.
contract OffchainResolverExample {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    address public immutable signer;
    string[] public urls;

    constructor(address signer_, string[] memory urls_) {
        signer = signer_;
        urls = urls_;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x9061b923 || interfaceId == 0x01ffc9a7;
    }

    function resolve(
        bytes calldata name,
        bytes calldata data
    ) external view returns (bytes memory) {
        revert OffchainLookup(
            address(this),
            urls,
            abi.encode(name, data),
            OffchainResolverExample.resolveWithProof.selector,
            ""
        );
    }

    /// `response` is `abi.encode(result, sig)`; `sig` signs `keccak256(result)`.
    function resolveWithProof(
        bytes calldata response,
        bytes calldata
    ) external view returns (bytes memory) {
        (bytes memory result, bytes memory sig) = abi.decode(
            response,
            (bytes, bytes)
        );
        require(recover(keccak256(result), sig) == signer, "invalid signature");
        return result;
    }

    function recover(
        bytes32 digest,
        bytes memory sig
    ) internal pure returns (address) {
        require(sig.length == 65, "invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return ecrecover(digest, v, r, s);
    }
}
