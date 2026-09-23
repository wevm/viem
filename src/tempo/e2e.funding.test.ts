import { NativeDexFunding } from 'ox/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { accounts, addresses, getClient } from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import {
  call,
  estimateGas,
  getTransaction,
  prepareTransactionRequest,
  sendTransactionSync,
  signTransaction,
} from '../actions/index.js'
import { parseAbi, parseEventLogs, parseUnits } from '../index.js'
import { Account, Actions } from './index.js'
import * as Transaction from './Transaction.js'

const client = getClient()
const output = addresses.pathUsd
const source = '0x1120000000000000000000000000000000000001' as const
const recipient = '0x8888888888888888888888888888888888888888' as const
let inputs: readonly [`0x${string}`, `0x${string}`]

beforeAll(async () => {
  const first = await setupToken({
    name: 'USDC.e',
    symbol: 'USDC.e',
    quoteToken: output,
  })
  const second = await setupToken({
    name: 'OUSD',
    symbol: 'OUSD',
    quoteToken: output,
  })
  inputs = [first.token, second.token]
  for (const token of inputs)
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      token,
      amount: parseUnits('1000', 6),
      type: 'buy',
      tick: 0,
    })
})
afterAll(async () => {
  await fetch(`${rpcUrl}/stop`)
})

async function setupToken(parameters: {
  name?: string
  symbol?: string
  quoteToken: `0x${string}`
}) {
  const { token } = await Actions.token.createSync(client, {
    account: accounts[0],
    admin: accounts[0],
    currency: 'USD',
    name: 'Test Token',
    symbol: 'TST',
    ...parameters,
  })
  await Actions.token.grantRolesSync(client, {
    account: accounts[0],
    roles: ['issuer'],
    to: accounts[0].address,
    token,
  })
  await Actions.token.mintSync(client, {
    account: accounts[0],
    amount: parseUnits('10000', 6),
    to: accounts[0].address,
    token,
  })
  return { token }
}

describe('sendTransactionSync', () => {
  test('default', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
      gas: undefined,
    })
    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('470', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[1],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('480', 6))
    const tx = await getTransaction(client, { hash: receipt.transactionHash })
    expect(tx.requireFunds).toEqual(request.requireFunds)
  })
  test('uses the node RPC signer for a funded payment', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = accounts[0].address
    const before = (
      await Actions.token.getBalance(client, {
        token: output,
        account: accounts[0].address,
      })
    ).amount
    const prepared = await prepareTransactionRequest(client, {
      ...request,
      account,
      requireFunds: [
        { ...fundingRequirement, amount: before + parseUnits('50', 6) },
      ],
      feePayer: undefined,
      feeToken: addresses.alphaUsd,
    })
    expect(prepared.requireFunds).toEqual([
      { ...fundingRequirement, amount: before + parseUnits('50', 6) },
    ])
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
      parseUnits('30', 6),
      parseUnits('20', 6),
    ])
    expect(
      (
        await Actions.token.getBalance(client, {
          token: output,
          account: accounts[0].address,
        })
      ).amount,
    ).toBe(before)
  })
})

describe('prepareTransactionRequest', () => {
  test('preserves requirements through preparation and signing', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const prepared = await prepareTransactionRequest(client, {
      ...request,
      account,
    })
    expect(prepared.requireFunds).toEqual(request.requireFunds)
    const signed = await signTransaction(client, prepared)
    expect(
      Transaction.deserialize(signed as Transaction.TransactionSerializedTempo)
        .requireFunds,
    ).toEqual(request.requireFunds)
  })
})

describe('estimateGas', () => {
  test('includes funding without moving balances', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    expect(await estimateGas(client, { ...request, account })).toBeGreaterThan(
      0n,
    )
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('call', () => {
  test('simulates funding and payment without persisting state', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await call(client, { ...request, account })
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('behavior', () => {
  test('uses the existing balance before sourcing the shortfall', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: output,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    const receipt = await sendTransactionSync(client, { ...request, account })
    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('470', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[1],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('490', 6))
  })

  test('continues after a source with zero input capacity', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const funding = fundingRequirement
    funding.sources[0]!.data = NativeDexFunding.encode({
      tokenIn: inputs[0],
      maxAmountIn: 0n,
    })
    expect(
      (
        await sendTransactionSync(client, {
          ...request,
          account,
          requireFunds: [funding],
        })
      ).status,
    ).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[1],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('450', 6))
  })

  test('repeated requirements specify target balances', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
      requireFunds: [
        { ...fundingRequirement, amount: parseUnits('20', 6) },
        fundingRequirement,
      ],
    })
    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('450', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[1],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('rolls back funding when the payment fails', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const receipt = await sendTransactionSync(client, {
      ...request,
      account,
      gas: 5_000_000n,
      throwOnReceiptRevert: false,
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('51', 6),
        }),
      ],
    })
    expect(receipt.status).toBe('reverted')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[1],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('rejects insufficient input capacity without moving funds', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await expect(
      estimateGas(client, {
        ...request,
        account,
        requireFunds: [
          {
            ...fundingRequirement,
            sources: fundingRequirement.sources.slice(0, 1),
          },
        ],
      }),
    ).rejects.toThrow()
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('funding cannot pay transaction fees', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await expect(
      sendTransactionSync(client, {
        ...request,
        account,
        feePayer: undefined,
      }),
    ).rejects.toThrow()
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: output,
      to: account.address,
      amount: parseUnits('1', 6),
    })
    expect(
      (
        await sendTransactionSync(client, {
          ...request,
          account,
          feePayer: undefined,
        })
      ).status,
    ).toBe('success')
  })
  test('rejects a source without liquidity', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const { token } = await setupToken({ quoteToken: output })
    await Actions.token.mintSync(client, {
      account: accounts[0],
      token,
      to: account.address,
      amount: parseUnits('100', 6),
    })
    await expect(
      call(client, {
        ...request,
        account,
        requireFunds: [
          {
            ...fundingRequirement,
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
    expect(
      (
        await Actions.token.getBalance(client, {
          token,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('100', 6))
  })

  test('rechecks earlier balances after later requirements', async () => {
    const fundingRequirement = {
      token: output,
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        {
          target: source,
          data: NativeDexFunding.encode({
            tokenIn: inputs[0],
            maxAmountIn: parseUnits('30', 6),
          }),
        },
        {
          target: source,
          data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
        },
      ],
    }
    const request = {
      requireFunds: [fundingRequirement],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      feePayer: accounts[0],
      throwOnReceiptRevert: true,
      gas: 2_000_000n,
    }
    const account = Account.fromSecp256k1(generatePrivateKey())
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      token: inputs[0],
      amount: parseUnits('100', 6),
      type: 'sell',
      tick: 0,
    })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: output,
      to: account.address,
      amount: parseUnits('50', 6),
    })
    const second = {
      token: inputs[0],
      amount: parseUnits('520', 6),
      slippageBps: 0,
      sources: [
        { target: source, data: NativeDexFunding.encode({ tokenIn: output }) },
      ],
    }
    const parameters = { ...request, account, calls: [{ to: recipient }] }
    await call(client, { ...parameters, requireFunds: [second] })
    await expect(
      call(client, {
        ...parameters,
        requireFunds: [fundingRequirement, second],
      }),
    ).rejects.toThrow()
    expect(
      (
        await Actions.token.getBalance(client, {
          token: inputs[0],
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})
