import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import { read } from '../contract/read.js'
import { resolveUniversalResolverAddress } from './getAddress.js'
import { universalResolverReverseAbi } from './internal/abis.js'
import { localBatchGatewayUrl } from './internal/batchGateway.js'
import { isNullUniversalResolverError } from './internal/errors.js'

/**
 * Gets the primary ENS name for an address (via the ENS Universal Resolver's
 * `reverseWithGateways`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const name = await Actions.ens.getName(client, {
 *   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
 * })
 * ```
 */
export async function getName(
  client: Client.Client,
  options: getName.Options,
): Promise<getName.ReturnType> {
  const {
    address,
    blockNumber,
    blockTag,
    coinType = 60n,
    gatewayUrls,
    strict,
  } = options

  const universalResolverAddress = resolveUniversalResolverAddress(client, {
    address: options.universalResolverAddress,
    blockNumber,
  })

  try {
    const [name] = (await read(client, {
      abi: universalResolverReverseAbi,
      address: universalResolverAddress,
      args: [address, coinType, gatewayUrls ?? [localBatchGatewayUrl]],
      blockNumber,
      blockTag,
      functionName: 'reverseWithGateways',
    })) as [string, Address.Address, Address.Address]

    return name || null
  } catch (err) {
    if (strict) throw err
    if (isNullUniversalResolverError(err)) return null
    throw err
  }
}

export declare namespace getName {
  type Options = {
    /** Address to reverse-resolve. */
    address: Address.Address
    /** ENSIP-9 coin type of the reverse record. @default 60n (ETH) */
    coinType?: bigint | undefined
    /** Universal Resolver gateway URLs for CCIP-read requests. */
    gatewayUrls?: readonly string[] | undefined
    /** Whether to throw Universal Resolver errors instead of returning `null`. */
    strict?: boolean | undefined
    /** ENS Universal Resolver address. @default client.chain.contracts.ensUniversalResolver */
    universalResolverAddress?: Address.Address | undefined
  } & (
    | {
        /** The block number to resolve against. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** The block tag to resolve against. @default 'latest' */
        blockTag?: Block.Tag | undefined
      }
  )

  type ReturnType = string | null

  type ErrorType = Errors.GlobalErrorType
}
