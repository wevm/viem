import type { Address, Block, Errors } from 'ox'

import type * as Client from '../../Client.js'
import { getText } from './getText.js'
import { type AssetGatewayUrls, parseAvatarRecord } from './internal/avatar.js'

/**
 * Gets the avatar image URI for an ENS name (resolves the `avatar` text
 * record, including CAIP-22/29 NFT records).
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
 * const avatar = await Actions.ens.getAvatar(client, {
 *   name: Ens.normalize('wevm.eth'),
 * })
 * ```
 */
export async function getAvatar(
  client: Client.Client,
  options: getAvatar.Options,
): Promise<getAvatar.ReturnType> {
  const { assetGatewayUrls, ...rest } = options

  const record = await getText(client, { ...rest, key: 'avatar' })
  if (!record) return null

  try {
    return await parseAvatarRecord(client, {
      gatewayUrls: assetGatewayUrls,
      record,
    })
  } catch {
    return null
  }
}

export declare namespace getAvatar {
  type Options = {
    /** Gateway URL overrides for resolving offchain asset URIs (IPFS/Arweave). */
    assetGatewayUrls?: AssetGatewayUrls | undefined
    /** Universal Resolver gateway URLs for CCIP-read requests. */
    gatewayUrls?: readonly string[] | undefined
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

  type ErrorType = getText.ErrorType | Errors.GlobalErrorType
}
