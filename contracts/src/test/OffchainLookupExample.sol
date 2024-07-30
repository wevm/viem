// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract OffchainLookupExample {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    string[] public urls;

    constructor(string[] memory urls_) {
        urls = urls_;
    }

    function getAddress(string calldata name) public view returns (address) {
        revert OffchainLookup(
            address(this),
            urls,
            abi.encode(name),
            OffchainLookupExample.getAddressWithProof.selector,
            abi.encode(name)
        );
    }

    function getAddressWithProof(
        bytes calldata result,
        bytes calldata extraData
    ) external view returns (address) {
        (address owner, bytes32 hash, bytes memory sig) = abi.decode(result, (address, bytes32, bytes));
        address signer = recoverSigner(hash, sig);
        require(signer == owner, "invalid signature");
        return signer;
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
