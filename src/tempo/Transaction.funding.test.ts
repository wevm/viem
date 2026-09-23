import { NativeDexFunding } from 'ox/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import {
  accounts,
  addresses,
  getClient,
  setupToken,
} from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import {
  call,
  estimateGas,
  getBlock,
  getTransaction,
  prepareTransactionRequest,
  sendTransactionSync,
  signTransaction,
} from '../actions/index.js'
import { parseAbi, parseEventLogs } from '../index.js'
import { Account, Actions } from './index.js'
import * as Transaction from './Transaction.js'

const maker = getClient({ account: accounts[0] })
const output = addresses.pathUsd
const source = '0x1120000000000000000000000000000000000001' as const
const recipient = '0x8888888888888888888888888888888888888888' as const
const unit = 1_000_000n
let inputs: readonly [`0x${string}`, `0x${string}`]

beforeAll(async () => {
  expect(await maker.request({ method: 'web3_clientVersion' })).toContain(
    '4926397',
  )
  while ((await getBlock(maker)).timestamp === 0n)
    await new Promise((resolve) => setTimeout(resolve, 50))
  const first = await setupToken(maker, {
    name: 'USDC.e',
    symbol: 'USDC.e',
    quoteToken: output,
  })
  const second = await setupToken(maker, {
    name: 'OUSD',
    symbol: 'OUSD',
    quoteToken: output,
  })
  inputs = [first.token, second.token]
  for (const token of inputs)
    await Actions.dex.placeSync(maker, {
      token,
      amount: 1_000n * unit,
      type: 'buy',
      tick: 0,
    })
})
afterAll(async () => {
  await fetch(`${rpcUrl}/stop`)
})

async function owner() {
  const account = Account.fromSecp256k1(generatePrivateKey())
  for (const token of inputs)
    await Actions.token.mintSync(maker, {
      token,
      to: account.address,
      amount: 500n * unit,
    })
  return getClient({ account })
}
function requirement(amount = 50n * unit) {
  return {
    token: output,
    amount,
    slippageBps: 0,
    sources: inputs.map((tokenIn, i) => ({
      target: source,
      data: NativeDexFunding.encode({
        tokenIn,
        ...(i === 0 ? { maxAmountIn: 30n * unit } : {}),
      }),
    })),
  }
}
function request() {
  return {
    requireFunds: [requirement()],
    calls: [
      Actions.token.transfer.call({
        token: output,
        to: recipient,
        amount: 50n * unit,
      }),
    ],
    feePayer: accounts[0],
    throwOnReceiptRevert: true,
    gas: 2_000_000n,
  }
}
async function balance(
  client: ReturnType<typeof getClient>,
  token: `0x${string}`,
  account: `0x${string}`,
) {
  return (await Actions.token.getBalance(client, { token, account })).amount
}

describe('sendTransactionSync', () => {
  test('funds from ordered sources and preserves RPC fields', async () => {
    const client = await owner()
    const receipt = await sendTransactionSync(client, {
      ...request(),
      gas: undefined,
    })
    expect(receipt.status).toBe('success')
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      470n * unit,
    )
    expect(await balance(client, inputs[1], client.account.address)).toBe(
      480n * unit,
    )
    const tx = await getTransaction(client, { hash: receipt.transactionHash })
    expect(tx.requireFunds).toEqual(request().requireFunds)
  })
})

describe('prepareTransactionRequest', () => {
  test('preserves requirements through preparation and signing', async () => {
    const client = await owner()
    const prepared = await prepareTransactionRequest(client, request())
    expect(prepared.requireFunds).toEqual(request().requireFunds)
    const signed = await signTransaction(client, prepared)
    expect(
      Transaction.deserialize(signed as Transaction.TransactionSerializedTempo)
        .requireFunds,
    ).toEqual(request().requireFunds)
  })
})

describe('estimateGas', () => {
  test('includes funding without moving balances', async () => {
    const client = await owner()
    expect(await estimateGas(client, request())).toBeGreaterThan(0n)
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      500n * unit,
    )
  })
})

describe('call', () => {
  test('simulates funding and payment without persisting state', async () => {
    const client = await owner()
    await call(client, request())
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      500n * unit,
    )
  })
})

