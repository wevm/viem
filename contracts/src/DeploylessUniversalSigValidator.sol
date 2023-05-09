pragma solidity ^0.8.17;

// SPDX-License-Identifier: UNLICENSED

// https://github.com/AmbireTech/signature-validator

interface IERC1271Wallet {
    function isValidSignature(
        bytes32 hash,
        bytes calldata signature
    ) external view returns (bytes4 magicValue);
}

contract VerifySig {
    constructor(address _signer, bytes32 _hash, bytes memory _signature) {
        bool isValidSig = isValidUniversalSig(_signer, _hash, _signature);
        assembly {
            mstore(0, isValidSig)
            return(31, 1)
        }
    }

    // ERC-6492 suffix: https://eips.ethereum.org/EIPS/eip-6492
    bytes32 private constant ERC6492_DETECTION_SUFFIX =
        0x6492649264926492649264926492649264926492649264926492649264926492;
    bytes4 private constant ERC1271_SUCCESS = 0x1626ba7e;

    /**
     * @notice Verifies that the signature is valid for that signer and hash
     */
    function isValidUniversalSig(
        address _signer,
        bytes32 _hash,
        bytes memory _signature
    ) public returns (bool) {
        bytes memory contractCode = address(_signer).code;
        // The order here is striclty defined in https://eips.ethereum.org/EIPS/eip-6492
        // - ERC-6492 suffix check and verification first, while being permissive in case the contract is already deployed so as to not invalidate old sigs
        // - ERC-1271 verification if there's contract code
        // - finally, ecrecover
        if (trailingBytes32(_signature) == ERC6492_DETECTION_SUFFIX) {
            address create2Factory;
            bytes memory factoryCalldata;
            bytes memory originalSig;
            (create2Factory, factoryCalldata, originalSig) = abi.decode(
                _signature,
                (address, bytes, bytes)
            );

            if (contractCode.length == 0) {
                (bool success, ) = create2Factory.call(factoryCalldata);
                require(success, "SignatureValidator: deployment");
            }
            return
                IERC1271Wallet(_signer).isValidSignature(_hash, originalSig) ==
                ERC1271_SUCCESS;
        }

        if (contractCode.length > 0) {
            return
                IERC1271Wallet(_signer).isValidSignature(_hash, _signature) ==
                ERC1271_SUCCESS;
        }

        // ecrecover verification
        require(
            _signature.length == 65,
            "SignatureValidator#recoverSigner: invalid signature length"
        );
        bytes32[3] memory _sig;
        assembly {
            _sig := _signature
        }
        bytes32 r = _sig[1];
        bytes32 s = _sig[2];
        uint8 v = uint8(_signature[64]);
        if (v != 27 && v != 28) {
            revert(
                "SignatureValidator#recoverSigner: invalid signature v value"
            );
        }
        return ecrecover(_hash, v, r, s) == _signer;
    }

    function trailingBytes32(
        bytes memory data
    ) internal pure returns (bytes32 ret) {
        require(data.length >= 32);
        assembly {
            ret := mload(add(data, mload(data)))
        }
    }
}
