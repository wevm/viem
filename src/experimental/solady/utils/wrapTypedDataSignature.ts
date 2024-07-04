import type { TypedData } from 'abitype'
import { serializeSignature } from '../../../accounts/index.js'
import type { ByteArray, Hex, Signature } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import { encodePacked } from '../../../utils/abi/encodePacked.js'
import { type IsHexErrorType, isHex } from '../../../utils/data/isHex.js'
import { size } from '../../../utils/data/size.js'
import { bytesToHex, stringToHex } from '../../../utils/encoding/toHex.js'
import {
  encodeType,
  hashStruct,
} from '../../../utils/signature/hashTypedData.js'
import { getTypesForEIP712Domain } from '../../../utils/typedData.js'

export type WrapTypedDataSignatureParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  ///
  primaryTypes = typedData extends TypedData ? keyof typedData : string,
> = TypedDataDefinition<typedData, primaryType, primaryTypes> & {
  signature: Hex | ByteArray | Signature
}

export type WrapTypedDataSignatureReturnType = Hex

export type WrapTypedDataSignatureErrorType = IsHexErrorType

/**
 * Wraps a typed data signature for Solady's ERC-1271 implementation.
 *
 * @example
 * ```ts
 * const signature = wrapTypedDataSignature({
 *   domain: {
 *     name: 'Ether Mail',
 *     version: '1',
 *     chainId: 1,
 *     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
 *   },
 *   types: {
 *     Person: [
 *       { name: 'name', type: 'string' },
 *       { name: 'wallet', type: 'address' },
 *     ],
 *     Mail: [
 *       { name: 'from', type: 'Person' },
 *       { name: 'to', type: 'Person' },
 *       { name: 'contents', type: 'string' },
 *     ],
 *   },
 *   primaryType: 'Mail',
 *   message: {
 *     from: {
 *       name: 'Cow',
 *       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
 *     },
 *     to: {
 *       name: 'Bob',
 *       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
 *     },
 *     contents: 'Hello, Bob!',
 *   },
 *   signature: '0x...',
 * })
 * ```
 */
export function wrapTypedDataSignature(
  parameters: WrapTypedDataSignatureParameters,
): WrapTypedDataSignatureReturnType {
  const { domain, message, primaryType, signature, types } = parameters

  const signatureHex = (() => {
    if (isHex(signature)) return signature
    if (typeof signature === 'object' && 'r' in signature && 's' in signature)
      return serializeSignature(signature)
    return bytesToHex(signature)
  })()

  // Compute dependencies for wrapped signature.
  const hashedDomain = hashStruct({
    data: domain ?? {},
    types: {
      EIP712Domain: getTypesForEIP712Domain({ domain }),
    },
    primaryType: 'EIP712Domain',
  })
  const hashedContents = hashStruct({
    data: message,
    types: types as any,
    primaryType,
  })
  const encodedType = encodeType({
    primaryType,
    types: types as any,
  })

  // Construct wrapped signature.
  return encodePacked(
    ['bytes', 'bytes32', 'bytes32', 'bytes', 'uint16'],
    [
      signatureHex,
      hashedDomain,
      hashedContents,
      stringToHex(encodedType),
      size(stringToHex(encodedType)),
    ],
  )
}
