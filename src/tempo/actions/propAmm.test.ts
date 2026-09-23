import * as Hex from 'ox/Hex'
import { encodeDeployData, parseUnits } from 'viem'
import {
  getBlock,
  readContract,
  sendTransactionSync,
  simulateContract,
  waitForTransactionReceipt,
  writeContractSync,
} from 'viem/actions'
import { Abis, Actions, Addresses, tempoActions } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient, setupToken } from '~test/tempo/config.js'
import * as Contracts from '~test/tempo/propAmmContracts.js'

const account = accounts[0]
const recipient = accounts[1]
const client = getClient({ account }).extend(tempoActions())
const customerId = Hex.fromString('propamm-local-test', { size: 32 })
const zeroMemo = Hex.fromString('', { size: 32 })

async function deploy<const abi extends readonly unknown[]>(
  abi: abi,
  bytecode: `0x${string}`,
  args: readonly unknown[],
) {
  const receipt = await sendTransactionSync(client, {
    data: encodeDeployData({ abi, args, bytecode } as never),
  })
  if (!receipt.contractAddress)
    throw new Error('Contract deployment returned no address.')
  return receipt.contractAddress
}

async function setup() {
  const { token: base } = await setupToken(client, {
    name: 'Base',
    symbol: 'BASE',
  })
  const { token: quote } = await setupToken(client, {
    name: 'Quote',
    symbol: 'QUOTE',
  })
  const { timestamp } = await getBlock(client)
  const oracle = await deploy(
    Contracts.mockOracle.abi,
    Contracts.mockOracle.bytecode,
    [18, 1_250_000_000_000_000_000n, timestamp],
  )
  const pool = await deploy(
    Contracts.directPropAmm.abi,
    Contracts.directPropAmm.bytecode,
    [
      base,
      quote,
      oracle,
      Addresses.addressRegistry,
      account.address,
      account.address,
      86_400n,
      50n,
    ],
  )
  for (const token of [base, quote]) {
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: token,
      args: [pool, parseUnits('1000', 6)],
      functionName: 'approve',
    })
    await writeContractSync(client, {
      abi: Abis.directPropAmm,
      address: pool,
      args: [token, parseUnits('500', 6), zeroMemo],
      functionName: 'fund',
    })
  }
  await writeContractSync(client, {
    abi: Abis.directPropAmm,
    address: pool,
    args: [account.address, true],
    functionName: 'setTakerAllowed',
  })
  await writeContractSync(client, {
    abi: Abis.directPropAmm,
    address: pool,
    args: [recipient.address, true],
    functionName: 'setRecipientAllowed',
  })
  await writeContractSync(client, {
    abi: Abis.directPropAmm,
    address: pool,
    functionName: 'unpause',
  })
  return { base, oracle, pool, quote }
}

let stack: Awaited<ReturnType<typeof setup>>
beforeAll(async () => {
  stack = await setup()
}, 60_000)