describe('sendTransaction', () => {
  test('uses the node RPC signer for a funded payment', async () => {
    const client = getClient({ account: accounts[0].address })
    const before = await balance(client, output, accounts[0].address)
    const prepared = await prepareTransactionRequest(maker, {
      ...request(),
      requireFunds: [requirement(before + 50n * unit)],
      feePayer: undefined,
      feeToken: addresses.alphaUsd,
    })
    expect(prepared.requireFunds).toEqual([requirement(before + 50n * unit)])
    const receipt = await sendTransactionSync(client, {
      ...prepared,
      account: accounts[0].address,
    })
    expect(receipt.status).toBe('success')
    const tx = await getTransaction(client, { hash: receipt.transactionHash })
    expect(tx.requireFunds).toEqual(prepared.requireFunds)
    // The RPC signer also owns the resting orders, so assert funding events rather than its net input balance.
    const funded = parseEventLogs({
      abi: parseAbi([
        'event SourceFunded(address indexed account, address indexed assetOut, address indexed source, bytes32 requestHash, address assetIn, uint256 amountIn, uint256 amountOut)',
      ]),
      logs: receipt.logs,
    })
    expect(funded.map(({ args }) => args.amountOut)).toEqual([
      30n * unit,
      20n * unit,
    ])
    expect(await balance(client, output, accounts[0].address)).toBe(before)
  })
})

describe('behavior', () => {
  test('uses the existing balance before sourcing the shortfall', async () => {
    const client = await owner()
    await Actions.token.transferSync(maker, {
      token: output,
      to: client.account.address,
      amount: 10n * unit,
    })
    const receipt = await sendTransactionSync(client, request())
    expect(receipt.status).toBe('success')
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      470n * unit,
    )
    expect(await balance(client, inputs[1], client.account.address)).toBe(
      490n * unit,
    )
  })

  test('continues after a source with zero input capacity', async () => {
    const client = await owner()
    const funding = requirement()
    funding.sources[0]!.data = NativeDexFunding.encode({
      tokenIn: inputs[0],
      maxAmountIn: 0n,
    })
    expect(
      (
        await sendTransactionSync(client, {
          ...request(),
          requireFunds: [funding],
        })
      ).status,
    ).toBe('success')
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      500n * unit,
    )
    expect(await balance(client, inputs[1], client.account.address)).toBe(
      450n * unit,
    )
  })

  test('repeated requirements specify target balances', async () => {
    const client = await owner()
    const receipt = await sendTransactionSync(client, {
      ...request(),
      requireFunds: [requirement(20n * unit), requirement()],
    })
    expect(receipt.status).toBe('success')
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      450n * unit,
    )
    expect(await balance(client, inputs[1], client.account.address)).toBe(
      500n * unit,
    )
  })

  test('rolls back funding when the payment fails', async () => {
    const client = await owner()
    const receipt = await sendTransactionSync(client, {
      ...request(),
      gas: 5_000_000n,
      throwOnReceiptRevert: false,
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: 51n * unit,
        }),
      ],
    })
    expect(receipt.status).toBe('reverted')
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      500n * unit,
    )
    expect(await balance(client, inputs[1], client.account.address)).toBe(
      500n * unit,
    )
  })

  test('rejects insufficient input capacity without moving funds', async () => {
    const client = await owner()
    await expect(
      estimateGas(client, {
        ...request(),
        requireFunds: [
          { ...requirement(), sources: requirement().sources.slice(0, 1) },
        ],
      }),
    ).rejects.toThrow()
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      500n * unit,
    )
  })

  test('funding cannot pay transaction fees', async () => {
    const client = await owner()
    await expect(
      sendTransactionSync(client, { ...request(), feePayer: undefined }),
    ).rejects.toThrow()
    await Actions.token.transferSync(maker, {
      token: output,
      to: client.account.address,
      amount: 1n * unit,
    })
    expect(
      (await sendTransactionSync(client, { ...request(), feePayer: undefined }))
        .status,
    ).toBe('success')
  })
  test('rejects a source without liquidity', async () => {
    const client = await owner()
    const { token } = await setupToken(maker, { quoteToken: output })
    await Actions.token.mintSync(maker, {
      token,
      to: client.account.address,
      amount: 100n * unit,
    })
    await expect(
      call(client, {
        ...request(),
        requireFunds: [
          {
            ...requirement(),
            sources: [
              {
                target: source,
                data: NativeDexFunding.encode({ tokenIn: token }),
              },
            ],
          },
        ],
      }),
    ).rejects.toThrow()
    expect(await balance(client, token, client.account.address)).toBe(
      100n * unit,
    )
  })

  test('rechecks earlier balances after later requirements', async () => {
    const client = await owner()
    await Actions.dex.placeSync(maker, {
      token: inputs[0],
      amount: 100n * unit,
      type: 'sell',
      tick: 0,
    })
    await Actions.token.transferSync(maker, {
      token: output,
      to: client.account.address,
      amount: 50n * unit,
    })
    const second = {
      token: inputs[0],
      amount: 520n * unit,
      slippageBps: 0,
      sources: [
        { target: source, data: NativeDexFunding.encode({ tokenIn: output }) },
      ],
    }
    const parameters = { ...request(), calls: [{ to: recipient }] }
    await call(client, { ...parameters, requireFunds: [second] })
    await expect(
      call(client, { ...parameters, requireFunds: [requirement(), second] }),
    ).rejects.toThrow()
    expect(await balance(client, inputs[0], client.account.address)).toBe(
      500n * unit,
    )
  })
})
