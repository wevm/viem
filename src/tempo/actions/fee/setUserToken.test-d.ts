import type { Address, Hex } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { getUserToken } from './getUserToken.js'
import { setUserToken } from './setUserToken.js'
import { setUserTokenSync } from './setUserTokenSync.js'
import { watchSetUserToken } from './watchSetUserToken.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})

describe('setUserToken: token selector', () => {
  test('accepts a token address', () => {
    setUserToken(client, {
      token: '0x20c0000000000000000000000000000000000001',
    })
  })

  test('rejects a symbol string', () => {
    // @ts-expect-error - token must be an address
    setUserToken(client, { token: 'alphaUSD' })
  })

  test('requires `token`', () => {
    // @ts-expect-error - must provide `token`
    setUserToken(client, {})
  })
})

describe('setUserToken: return types', () => {
  test('setUserToken returns the transaction hash', () => {
    expectTypeOf(
      setUserToken(client, {
        token: '0x20c0000000000000000000000000000000000001',
      }),
    ).resolves.toEqualTypeOf<Hex.Hex>()
  })

  test('setUserTokenSync returns receipt and event data', async () => {
    const result = await setUserTokenSync(client, {
      token: '0x20c0000000000000000000000000000000000001',
    })
    expectTypeOf(result.token).toEqualTypeOf<Address.Address>()
    expectTypeOf(result.user).toEqualTypeOf<Address.Address>()
    expectTypeOf(result.receipt).not.toBeAny()
  })
})

describe('getUserToken: return types', () => {
  test('resolves to token info or null', async () => {
    const result = await getUserToken(client)
    expectTypeOf(result).toEqualTypeOf<Address.Address | null>()
  })
})

describe('setUserToken.call', () => {
  test('with and without a client', () => {
    setUserToken.call({
      token: '0x20c0000000000000000000000000000000000001',
    })
    setUserToken.call(client, {
      token: '0x20c0000000000000000000000000000000000001',
    })
  })
})

describe('watchSetUserToken: log args', () => {
  test('logs decode `token` and `user`', () => {
    const watcher = watchSetUserToken(client)
    watcher.onLogs((logs) => {
      expectTypeOf(logs[0]!.args.token).toEqualTypeOf<Address.Address>()
      expectTypeOf(logs[0]!.args.user).toEqualTypeOf<Address.Address>()
    })
  })
})