describe('propAmm', () => {
  test('reads the pool and permissions through decorated actions', async () => {
    expect(await client.propAmm.baseToken({ pool: stack.pool })).toBe(
      stack.base,
    )
    expect(await client.propAmm.quoteToken({ pool: stack.pool })).toBe(
      stack.quote,
    )
    expect(await client.propAmm.paused({ pool: stack.pool })).toBe(false)
    expect(
      await client.propAmm.takerAllowed({
        pool: stack.pool,
        taker: account.address,
      }),
    ).toBe(true)
    const resolved = await client.propAmm.resolveRecipient({
      pool: stack.pool,
      recipient: recipient.address,
    })
    expect(
      await client.propAmm.recipientAllowed({
        pool: stack.pool,
        recipient: resolved,
      }),
    ).toBe(true)
  })

  test('quotes, simulates, and sells base for quote', async () => {
    const amountIn = parseUnits('2', 6)
    const [amountOut, price, updatedAt] = await client.propAmm.getSwapQuote({
      amountIn,
      baseToQuote: true,
      mode: 'exactInput',
      customerId,
      pool: stack.pool,
      recipient: recipient.address,
      taker: account.address,
    })
    expect(amountOut).toBe(parseUnits('2.5', 6))
    const deadline = (await getBlock(client)).timestamp + 120n
    const options = {
      amountIn,
      baseToQuote: true,
      mode: 'exactInput' as const,
      customerId,
      deadline,
      expectedOraclePrice: price,
      minAmountOut: amountOut,
      minimumOracleUpdatedAt: updatedAt,
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    }
    await simulateContract(client, {
      ...Actions.propAmm.swap.call(options),
      account,
    })
    const before = await readContract(client, {
      abi: Abis.tip20,
      address: stack.quote,
      args: [recipient.address],
      functionName: 'balanceOf',
    })
    const trade = await client.propAmm.swapSync(options)
    expect(trade.amountOut).toBe(amountOut)
    expect(trade.tokenIn).toBe(stack.base)
    expect(trade.tokenOut).toBe(stack.quote)
    const after = await readContract(client, {
      abi: Abis.tip20,
      address: stack.quote,
      args: [recipient.address],
      functionName: 'balanceOf',
    })
    expect(after - before).toBe(amountOut)
  })

  test('quotes and buys an exact amount of base', async () => {
    const amountOut = parseUnits('1', 6)
    const [amountIn, price, updatedAt] = await Actions.propAmm.getSwapQuote(
      client,
      {
        amountOut,
        baseToQuote: false,
        mode: 'exactOutput',
        customerId,
        pool: stack.pool,
        recipient: recipient.address,
        taker: account.address,
      },
    )
    const before = await readContract(client, {
      abi: Abis.tip20,
      address: stack.base,
      args: [recipient.address],
      functionName: 'balanceOf',
    })
    const trade = await Actions.propAmm.swapSync(client, {
      amountOut,
      baseToQuote: false,
      mode: 'exactOutput',
      customerId,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: price,
      maxAmountIn: amountIn,
      minimumOracleUpdatedAt: updatedAt,
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    })
    expect(trade.amountIn).toBe(amountIn)
    const after = await readContract(client, {
      abi: Abis.tip20,
      address: stack.base,
      args: [recipient.address],
      functionName: 'balanceOf',
    })
    expect(after - before).toBe(amountOut)
  })

  test('supports both opposite directions and returns a hash from swap', async () => {
    const [amountOut, price, updatedAt] = await client.propAmm.getSwapQuote({
      amountIn: parseUnits('1', 6),
      baseToQuote: false,
      customerId,
      mode: 'exactInput',
      pool: stack.pool,
      recipient: recipient.address,
      taker: account.address,
    })
    const tradeId = Hex.random(32)
    const hash = await client.propAmm.swap({
      amountIn: parseUnits('1', 6),
      baseToQuote: false,
      customerId,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: price,
      minAmountOut: amountOut,
      minimumOracleUpdatedAt: updatedAt,
      mode: 'exactInput',
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    expect(receipt.status).toBe('success')
    expect(
      Actions.propAmm.swap.extractEvent(receipt.logs, {
        pool: stack.pool,
        tradeId,
      }).args.amountOut,
    ).toBe(amountOut)
    expect(
      Actions.propAmm.swap.extractEvent(receipt.logs, {
        pool: stack.pool,
        tradeId: tradeId.toUpperCase().replace('0X', '0x') as `0x${string}`,
      }).args.amountOut,
    ).toBe(amountOut)
    expect(() =>
      Actions.propAmm.swap.extractEvent([...receipt.logs, ...receipt.logs], {
        pool: stack.pool,
        tradeId,
      }),
    ).toThrow('Expected one TradeExecuted event')

    const [amountIn, buyPrice, buyUpdatedAt] =
      await client.propAmm.getSwapQuote({
        amountOut: parseUnits('1', 6),
        baseToQuote: true,
        customerId,
        mode: 'exactOutput',
        pool: stack.pool,
        recipient: recipient.address,
        taker: account.address,
      })
    const trade = await client.propAmm.swapSync({
      amountOut: parseUnits('1', 6),
      baseToQuote: true,
      customerId,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: buyPrice,
      maxAmountIn: amountIn,
      minimumOracleUpdatedAt: buyUpdatedAt,
      mode: 'exactOutput',
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    })
    expect(trade.amountIn).toBe(amountIn)
  })

  test('keeps rounding credit isolated by customer route', async () => {
    const routeA = Hex.fromString('route-a', { size: 32 })
    const routeB = Hex.fromString('route-b', { size: 32 })
    const quote = (customerId: `0x${string}`) =>
      client.propAmm.getSwapQuote({
        amountIn: 1n,
        baseToQuote: true,
        customerId,
        mode: 'exactInput',
        pool: stack.pool,
        recipient: recipient.address,
        taker: account.address,
      })
    const initialA = await quote(routeA)
    const initialB = await quote(routeB)
    expect(initialA).toEqual(initialB)
    await client.propAmm.swapSync({
      amountIn: 1n,
      baseToQuote: true,
      customerId: routeA,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: initialA[1],
      minAmountOut: initialA[0],
      minimumOracleUpdatedAt: initialA[2],
      mode: 'exactInput',
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    })
    expect(await quote(routeB)).toEqual(initialB)
    expect((await quote(routeA))[3]).not.toBe(initialB[3])
  })

  test('rejects unapproved callers, expired deadlines, and unavailable output', async () => {
    const [amountOut, price, updatedAt] = await client.propAmm.getSwapQuote({
      amountIn: 1_000_000n,
      baseToQuote: true,
      mode: 'exactInput',
      customerId,
      pool: stack.pool,
      recipient: recipient.address,
      taker: account.address,
    })
    const options = {
      amountIn: 1_000_000n,
      baseToQuote: true,
      mode: 'exactInput' as const,
      customerId,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: price,
      minAmountOut: amountOut,
      minimumOracleUpdatedAt: updatedAt,
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    }
    const call = Actions.propAmm.swap.call(options)
    await expect(
      simulateContract(client, { ...call, account: accounts[2] }),
    ).rejects.toThrow()
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call({ ...options, deadline: 1n }),
        account,
      }),
    ).rejects.toThrow()
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call({
          ...options,
          minAmountOut: parseUnits('1000', 6),
        }),
        account,
      }),
    ).rejects.toThrow()
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call({
          ...options,
          recipient: accounts[2].address,
        }),
        account,
      }),
    ).rejects.toThrow()
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call({
          ...options,
          expectedOraclePrice: price + 1n,
        }),
        account,
      }),
    ).rejects.toThrow()
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call({
          ...options,
          minimumOracleUpdatedAt: updatedAt + 1n,
        }),
        account,
      }),
    ).rejects.toThrow()
  })

  test('rejects paused pools and stale oracle observations', async () => {
    const [amountOut, price, updatedAt] = await client.propAmm.getSwapQuote({
      amountIn: 1_000_000n,
      baseToQuote: true,
      customerId,
      mode: 'exactInput',
      pool: stack.pool,
      recipient: recipient.address,
      taker: account.address,
    })
    const call = Actions.propAmm.swap.call({
      amountIn: 1_000_000n,
      baseToQuote: true,
      customerId,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: price,
      minAmountOut: amountOut,
      minimumOracleUpdatedAt: updatedAt,
      mode: 'exactInput',
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    })
    await writeContractSync(client, {
      abi: Abis.directPropAmm,
      address: stack.pool,
      functionName: 'pause',
    })
    await expect(
      simulateContract(client, { ...call, account }),
    ).rejects.toThrow()
    await writeContractSync(client, {
      abi: Abis.directPropAmm,
      address: stack.pool,
      functionName: 'unpause',
    })
    await writeContractSync(client, {
      abi: Contracts.mockOracle.abi,
      address: stack.oracle,
      args: [price, 1n],
      functionName: 'setPrice',
    })
    await expect(
      simulateContract(client, { ...call, account }),
    ).rejects.toThrow()
    await writeContractSync(client, {
      abi: Contracts.mockOracle.abi,
      address: stack.oracle,
      args: [price, (await getBlock(client)).timestamp],
      functionName: 'setPrice',
    })
  })

  test('enforces input allowance and exact-output maximum spend', async () => {
    const [amountIn, price, updatedAt] = await client.propAmm.getSwapQuote({
      amountOut: 1_000_000n,
      baseToQuote: true,
      customerId,
      mode: 'exactOutput',
      pool: stack.pool,
      recipient: recipient.address,
      taker: account.address,
    })
    const options = {
      amountOut: 1_000_000n,
      baseToQuote: true,
      customerId,
      deadline: (await getBlock(client)).timestamp + 120n,
      expectedOraclePrice: price,
      maxAmountIn: amountIn,
      minimumOracleUpdatedAt: updatedAt,
      mode: 'exactOutput' as const,
      oraclePriceToleranceBps: 0n,
      pool: stack.pool,
      recipient: recipient.address,
      tradeId: Hex.random(32),
    }
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: stack.base,
      args: [stack.pool, 0n],
      functionName: 'approve',
    })
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call(options),
        account,
      }),
    ).rejects.toThrow()
    await writeContractSync(client, {
      abi: Abis.tip20,
      address: stack.base,
      args: [stack.pool, parseUnits('1000', 6)],
      functionName: 'approve',
    })
    await expect(
      simulateContract(client, {
        ...Actions.propAmm.swap.call({
          ...options,
          maxAmountIn: amountIn - 1n,
        }),
        account,
      }),
    ).rejects.toThrow()
  })
})
