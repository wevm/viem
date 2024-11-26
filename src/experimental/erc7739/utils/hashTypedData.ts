import type { TypedData, TypedDataDomain } from 'abitype'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { RequiredBy } from '../../../types/utils.js'
import {
  type HashTypedDataErrorType as HashTypedDataErrorType_,
  hashTypedData as hashTypedData_,
} from '../../../utils/signature/hashTypedData.js'

export type HashTypedDataParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  ///
  primaryTypes = typedData extends TypedData ? keyof typedData : string,
> = TypedDataDefinition<typedData, primaryType, primaryTypes> & {
  fields: Hex
  extensions: readonly bigint[]
  verifierDomain: RequiredBy<
    TypedDataDomain,
    'chainId' | 'name' | 'verifyingContract' | 'version'
  >
}

export type HashTypedDataReturnType = Hex

export type HashTypedDataErrorType = HashTypedDataErrorType_ | ErrorType

/**
 * Generates a signable hash for ERC-7739 typed data.
 *
 * @example
 * ```ts
 * const hash = hashTypedData({
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
 *   verifierDomain: {
 *     name: 'Smart Account',
 *     version: '1',
 *     verifyingContract: '0x1234567890abcdef1234567890abcdef12345678',
 *     chainId: 1,
 *   },
 * })
 * ```
 */
export function hashTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  parameters: HashTypedDataParameters<typedData, primaryType>,
): HashTypedDataReturnType {
  const {
    domain,
    extensions,
    fields,
    message,
    primaryType,
    types,
    verifierDomain,
  } = parameters

  return hashTypedData_({
    domain: domain as any,
    types: {
      ...types,
      TypedDataSign: [
        { name: 'contents', type: primaryType },
        { name: 'fields', type: 'bytes1' },
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
        { name: 'extensions', type: 'uint256[]' },
      ],
    },
    primaryType: 'TypedDataSign',
    message: {
      contents: message as any,
      fields,
      extensions,
      ...(verifierDomain as any),
    },
  })
}
