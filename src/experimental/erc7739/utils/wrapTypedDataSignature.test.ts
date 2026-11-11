import { expect, test } from 'vitest'

import { typedData } from '~test/constants.js'
import type { Hex } from '../../../types/misc.js'
import { encodeAbiParameters } from '../../../utils/abi/encodeAbiParameters.js'
import { concat } from '../../../utils/data/concat.js'
import { size } from '../../../utils/data/size.js'
import { slice } from '../../../utils/data/slice.js'
import { hexToNumber, hexToString } from '../../../utils/encoding/fromHex.js'
import { stringToHex } from '../../../utils/encoding/toHex.js'
import { keccak256 } from '../../../utils/hash/keccak256.js'
import { hashTypedData } from './hashTypedData.js'
import { wrapTypedDataSignature } from './wrapTypedDataSignature.js'

const verifierDomain = {
  name: 'Smart Account',
  version: '1',
  chainId: 1,
  verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
  salt: '0x0000000000000000000000000000000000000000000000000000000000000000',
} as const

/**
 * Rebuilds the hash that an ERC-7739 verifier checks the original signature
 * against, from the data appended to a wrapped signature.
 */
function getVerifierHash(wrapped: Hex) {
  const end = size(wrapped)
  const descriptionSize = hexToNumber(slice(wrapped, end - 2, end))
  const offset = end - 2 - descriptionSize - 64
  const appDomainSeparator = slice(wrapped, offset, offset + 32)
  const contents = slice(wrapped, offset + 32, offset + 64)
  const description = hexToString(slice(wrapped, offset + 64, end - 2))

  // Implicit mode: `contentsType` starts with `contentsName`.
  // Explicit mode: `contentsType ‖ contentsName`.
  const explicit = !description.endsWith(')')
  const contentsType = explicit
    ? description.slice(0, description.lastIndexOf(')') + 1)
    : description
  const contentsName = explicit
    ? description.slice(description.lastIndexOf(')') + 1)
    : description.slice(0, description.indexOf('('))

  const typedDataSignTypehash = keccak256(
    stringToHex(
      `TypedDataSign(${contentsName} contents,string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)${contentsType}`,
    ),
  )
  const typedDataSign = keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'address' },
        { type: 'bytes32' },
      ],
      [
        typedDataSignTypehash,
        contents,
        keccak256(stringToHex(verifierDomain.name)),
        keccak256(stringToHex(verifierDomain.version)),
        BigInt(verifierDomain.chainId),
        verifierDomain.verifyingContract,
        verifierDomain.salt,
      ],
    ),
  )
  return keccak256(concat(['0x1901', appDomainSeparator, typedDataSign]))
}

test('default', () => {
  const signature = {
    r: '0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def852',
    s: '0x74e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a7',
    v: 28n,
    yParity: 1,
  } as const

  const wrapped = wrapTypedDataSignature({
    ...typedData.complex,
    primaryType: 'Mail',
    signature,
  })

  expect(wrapped).toMatchInlineSnapshot(
    `"0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c1788ede5301fb0c4b95dda42eabe811ba83dc3cde96087b00c9b72a4d26a379ac2972c4c4323c6d7ee73e319350f290c6549b6eb516b5e5354128413342332154d61696c2875696e743235362074696d657374616d702c506572736f6e2066726f6d2c506572736f6e20746f2c737472696e6720636f6e74656e74732c62797465732068617368294e616d6528737472696e672066697273742c737472696e67206c61737429506572736f6e284e616d65206e616d652c616464726573732077616c6c65742c737472696e675b335d206661766f72697465436f6c6f72732c75696e7432353620666f6f2c75696e7438206167652c626f6f6c206973436f6f6c2900c1"`,
  )
  expect(getVerifierHash(wrapped)).toBe(
    hashTypedData({
      ...typedData.complex,
      primaryType: 'Mail',
      verifierDomain,
    }),
  )
})

test('behavior: nested type sorts before the contents type', () => {
  const permit = {
    domain: {
      name: 'Permit2',
      chainId: 1,
      verifyingContract: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
    types: {
      PermitDetails: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint160' },
        { name: 'expiration', type: 'uint48' },
        { name: 'nonce', type: 'uint48' },
      ],
      PermitSingle: [
        { name: 'details', type: 'PermitDetails' },
        { name: 'spender', type: 'address' },
        { name: 'sigDeadline', type: 'uint256' },
      ],
    },
    primaryType: 'PermitSingle',
    message: {
      details: {
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: 1000000n,
        expiration: 1735689600,
        nonce: 0,
      },
      spender: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      sigDeadline: 1735689600n,
    },
  } as const

  const wrapped = wrapTypedDataSignature({
    ...permit,
    signature:
      '0x17f7e62a3921a11100b1f9631ed17c176767719fcc6e6178bf05e44fe0def85274e45a4f27940e9bc53f55d8c6934524d461f031059ba41bc0991e52093e53a71c',
  })

  // EIP-712 sorts `PermitDetails` before `PermitSingle` in the `TypedDataSign`
  // type, so the contents type is sent in explicit mode.
  expect(hexToString(slice(wrapped, 65 + 64, size(wrapped) - 2))).toBe(
    'PermitDetails(address token,uint160 amount,uint48 expiration,uint48 nonce)PermitSingle(PermitDetails details,address spender,uint256 sigDeadline)PermitSingle',
  )
  expect(getVerifierHash(wrapped)).toBe(
    hashTypedData({ ...permit, verifierDomain }),
  )
})
