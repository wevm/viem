import { AbiFunction, Ens, Hex } from 'ox'
import type { Address, Block, Errors } from 'ox'

import type * as Client from '../../Client.js'
import { read } from '../contract/read.js'
import { resolveUniversalResolverAddress } from './getAddress.js'
import {
  textResolverAbi,
  universalResolverResolveAbi,
} from './internal/abis.js'
import { localBatchGatewayUrl } from './internal/batchGateway.js'
import { isNullUniversalResolverError } from './internal/errors.js'
import { packetToBytes } from './internal/packet.js'

/**
 * Gets a text record for an ENS name (via the ENS Universal Resolver's
 * `resolveWithGateways`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Ens } from 'viem/utils'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const twitter = await Actions.ens.getText(client, {
 *   key: 'com.twitter',
 *   name: Ens.normalize('wevm.eth'),
 * })
 * ```
 */
export async function getText(
  client: Client.Client,
  options: getText.Options,
): Promise<getText.ReturnType> {
  const { blockNumber, blockTag, gatewayUrls, key, name, strict } = options

  const universalResolverAddress = resolveUniversalResolverAddress(client, {
    address: options.universalResolverAddress,
    blockNumber,
  })

  const tlds = client.chain?.ensTlds
  if (tlds && !tlds.some((tld) => name.endsWith(tld))) return null

  try {
    const textItem = AbiFunction.fromAbi(textResolverAbi, 'text')

    const [data] = (await read(client, {
      abi: universalResolverResolveAbi,
      address: universalResolverAddress,
      args: [
        Hex.fromBytes(packetToBytes(name)),
        AbiFunction.encodeData(textItem, [Ens.namehash(name), key]),
        gatewayUrls ?? [localBatchGatewayUrl],
      ],
      as: 'Array',
      blockNumber,
      blockTag,
      functionName: 'resolveWithGateways',
    })) as [Hex.Hex, Address.Address]

    if (data === '0x') return null

    const record = AbiFunction.decodeResult(textItem, data)

    return record === '' ? null : record
  } catch (err) {
    if (strict) throw err
    if (isNullUniversalResolverError(err)) return null
    throw err
  }
}

export declare namespace getText {
  type Options = {
    /** Universal Resolver gateway URLs for CCIP-read requests. */
    gatewayUrls?: readonly string[] | undefined
    /** Text record key to resolve (e.g. `'com.twitter'`). */
    key: string
    /** ENS name to resolve. */
    name: string
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
