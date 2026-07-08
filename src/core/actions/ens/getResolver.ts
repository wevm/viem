import { Hex } from 'ox'
import type { Address, Block, Errors } from 'ox'

import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { read } from '../contract/read.js'
import { resolveUniversalResolverAddress } from './getAddress.js'
import { universalResolverFindResolverAbi } from './internal/abis.js'
import { packetToBytes } from './internal/packet.js'

/**
 * Gets the resolver address for an ENS name (via the ENS Universal Resolver's
 * `findResolver`).
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
 * const resolver = await Actions.ens.getResolver(client, {
 *   name: Ens.normalize('wevm.eth'),
 * })
 * ```
 */
export async function getResolver(
  client: Client.Client,
  options: getResolver.Options,
): Promise<getResolver.ReturnType> {
  const { blockNumber, blockTag, name } = options

  const { chain } = client
  const tlds = chain?.ensTlds
  if (chain && tlds && !tlds.some((tld) => name.endsWith(tld)))
    throw new BaseError(
      `${name} is not a valid ENS TLD (${tlds.join(', ')}) for chain "${chain.name}" (id: ${chain.id}).`,
    )

  const universalResolverAddress = resolveUniversalResolverAddress(client, {
    address: options.universalResolverAddress,
    blockNumber,
  })

  const [resolverAddress] = (await read(client, {
    abi: universalResolverFindResolverAbi,
    address: universalResolverAddress,
    args: [Hex.fromBytes(packetToBytes(name))],
    blockNumber,
    blockTag,
    functionName: 'findResolver',
  })) as [Address.Address, Hex.Hex, bigint]

  return resolverAddress
}

export declare namespace getResolver {
  type Options = {
    /** ENS name to get the resolver for. */
    name: string
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

  type ReturnType = Address.Address

  type ErrorType = Errors.GlobalErrorType
}
