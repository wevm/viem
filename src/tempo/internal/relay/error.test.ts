import { createClient, encodeErrorResult, http, RawContractError } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Abis, Actions, Addresses, Store, VirtualAddress } from 'viem/tempo'
import { expect, test } from 'vitest'
import * as Cache from './cache.js'
import { formatError } from './error.js'

test('preserves insufficient-funds details when virtual-address lookups fail', async () => {
  const client = createClient({
    chain: tempoLocalnet,
    transport: http('http://127.0.0.1:1', { retryCount: 0, timeout: 500 }),
  })
  const store = Store.memory()
  const token = Addresses.pathUsd
  await Cache.memoize(
    async () => ({ decimals: 6, name: 'PathUSD', symbol: 'pathUSD' }),
    {
      key: `tokenMetadata:${tempoLocalnet.id}:${token.toLowerCase()}`,
      store,
      ttl: 60_000,
    },
  )
  const data = encodeErrorResult({
    abi: Abis.tip20,
    errorName: 'InsufficientBalance',
    args: [40_000_000n, 100_000_000n, token],
  })
  const result = await formatError(
    new RawContractError({ data }),
    {
      from: '0x0000000000000000000000000000000000000001',
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: VirtualAddress.from({
            masterId: '0x00000001',
            userTag: '0x000000000001',
          }),
          amount: 100_000_000n,
        }),
      ],
    },
    client,
    store,
  )
  expect(result.capabilities.error.errorName).toBe('InsufficientBalance')
  expect(result.capabilities).not.toHaveProperty('virtualAddresses')
  if (!('insufficientFunds' in result.capabilities))
    throw new Error('Missing insufficient-funds details')
  expect(result.capabilities.insufficientFunds).toMatchInlineSnapshot(`
    {
      "amount": "0x3938700",
      "decimals": 6,
      "formatted": "60",
      "symbol": "pathUSD",
      "token": "0x20C0000000000000000000000000000000000000",
    }
  `)
})
