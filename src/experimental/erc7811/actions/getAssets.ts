import type { Address } from 'abitype'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../../accounts/utils/parseAccount.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { ethAddress } from '../../../constants/address.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type {
  WalletGetAssetsParameters,
  WalletGetAssetsReturnType,
} from '../../../types/eip1193.js'
import type { Hex } from '../../../types/misc.js'
import type { OneOf, Prettify } from '../../../types/utils.js'
import {
  type HexToBigIntErrorType,
  hexToBigInt,
} from '../../../utils/encoding/fromHex.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../../utils/encoding/toHex.js'

export type GetAssetsParameters<
  aggregate extends
    | boolean
    | ((asset: getAssets.Asset) => string)
    | undefined = undefined,
  account extends Account | undefined = Account | undefined,
> = GetAccountParameter<account> & {
  /**
   * Whether or not to aggregate assets across multiple chains,
   * and assign them to a '0' key.
   * @default true
   */
  aggregate?:
    | aggregate
    | boolean
    | ((asset: getAssets.Asset) => string)
    | undefined
  /** Filter by assets. */
  assets?:
    | {
        [chainId: number]: readonly (
          | {
              address: 'native'
              type: 'native'
            }
          | {
              address: Address
              type: getAssets.AssetType
            }
        )[]
      }
    | undefined
  /** Filter by asset types. */
  assetTypes?: readonly getAssets.AssetType[] | undefined
  /** Filter by chain IDs. */
  chainIds?: readonly number[] | undefined
}

export type GetAssetsReturnType<
  aggregate extends
    | boolean
    | ((asset: getAssets.Asset) => string)
    | undefined = undefined,
> = {
  [chainId: number]: readonly getAssets.Asset<false>[]
} & (aggregate extends false ? {} : { 0: readonly getAssets.Asset<true>[] })

export type GetAssetsErrorType =
  | HexToBigIntErrorType
  | NumberToHexErrorType
  | ParseAccountErrorType
  | ErrorType

/**
 * Retrieves assets for a given account from the target Wallet.
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getAssets } from 'viem/experimental'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 *
 * const result = await getAssets(client, {
 *   account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
 * })
 *
 * @param client - Client to use to make the request.
 * @param parameters - Parameters.
 * @returns Assets for the given account.
 */
export async function getAssets<
  chain extends Chain | undefined,
  account extends Account | undefined = Account | undefined,
  aggregate extends
    | boolean
    | ((asset: getAssets.Asset) => string)
    | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  ...[parameters]: account extends Account
    ? [GetAssetsParameters<aggregate, account>] | []
    : [GetAssetsParameters<aggregate, account>]
): Promise<Prettify<GetAssetsReturnType<aggregate>>> {
  const { account = client.account, aggregate = true } = parameters ?? {}

  const result = await client.request({
    method: 'wallet_getAssets',
    params: [formatRequest({ ...parameters, account })],
  })
  const response = formatResponse(result)

  const aggregated = (() => {
    if (!aggregate) return undefined
    const aggregated = {} as Record<string, getAssets.Asset<boolean>>
    for (const [chainId, assets] of Object.entries(response)) {
      if (chainId === '0') continue
      const seen = new Set<string>()
      for (const asset of assets) {
        const key =
          typeof aggregate === 'function'
            ? aggregate(asset)
            : (asset.address ?? ethAddress)
        const item = (aggregated[key] ?? {}) as getAssets.Asset<true>
        if (seen.has(key)) continue
        seen.add(key)
        aggregated[key] = {
          ...asset,
          balance: asset.balance + (item?.balance ?? 0n),
          chainIds: [...(item?.chainIds ?? []), Number(chainId)],
        }
      }
    }
    return Object.values(aggregated)
  })()

  if (aggregated) return { 0: aggregated, ...response } as never
  return response as never
}

export declare namespace getAssets {
  type Asset<chainIds extends boolean = false> = OneOf<
    CustomAsset | Erc20Asset | Erc721Asset | NativeAsset
  > &
    (chainIds extends true ? { chainIds: readonly number[] } : {})

  type AssetType = 'native' | 'erc20' | 'erc721' | (string & {})

  type CustomAsset = {
    address: Address
    balance: bigint
    metadata: {
      [key: string]: unknown
    }
    type: { custom: string }
  }

  type Erc20Asset = {
    address: Address
    balance: bigint
    metadata: {
      name: string
      symbol: string
      decimals: number
    }
    type: 'erc20'
  }

  type Erc721Asset = {
    address: Address
    balance: bigint
    metadata: {
      name: string
      symbol: string
      tokenId: bigint
      tokenUri?: string | undefined
    }
    type: 'erc721'
  }

  type NativeAsset = {
    balance: bigint
    type: 'native'
  }
}

/** @internal */
function formatRequest(
  parameters: GetAssetsParameters<undefined, Account> | undefined = {},
): WalletGetAssetsParameters {
  const { account: account_, assets, assetTypes, chainIds } = parameters

  if (typeof account_ === 'undefined')
    throw new AccountNotFoundError({
      docsPath: '/experimental/erc7811/getAssets',
    })
  const account = parseAccount(account_)

  return {
    account: account.address,
    assetFilter: assets,
    assetTypeFilter: assetTypes,
    chainFilter: chainIds?.map((chainId) => numberToHex(chainId)),
  }
}

/** @internal */
function formatResponse(
  response: WalletGetAssetsReturnType,
): GetAssetsReturnType<false> {
  return Object.fromEntries(
    Object.entries(response).map(([chainId, assets]) => [
      Number(chainId),
      assets.map((asset) => {
        const balance = hexToBigInt(asset.balance)
        const metadata = asset.metadata as getAssets.Asset['metadata']
        const type = (() => {
          if (asset.type === 'native') return 'native'
          if (asset.type === 'erc20') return 'erc20'
          if (asset.type === 'erc721') return 'erc721'
          return { custom: asset.type }
        })()
        const address = type === 'native' ? undefined : asset.address

        return {
          balance,
          type,
          ...(address ? { address } : {}),
          ...(metadata
            ? {
                metadata: {
                  ...metadata,
                  ...('tokenId' in metadata
                    ? { tokenId: hexToBigInt(metadata.tokenId as Hex) }
                    : {}),
                },
              }
            : {}),
        }
      }),
    ]),
  ) as GetAssetsReturnType<false>
}
