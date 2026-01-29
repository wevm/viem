import type { Address, TypedData } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { ByteArray, Hex, Signature } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import {
  type HashTypedDataErrorType,
  hashTypedData,
} from '../../utils/signature/hashTypedData.js'
import {
  type VerifyHashErrorType,
  type VerifyHashParameters,
  verifyHash,
} from './verifyHash.js'

export type VerifyTypedDataParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
> = Omit<VerifyHashParameters, 'hash'> &
  TypedDataDefinition<typedData, primaryType> & {
    /** The address to verify the typed data for. */
    address: Address
    /** The signature to verify */
    signature: Hex | ByteArray | Signature
  }

export type VerifyTypedDataReturnType = boolean

export type VerifyTypedDataErrorType =
  | HashTypedDataErrorType
  | VerifyHashErrorType
  | ErrorType

/**
 * Verify that typed data was signed by the provided address.
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyTypedData}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyTypedDataParameters}
 * @returns Whether or not the signature is valid. {@link VerifyTypedDataReturnType}
 */
export async function verifyTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
  chain extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: VerifyTypedDataParameters<typedData, primaryType>,
): Promise<VerifyTypedDataReturnType> {
  const {
    address,
    factory,
    factoryData,
    signature,
    message,
    primaryType,
    types,
    domain,
    ...callRequest
  } = parameters as VerifyTypedDataParameters
  const hash = hashTypedData({ message, primaryType, types, domain })
  return verifyHash(client, {
    address,
    factory: factory!,
    factoryData: factoryData!,
    hash,
    signature,
    ...callRequest,
  })
}
