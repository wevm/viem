import type { Address } from 'ox'
import { describe, expectTypeOf, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import { get } from './get.js'
import { watchIncremented } from './watchIncremented.js'

const account = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const client = Client.create({
  account,
  chain: tempoLocalnet,
  transport: http(),
})

describe('get: options', () => {
  test('account is optional (defaults to client account)', () => {
    get(client, { nonceKey: 1n })
    get(client, { account: '0x', nonceKey: 1n })
    get(client, { account, nonceKey: 1n })
  })

  test('requires `nonceKey`', () => {
    // @ts-expect-error - must provide `nonceKey`
    get(client, {})
  })

  test('rejects a number nonce key', () => {
    // @ts-expect-error - nonceKey must be a bigint
    get(client, { nonceKey: 1 })
  })
})

describe('get: return types', () => {
  test('resolves to a bigint', () => {
    expectTypeOf(get(client, { nonceKey: 1n })).resolves.toEqualTypeOf<bigint>()
  })
})

describe('watchIncremented: log args', () => {
  test('logs decode `account`, `nonceKey`, and `newNonce`', () => {
    const watcher = watchIncremented(client)
    watcher.onLogs((logs) => {
      expectTypeOf(logs[0]!.args.account).toEqualTypeOf<Address.Address>()
      expectTypeOf(logs[0]!.args.nonceKey).toEqualTypeOf<bigint>()
      expectTypeOf(logs[0]!.args.newNonce).toEqualTypeOf<bigint>()
    })
  })
})
