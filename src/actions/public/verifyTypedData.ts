import type { Chain } from '../../chains.js'
import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { hashTypedData } from '../../utils/index.js'
import {
  type VerifyTypedDataParameters as OfflineVerifyTypedDataParameters,
  type VerifyTypedDataReturnType as OfflineVerifyTypedDataReturnType,
} from '../../utils/signature/verifyTypedData.js'
import {
  type VerifyMessageHashOnchainParameters,
  verifyMessageHashOnChain,
} from './verifyMessage.js'
import type { TypedData } from 'abitype'

export type VerifyTypedDataParameters<
  TTypedData extends TypedData | { [key: string]: unknown } = TypedData,
  TPrimaryType extends string = string,
> = Omit<VerifyMessageHashOnchainParameters, 'messageHash'> &
  OfflineVerifyTypedDataParameters<TTypedData, TPrimaryType>

export type VerifyTypedDataReturnType = OfflineVerifyTypedDataReturnType

/**
 * Verifies a typed data signature considering ERC1271 with fallback to EOA signature verification
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyTypedData.html}
 *
 * @param client - The public client
 * @param parameters - Object containing the typed data, signature and address to verify, plus optional blockTag and blockNumber for the onchain call
 * @param parameters.address - The address to verify the typed data for
 * @param parameters.signature - The signature to verify
 * @param parameters.message - The typed data message
 * @param parameters.primaryType - The typed data primary type
 * @param parameters.types - The typed data types
 * @param parameters.domain - The typed data domain
 * @param parameters.blockTag - The block tag to use for the onchain call
 * @param parameters.blockNumber - The block number to use for the onchain call
 * @returns true if the signature is valid, false if the signature is invalid
 */
export async function verifyTypedData<TChain extends Chain | undefined,>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    signature,
    message,
    primaryType,
    types,
    domain,
    ...callRequest
  }: VerifyTypedDataParameters,
): Promise<VerifyTypedDataReturnType> {
  const messageHash = hashTypedData({ message, primaryType, types, domain })

  return verifyMessageHashOnChain(client, {
    address,
    messageHash,
    signature,
    ...callRequest,
  })
}
