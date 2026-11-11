// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;

contract OffchainLookupSigner {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    function isValidSignature(
        bytes32,
        bytes calldata
    ) external view returns (bytes4) {
        revert OffchainLookup(
            msg.sender,
            new string[](0),
            msg.data,
            OffchainLookupSigner.isValidSignature.selector,
            ""
        );
    }
}
