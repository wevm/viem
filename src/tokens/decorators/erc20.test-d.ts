import type { Address } from 'abitype'
import { describe, expectTypeOf, test } from 'vitest'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { localhost, mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import type * as Addresses from '../Addresses.js'
import { usdc } from '../tokens.js'
import * as Decorator from './erc20.js'

const account = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const client = createClient({ account, chain: mainnet, transport: http() })

describe('decorator', () => {
  test('attaches the token namespace', () => {
    const extended = client.extend(usdc())
    expectTypeOf(extended).toHaveProperty('usdc')
    expectTypeOf(extended.usdc.getBalance).toBeFunction()
    expectTypeOf(extended.usdc.getMetadata).toBeFunction()
    expectTypeOf(extended.usdc.transfer).toBeFunction()
    expectTypeOf(extended.usdc.getAddress).toBeFunction()
  })

  test('custom namespace key', () => {
    const dai = Decorator.define('dai', {
      addresses: { [mainnet.id]: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      decimals: 18,
    })
    const extended = client.extend(dai())
    expectTypeOf(extended).toHaveProperty('dai')
    // @ts-expect-error - namespace is `dai`, not `usdc`
    extended.usdc
  })
})

describe('amount: string only', () => {
  const extended = client.extend(usdc())

  test('accepts a decimal string', () => {
    extended.usdc.transfer({ to: '0x', amount: '10.5' })
    extended.usdc.approve({ spender: '0x', amount: '10.5' })
    extended.usdc.transfer({ from: '0x', to: '0x', amount: '1' })
  })

  test('rejects a bigint', () => {
    // @ts-expect-error - amount must be a string
    extended.usdc.transfer({ to: '0x', amount: 1n })
    // @ts-expect-error - amount must be a string
    extended.usdc.transfer.call({ to: '0x', amount: 1n })
  })
})

describe('overrides', () => {
  const extended = client.extend(usdc())

  test('address and decimals are optional on write actions', () => {
    extended.usdc.transfer({
      address: '0x',
      decimals: 18,
      to: '0x',
      amount: '1',
    })
    // both omitted is fine (resolved from client + configured decimals)
    extended.usdc.transfer({ to: '0x', amount: '1' })
  })

  test('chain is an optional override', () => {
    // resolve from a different chain than the client's
    extended.usdc.transfer({ chain: mainnet, to: '0x', amount: '1' })
  })

  test('decimals must be a number', () => {
    extended.usdc.transfer({
      to: '0x',
      amount: '1',
      // @ts-expect-error - decimals must be a number
      decimals: '18',
    })
  })
})

describe('unsupported chain (no USDC in address map)', () => {
  // `localhost` (chain id 1337) is not in the USDC address map. The token
  // address cannot be resolved from the chain, so the consumer MUST pass an
  // `address` override. This is enforced at the type level: `address` becomes
  // a required field on every action.
  const extended = createClient({
    account,
    chain: localhost,
    transport: http(),
  }).extend(usdc())

  test('write actions require an address override', () => {
    extended.usdc.transfer({ address: '0x', to: '0x', amount: '1' })
    extended.usdc.approve({ address: '0x', spender: '0x', amount: '1' })
    extended.usdc.transfer({
      address: '0x',
      from: '0x',
      to: '0x',
      amount: '1',
    })

    // @ts-expect-error - `address` is required (no USDC on localhost)
    extended.usdc.transfer({ to: '0x', amount: '1' })
    // @ts-expect-error - `address` is required (no USDC on localhost)
    extended.usdc.approve({ spender: '0x', amount: '1' })
  })

  test('a `chain` override satisfies the requirement', () => {
    extended.usdc.transfer({ chain: mainnet, to: '0x', amount: '1' })
    extended.usdc.approve({ chain: mainnet, spender: '0x', amount: '1' })
    extended.usdc.getBalance({ chain: mainnet, account: '0x' })
    extended.usdc.getMetadata({ chain: mainnet })
    extended.usdc.transfer.call({ chain: mainnet, to: '0x', amount: '1' })
  })

  test('cannot supply both `address` and `chain`', () => {
    extended.usdc.transfer(
      // @ts-expect-error - `chain` is mutually exclusive with `address`
      { address: '0x', chain: mainnet, to: '0x', amount: '1' },
    )
  })

  test('decimals override is still optional', () => {
    extended.usdc.transfer({
      address: '0x',
      decimals: 18,
      to: '0x',
      amount: '1',
    })
  })

  test('read actions require an address override', () => {
    extended.usdc.getBalance({ address: '0x', account: '0x' })
    // @ts-expect-error - `address` is required (no USDC on localhost)
    extended.usdc.getBalance({ account: '0x' })

    // metadata reads: parameters become required (need `address`)
    extended.usdc.getMetadata({ address: '0x' })
    // @ts-expect-error - `address` is required (no USDC on localhost)
    extended.usdc.getMetadata()
  })

  test('.call requires an address override', () => {
    extended.usdc.transfer.call({ address: '0x', to: '0x', amount: '1' })
    // @ts-expect-error - `address` is required (no USDC on localhost)
    extended.usdc.transfer.call({ to: '0x', amount: '1' })
  })

  test('getAddress still resolves to Address at the type level', () => {
    // Throws at runtime (1337 missing from the map), but the type is `Address`.
    expectTypeOf(extended.usdc.getAddress()).toEqualTypeOf<Address>()
  })

  test('amount remains string-only', () => {
    // @ts-expect-error - amount must be a string, even with an address override
    extended.usdc.transfer({ address: '0x', to: '0x', amount: 1n })
  })
})

describe('client without a chain', () => {
  // No chain → address cannot be resolved, so `address` is required.
  const extended = createClient({ account, transport: http() }).extend(usdc())

  test('actions require an address override', () => {
    extended.usdc.getBalance({ address: '0x', account: '0x' })
    // @ts-expect-error - `address` is required (no chain)
    extended.usdc.getBalance({ account: '0x' })
  })
})

describe('read actions', () => {
  const extended = client.extend(usdc())

  test('getBalance returns bigint, address optional', async () => {
    const balance = await extended.usdc.getBalance({ account: '0x' })
    expectTypeOf(balance).toEqualTypeOf<bigint>()
    extended.usdc.getBalance({ account: '0x', address: '0x' })
  })

  test('no amount / decimals on read actions', () => {
    extended.usdc.getBalance({
      account: '0x',
      // @ts-expect-error - read actions have no `amount`
      amount: '1',
    })
    extended.usdc.getBalance({
      account: '0x',
      // @ts-expect-error - read actions have no `decimals` override
      decimals: 6,
    })
  })

  test('getMetadata return type', async () => {
    const metadata = await extended.usdc.getMetadata()
    expectTypeOf(metadata).toEqualTypeOf<{
      decimals: number
      name: string
      symbol: string
      totalSupply: bigint
    }>()
  })
})

describe('helpers', () => {
  const extended = client.extend(usdc())

  test('getAddress returns Address', () => {
    expectTypeOf(extended.usdc.getAddress()).toEqualTypeOf<Address>()
    expectTypeOf(extended.usdc.getAddress(mainnet.id)).toEqualTypeOf<Address>()
  })

  test('addresses is an address map', () => {
    expectTypeOf(extended.usdc.addresses).toEqualTypeOf<typeof Addresses.usdc>()
  })

  test('.call and .extractEvent on write actions', () => {
    expectTypeOf(extended.usdc.transfer.call).toBeFunction()
    expectTypeOf(extended.usdc.transfer.extractEvent).toBeFunction()
  })
})

describe('sync actions', () => {
  const extended = client.extend(usdc())

  test('returns receipt', async () => {
    const result = await extended.usdc.transferSync({
      to: '0x',
      amount: '1',
    })
    expectTypeOf(result.receipt).toEqualTypeOf<TransactionReceipt>()
  })
})

describe('define', () => {
  test('requires addresses and decimals', () => {
    Decorator.define('dai', {
      addresses: { [mainnet.id]: '0x' },
      decimals: 18,
    })
    // @ts-expect-error - missing `decimals`
    Decorator.define('dai', { addresses: { [mainnet.id]: '0x' } })
    // @ts-expect-error - missing `addresses`
    Decorator.define('dai', { decimals: 18 })
  })

  test('factory accepts address + decimals overrides', () => {
    client.extend(usdc({ addresses: { [mainnet.id]: '0x' } }))
    client.extend(usdc({ decimals: 18 }))
    client.extend(usdc({ addresses: { [localhost.id]: '0x' }, decimals: 18 }))
    // no overrides is fine
    client.extend(usdc())
  })

  test('override on an unsupported chain makes address optional', () => {
    // `localhost` has no USDC by default, so `address` is normally required.
    // Supplying an override for that chain relaxes the requirement.
    const extended = createClient({
      account,
      chain: localhost,
      transport: http(),
    }).extend(usdc({ addresses: { [localhost.id]: '0x' } }))
    extended.usdc.transfer({ to: '0x', amount: '1' })
  })
})
