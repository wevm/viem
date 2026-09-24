import type { Address, Hash } from 'viem'
import { expectTypeOf, test } from 'vitest'
import { tempoModerato } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { decorator } from '../Decorator.js'
import type { TransactionReceipt } from '../Transaction.js'
import * as propAmm from './propAmm.js'

const client = createClient({
  account: '0x0000000000000000000000000000000000000001',
  chain: tempoModerato,
  transport: custom({
    async request() {
      return null
    },
  }),
}).extend(decorator())

const pool = '0x0000000000000000000000000000000000000002'
const customerId = `0x${'01'.repeat(32)}` as const
const tradeId = `0x${'02'.repeat(32)}` as const
const route = {
  baseToQuote: true,
  customerId,
  mode: 'exactInput',
  pool,
  recipient: client.account.address,
} as const

test('pool reads and quotes preserve their public types', async () => {
  expectTypeOf(
    await client.propAmm.baseToken({ pool }),
  ).toEqualTypeOf<Address>()
  expectTypeOf(
    await client.propAmm.takerAllowed({ pool, taker: client.account.address }),
  ).toEqualTypeOf<boolean>()
  expectTypeOf(
    await client.propAmm.getSwapQuote({
      ...route,
      amountIn: 1n,
    }),
  ).toEqualTypeOf<{
    amountOut: bigint
    price: bigint
    updatedAt: bigint
    creditAfter: bigint
  }>()
  expectTypeOf(
    await client.propAmm.getSwapQuote({
      ...route,
      mode: 'exactOutput',
      amountOut: 1n,
    }),
  ).toEqualTypeOf<{
    amountIn: bigint
    price: bigint
    updatedAt: bigint
    creditAfter: bigint
  }>()
  expectTypeOf(
    await propAmm.getSwapQuote(client, { ...route, amountIn: 1n }),
  ).toEqualTypeOf<{
    amountOut: bigint
    price: bigint
    updatedAt: bigint
    creditAfter: bigint
  }>()
  expectTypeOf(
    await propAmm.getSwapQuote(client, {
      ...route,
      mode: 'exactOutput',
      amountOut: 1n,
    }),
  ).toEqualTypeOf<{
    amountIn: bigint
    price: bigint
    updatedAt: bigint
    creditAfter: bigint
  }>()
  expectTypeOf(
    propAmm.getSwapQuote.call({
      ...route,
      amountIn: 1n,
      taker: client.account.address,
    }).functionName,
  ).toEqualTypeOf<'quoteExactInputFor'>()
  expectTypeOf(
    propAmm.getSwapQuote.call({
      amountOut: 1n,
      baseToQuote: false,
      customerId,
      mode: 'exactOutput',
      pool,
      recipient: client.account.address,
      taker: client.account.address,
    }).functionName,
  ).toEqualTypeOf<'quoteExactOutputFor'>()
  expectTypeOf(
    client.propAmm.getSwapQuote.call({
      ...route,
      amountIn: 1n,
      taker: client.account.address,
    }).functionName,
  ).toEqualTypeOf<'quoteExactInputFor'>()
  expectTypeOf(
    client.propAmm.getSwapQuote.call({
      ...route,
      mode: 'exactOutput',
      amountOut: 1n,
      taker: client.account.address,
    }).functionName,
  ).toEqualTypeOf<'quoteExactOutputFor'>()
})

test('swap builders compose with standalone and decorated actions', async () => {
  const options = {
    ...route,
    amountIn: 1n,
    deadline: 1n,
    expectedOraclePrice: 1n,
    minAmountOut: 1n,
    minimumOracleUpdatedAt: 1n,
    tradeId,
  }
  expectTypeOf(await propAmm.swap(client, options)).toEqualTypeOf<Hash>()
  expectTypeOf(await client.propAmm.swap(options)).toEqualTypeOf<Hash>()
  expectTypeOf(
    propAmm.swap.call({ ...options, oraclePriceToleranceBps: 0n }).functionName,
  ).toEqualTypeOf<'swapExactInput'>()
  expectTypeOf(
    client.propAmm.swap.call({ ...options, oraclePriceToleranceBps: 0n })
      .functionName,
  ).toEqualTypeOf<'swapExactInput'>()
  await client.propAmm.swap.simulate({
    ...options,
    blockTag: 'latest',
    validation: true,
  })
  await propAmm.swap.simulate(client, {
    ...options,
    // @ts-expect-error Transaction gas is not a batch simulation option.
    gas: 1n,
  })
  const trade = await client.propAmm.swapSync(options)
  expectTypeOf(trade.receipt).toEqualTypeOf<TransactionReceipt>()
  expectTypeOf(trade.amountOut).toEqualTypeOf<bigint>()
  expectTypeOf(trade.receipt.transactionHash).toEqualTypeOf<Hash>()
})

test('quote and swap accept omitted defaults', async () => {
  const quote = await client.propAmm.getSwapQuote({
    amountIn: 1n,
    customerId,
    mode: 'exactInput',
    pool,
  })
  expectTypeOf(quote.amountOut).toEqualTypeOf<bigint>()
  const parameters = {
    amountOut: 1n,
    customerId,
    expectedOraclePrice: quote.price,
    maxAmountIn: 2n,
    minimumOracleUpdatedAt: quote.updatedAt,
    mode: 'exactOutput' as const,
    pool,
    tradeId,
  } as const
  expectTypeOf(await client.propAmm.swap(parameters)).toEqualTypeOf<Hash>()
  await client.propAmm.swapSync(parameters)
  await propAmm.swap.estimateGas(client, parameters)
  await client.propAmm.swap.simulate(parameters)
})
