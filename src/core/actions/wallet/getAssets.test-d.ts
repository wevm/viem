import { Actions, Client, http } from 'viem'
import { expectTypeOf, test } from 'vitest'

const client = Client.create({ transport: http() })

const account = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

test('default: aggregated assets under `0` carry chainIds', async () => {
  const result = await Actions.wallet.getAssets(client, { account })
  const [asset] = result[0]!
  expectTypeOf(asset!.chainIds).toEqualTypeOf<readonly number[]>()
})

test('aggregate: false — no aggregated `0` key, assets have no chainIds', async () => {
  const result = await Actions.wallet.getAssets(client, {
    account,
    aggregate: false,
  })
  const [asset] = result[0]!
  expectTypeOf(asset!).not.toHaveProperty('chainIds')
})

test('aggregate: custom function — aggregated assets carry chainIds', async () => {
  const result = await Actions.wallet.getAssets(client, {
    account,
    aggregate: (asset) =>
      asset.type === 'erc20' ? asset.metadata.symbol : 'other',
  })
  const [asset] = result[0]!
  expectTypeOf(asset!.chainIds).toEqualTypeOf<readonly number[]>()
})

test('asset type narrowing', async () => {
  const result = await Actions.wallet.getAssets(client, { account })
  const [asset] = result[0]!
  if (asset!.type === 'erc20')
    expectTypeOf(asset!.metadata).toEqualTypeOf<{
      name: string
      symbol: string
      decimals: number
    }>()
  if (asset!.type === 'native') expectTypeOf(asset!.address).toBeUndefined()
})
