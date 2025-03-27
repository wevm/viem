import type { Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { universalResolverReverseAbi } from '../../constants/abis.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Prettify } from '../../types/utils.js'
import {
  type GetChainContractAddressErrorType,
  getChainContractAddress,
} from '../../utils/chain/getChainContractAddress.js'
import type { ToHexErrorType } from '../../utils/encoding/toHex.js'
import { isNullUniversalResolverError } from '../../utils/ens/errors.js'
import {
  type EvmChainIdToCoinTypeError,
  evmChainIdToCoinType,
} from '../../utils/ens/evmChainIdToCoinType.js'
import type { PacketToBytesErrorType } from '../../utils/ens/packetToBytes.js'
import { getAction } from '../../utils/getAction.js'
import {
  type ReadContractErrorType,
  type ReadContractParameters,
  readContract,
} from '../public/readContract.js'

export type GetEnsNameParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /** Address to get ENS name for. */
    address: Address
    /** Universal Resolver gateway URLs to use for resolving CCIP-read requests. */
    gatewayUrls?: string[] | undefined
    /** Whether or not to throw errors propagated from the ENS Universal Resolver Contract. */
    strict?: boolean | undefined
    /** Address of ENS Universal Resolver Contract. */
    universalResolverAddress?: Address | undefined
  } & (
      | {
          /** Chain ID to get ENS name for. */
          chainId?: number | undefined
          coinType?: undefined
        }
      | {
          chainId?: undefined
          /** Coin type to get ENS name for. */
          coinType?: bigint | undefined
        }
    )
>

export type GetEnsNameReturnType = string | null

export type GetEnsNameErrorType =
  | EvmChainIdToCoinTypeError
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | ToHexErrorType
  | PacketToBytesErrorType
  | ErrorType

/**
 * Gets primary name for specified address.
 *
 * - Docs: https://viem.sh/docs/ens/actions/getEnsName
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
 *
 * Calls `reverse(bytes)` on ENS Universal Resolver Contract to "reverse resolve" the address to the primary ENS name.
 *
 * @param client - Client to use
 * @param parameters - {@link GetEnsNameParameters}
 * @returns Name or `null` if not found. {@link GetEnsNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getEnsName } from 'viem/ens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const ensName = await getEnsName(client, {
 *   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
 * })
 * // 'wevm.eth'
 */
export async function getEnsName<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    address,
    blockNumber,
    blockTag,
    chainId,
    coinType: coinType_ = 60n,
    gatewayUrls,
    strict,
    universalResolverAddress: universalResolverAddress_,
  }: GetEnsNameParameters,
): Promise<GetEnsNameReturnType> {
  let universalResolverAddress = universalResolverAddress_
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error(
        'client chain not configured. universalResolverAddress is required.',
      )

    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'ensUniversalResolver',
    })
  }

  const coinType = chainId ? evmChainIdToCoinType(chainId) : coinType_

  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      blockNumber,
      blockTag,
      args: [address, coinType],
    } as const

    const readContractAction = getAction(client, readContract, 'readContract')

    const [name] = gatewayUrls
      ? await readContractAction({
          ...readContractParameters,
          functionName: 'reverseWithGateways',
          args: [...readContractParameters.args, gatewayUrls],
        })
      : await readContractAction({
          ...readContractParameters,
          functionName: 'reverse',
        })

    return name
  } catch (err) {
    if (strict) throw err
    if (isNullUniversalResolverError(err, 'reverse')) return null
    throw err
  }
}
