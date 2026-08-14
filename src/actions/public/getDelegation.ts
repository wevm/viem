import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import {
  type GetAddressErrorType,
  getAddress,
} from '../../utils/address/getAddress.js'
import { type SizeErrorType, size } from '../../utils/data/size.js'
import { type SliceErrorType, slice } from '../../utils/data/slice.js'
import { type GetCodeErrorType, getCode } from './getCode.js'

export type GetDelegationParameters = {
  /** The address to check for delegation. */
  address: Address
} & (
  | {
      blockNumber?: undefined
      blockTag?: BlockTag | undefined
    }
  | {
      blockNumber?: bigint | undefined
      blockTag?: undefined
    }
)

export type GetDelegationReturnType = Address | undefined

export type GetDelegationErrorType =
  | GetAddressErrorType
  | GetCodeErrorType
  | SliceErrorType
  | SizeErrorType
  | ErrorType

/**
 * Returns the address that an account has delegated to via EIP-7702.
 *
 * - Docs: https://viem.sh/docs/actions/public/getDelegation
 *
 * @param client - Client to use
 * @param parameters - {@link GetDelegationParameters}
 * @returns The delegated address, or undefined if not delegated. {@link GetDelegationReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getDelegation } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const delegation = await getDelegation(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 * })
 */
export async function getDelegation<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  { address, blockNumber, blockTag = 'latest' }: GetDelegationParameters,
): Promise<GetDelegationReturnType> {
  const code = await getCode(client, {
    address,
    ...(blockNumber !== undefined ? { blockNumber } : { blockTag }),
  } as GetDelegationParameters)

  if (!code) return undefined

  // EIP-7702 delegation designator: 0xef0100 prefix (3 bytes) + address (20 bytes) = 23 bytes
  if (size(code) !== 23) return undefined

  // Check for EIP-7702 delegation designator prefix
  if (!code.startsWith('0xef0100')) return undefined

  // Extract the delegated address (bytes 3-23) and checksum it
  return getAddress(slice(code, 3, 23))
}
