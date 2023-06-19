import type { Chain } from '../../chains.js'
import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ByteArray, Hex } from '../../types/misc.js'
import type { TypedDataDefinition } from '../../types/typedData.js'
import {
  type HashTypedDataParameters,
  hashTypedData,
} from '../../utils/index.js'
import { type VerifyHashParameters, verifyHash } from './verifyHash.js'
import type { Address, TypedData } from 'abitype'

export type VerifyTypedDataParameters<
  TTypedData extends TypedData | Record<string, unknown> = TypedData,
  TPrimaryType extends keyof TTypedData = keyof TTypedData,
> = Omit<VerifyHashParameters, 'hash'> &
  TypedDataDefinition<TTypedData, TPrimaryType> & {
    /** The address to verify the typed data for. */
    address: Address
    /** The signature to verify */
    signature: Hex | ByteArray
  }

export type VerifyTypedDataReturnType = boolean

/**
 * Verify that typed data was signed by the provided address.
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyTypedData.html}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyTypedDataParameters}
 * @returns Whether or not the signature is valid. {@link VerifyTypedDataReturnType}
 */
export async function verifyTypedData<
  const TTypedData extends TypedData | Record<string, unknown>, // `Record<string, unknown>` allows for non-const asserted types
  TPrimaryType extends keyof TTypedData,
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    signature,
    message,
    primaryType,
    types,
    domain,
    ...callRequest
  }: VerifyTypedDataParameters<TTypedData, TPrimaryType>,
): Promise<VerifyTypedDataReturnType> {
  const hash = hashTypedData({
    message,
    primaryType,
    types,
    domain,
  } as HashTypedDataParameters)
  return verifyHash(client, {
    address,
    hash,
    signature,
    ...callRequest,
  })
}
