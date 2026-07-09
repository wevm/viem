import { Hex } from 'ox'
import type { Address, Errors } from 'ox'

import * as Account from '../../Account.js'
import type * as Client from '../../Client.js'
import type { OneOf } from '../../internal/types.js'

/** Native asset (ether) placeholder address. */
const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

/**
 * Retrieves assets for a given account from the connected wallet via
 * [ERC-7811 `wallet_getAssets`](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7811.md).
 *
 * @example
 * ```ts
 * import { Actions, Client, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: custom(window.ethereum!),
 * })
 * const assets = await Actions.wallet.getAssets(client, {
 *   account: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
 * })
 * ```
 */
export async function getAssets<
  aggregate extends
    | boolean
    | ((asset: getAssets.Asset) => string)
    | undefined = undefined,
>(
  client: Client.Client,
  options: getAssets.Options<aggregate> = {},
): Promise<getAssets.ReturnType<aggregate>> {
  const {
    account: account_ = client.account,
    aggregate = true,
    assets,
    assetTypes,
    chainIds,
  } = options

  if (!account_) throw new Account.NotFoundError()
  const account =
    typeof account_ === 'string' ? Account.from(account_) : account_

  const result = await client.request({
    method: 'wallet_getAssets',
    params: [
      {
        account: account.address,
        ...(assets ? { assetFilter: assets } : {}),
        ...(assetTypes ? { assetTypeFilter: assetTypes } : {}),
        ...(chainIds
          ? { chainFilter: chainIds.map((chainId) => Hex.fromNumber(chainId)) }
          : {}),
      },
    ],
  })
  const response = decodeResponse(result as getAssets.Rpc)

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

  if (aggregated)
    return { 0: aggregated, ...response } as getAssets.ReturnType<aggregate>
  return response as getAssets.ReturnType<aggregate>
}

export declare namespace getAssets {
  type Options<
    aggregate extends
      | boolean
      | ((asset: Asset) => string)
      | undefined = undefined,
  > = {
    /** Account (or address) to fetch assets for. @default client.account */
    account?: Account.Account | Address.Address | undefined
    /**
     * Whether to aggregate assets across chains under the `0` key. Provide a
     * function to derive a custom aggregation key per asset.
     * @default true
     */
    aggregate?: aggregate | boolean | ((asset: Asset) => string) | undefined
    /** Filter by assets. */
    assets?:
      | {
          [chainId: number]: readonly (
            | { address: 'native'; type: 'native' }
            | { address: Address.Address; type: AssetType }
          )[]
        }
      | undefined
    /** Filter by asset types. */
    assetTypes?: readonly AssetType[] | undefined
    /** Filter by chain IDs. */
    chainIds?: readonly number[] | undefined
  }

  type ReturnType<
    aggregate extends
      | boolean
      | ((asset: Asset) => string)
      | undefined = undefined,
  > = { [chainId: number]: readonly Asset<false>[] } & (aggregate extends false
    ? {}
    : { 0: readonly Asset<true>[] })

  type Asset<chainIds extends boolean = false> = OneOf<
    CustomAsset | Erc20Asset | Erc721Asset | NativeAsset
  > &
    (chainIds extends true
      ? {
          /** Chains the asset was aggregated across. */
          chainIds: readonly number[]
        }
      : {})

  type AssetType = 'native' | 'erc20' | 'erc721' | (string & {})

  type CustomAsset = {
    /** Address of the asset. */
    address: Address.Address
    /** Balance of the asset. */
    balance: bigint
    /** Metadata of the asset. */
    metadata: { [key: string]: unknown }
    /** Type of the asset. */
    type: { custom: string }
  }

  type Erc20Asset = {
    /** Address of the asset. */
    address: Address.Address
    /** Balance of the asset. */
    balance: bigint
    /** Metadata of the asset. */
    metadata: { name: string; symbol: string; decimals: number }
    /** Type of the asset. */
    type: 'erc20'
  }

  type Erc721Asset = {
    /** Address of the asset. */
    address: Address.Address
    /** Balance of the asset. */
    balance: bigint
    /** Metadata of the asset. */
    metadata: {
      name: string
      symbol: string
      tokenId: bigint
      tokenUri?: string | undefined
    }
    /** Type of the asset. */
    type: 'erc721'
  }

  type NativeAsset = {
    /** Balance of the asset. */
    balance: bigint
    /** Type of the asset. */
    type: 'native'
  }

  /** Wire (RPC) shape of the `wallet_getAssets` response. */
  type Rpc = {
    [chainId: Hex.Hex]: readonly {
      address: Address.Address | 'native'
      balance: Hex.Hex
      metadata?: unknown | undefined
      type: AssetType
    }[]
  }

  type ErrorType =
    | Account.NotFoundError
    | Account.from.ErrorType
    | Hex.fromNumber.ErrorType
    | Hex.toBigInt.ErrorType
    | Errors.GlobalErrorType
}

/** Decodes (wire → native) a `wallet_getAssets` response. @internal */
function decodeResponse(response: getAssets.Rpc): getAssets.ReturnType<false> {
  return Object.fromEntries(
    Object.entries(response).map(([chainId, assets]) => [
      Number(chainId),
      assets.map((asset) => {
        const balance = Hex.toBigInt(asset.balance)
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
                    ? { tokenId: Hex.toBigInt(metadata.tokenId as Hex.Hex) }
                    : {}),
                },
              }
            : {}),
        }
      }),
    ]),
  ) as getAssets.ReturnType<false>
}
