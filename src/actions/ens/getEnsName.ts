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
import { isNullUniversalResolverError } from '../../utils/ens/errors.js'
import { localBatchGatewayUrl } from '../../utils/ens/localBatchGatewayRequest.js'
import type { PacketToBytesErrorType } from '../../utils/ens/packetToBytes.js'
import { getAction } from '../../utils/getAction.js'
import {
  type ReadContractErrorType,
  type ReadContractParameters,
  readContract,
} from '../public/readContract.js'

export type GetEnsNameParameters = Prettify<
  Pick<ReadContractParameters, 'blockNumber' | 'blockTag'> & {
    /**
     * Address to get ENS name for.
     */
    address: Address
    /**
     * ENSIP-9 compliant coinType (chain) to get ENS name for.
     *
     * To get the `coinType` for a chain id, use the `toCoinType` function:
     * ```ts
     * import { toCoinType } from 'viem'
     * import { base } from 'viem/chains'
     *
     * const coinType = toCoinType(base.id)
     * ```
     *
     * @default 60n
     */
    coinType?: bigint | undefined
    /**
     * Universal Resolver gateway URLs to use for resolving CCIP-read requests.
     */
    gatewayUrls?: string[] | undefined
    /**
     * Whether or not to throw errors propagated from the ENS Universal Resolver Contract.
     */
    strict?: boolean | undefined
    /**
     * Address of ENS Universal Resolver Contract.
     */
    universalResolverAddress?: Address | undefined
  }
>

export type GetEnsNameReturnType = string | null

export type GetEnsNameErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
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
  parameters: GetEnsNameParameters,
): Promise<GetEnsNameReturnType> {
  const {
    address,
    blockNumber,
    blockTag,
    coinType = 60n,
    gatewayUrls,
    strict,
  } = parameters
  const { chain } = client

  const universalResolverAddress = (() => {
    if (parameters.universalResolverAddress)
      return parameters.universalResolverAddress
    if (!chain)
      throw new Error(
        'client chain not configured. universalResolverAddress is required.',
      )
    return getChainContractAddress({
      blockNumber,
      chain,
      contract: 'ensUniversalResolver',
    })
  })()

  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      args: [address, coinType, gatewayUrls ?? [localBatchGatewayUrl]],
      functionName: 'reverseWithGateways',
      blockNumber,
      blockTag,
    } as const

    const readContractAction = getAction(client, readContract, 'readContract')

    const [name] = await readContractAction(readContractParameters)

    return name || null
  } catch (err) {
    if (strict) throw err
    if (isNullUniversalResolverError(err)) return null
    throw err
  }
}
