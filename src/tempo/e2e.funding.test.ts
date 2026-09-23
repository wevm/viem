import { NativeDexFunding } from 'ox/tempo'
import { tempoLocalnet } from 'viem/chains'
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
import { parseEventLogs, parseUnits } from '../index.js'
import { Abis, Account, Actions, Addresses } from './index.js'
import * as Transaction from './Transaction.js'

const client = getClient({
  chain: tempoLocalnet.extend({ feeToken: addresses.pathUsd }),
})
let output: `0x${string}`
const source = Addresses.nativeDexFundingSource
const recipient = '0x8888888888888888888888888888888888888888' as const
let inputs: readonly [`0x${string}`, `0x${string}`]
beforeAll(async () => {
  output = (
    await setupToken({
      name: 'USDC',
      symbol: 'USDC',
      quoteToken: addresses.pathUsd,
    })
  ).token
  output = output.toLowerCase() as `0x${string}`
  const first = await setupToken({
    name: 'USDC.e',
    symbol: 'USDC.e',
    quoteToken: output,
  })
  inputs = [
    first.token,
    (
      await setupToken({
        name: 'OUSD',
        symbol: 'OUSD',
        quoteToken: output,
      })
    ).token,
  ]
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
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const receipt = await sendTransactionSync(client, {
      requireFunds: [
        {
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
        },
      ],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
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
    expect(tx.requireFunds).toEqual([
      {
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
      },
    ])
  })
  test('uses the node RPC signer for a funded payment', async () => {
    const account = accounts[0].address
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: output,
      to: recipient,
      amount: (
        await Actions.token.getBalance(client, { account, token: output })
      ).amount,
    })
    const before = (
      await Actions.token.getBalance(client, {
        token: output,
        account: accounts[0].address,
      })
    ).amount
    expect(before).toBe(0n)
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account,
        amount: parseUnits('500', 6),
      })
    const prepared = await prepareTransactionRequest(client, {
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
      requireFunds: [
        {
          token: output,
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
          amount: parseUnits('50', 6),
        },
      ],
      feeToken: addresses.alphaUsd,
    })
    expect(prepared.requireFunds).toEqual([
      {
        token: output,
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
        amount: parseUnits('50', 6),
      },
    ])
    const receipt = await sendTransactionSync(client, {
      ...prepared,
      account: accounts[0].address,
    })
    expect(receipt.status).toBe('success')
    const tx = await getTransaction(client, { hash: receipt.transactionHash })
    expect(tx.requireFunds).toEqual(prepared.requireFunds)
    const funded = parseEventLogs({
      abi: Abis.tip20Funder,
      eventName: 'SourceFunded',
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
    await Actions.token.mintSync(client, {
      account: accounts[0],
      token: output,
      to: account,
      amount: parseUnits('1000', 6),
    })
  })
})
describe('prepareTransactionRequest', () => {
  test('preserves requirements through preparation and signing', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const prepared = await prepareTransactionRequest(client, {
      requireFunds: [
        {
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
        },
      ],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
    })
    expect(prepared.requireFunds).toEqual([
      {
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
      },
    ])
    const signed = await signTransaction(client, prepared)
    expect(
      Transaction.deserialize(signed as Transaction.TransactionSerializedTempo)
        .requireFunds,
    ).toEqual([
      {
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
      },
    ])
  })
})
describe('estimateGas', () => {
  test('includes funding without moving balances', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    expect(
      await estimateGas(client, {
        requireFunds: [
          {
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
          },
        ],
        calls: [
          Actions.token.transfer.call({
            token: output,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
      }),
    ).toBeGreaterThan(0n)
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
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await call(client, {
      requireFunds: [
        {
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
        },
      ],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
    })
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
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
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
    const receipt = await sendTransactionSync(client, {
      requireFunds: [
        {
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
        },
      ],
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
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
    ).toBe(parseUnits('490', 6))
  })
  test('continues after a source with zero input capacity', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    expect(
      (
        await sendTransactionSync(client, {
          calls: [
            Actions.token.transfer.call({
              token: output,
              to: recipient,
              amount: parseUnits('50', 6),
            }),
          ],
          account,
          requireFunds: [
            {
              token: output,
              amount: parseUnits('50', 6),
              slippageBps: 0,
              sources: [
                {
                  target: source,
                  data: NativeDexFunding.encode({
                    tokenIn: inputs[0],
                    maxAmountIn: 0n,
                  }),
                },
                {
                  target: source,
                  data: NativeDexFunding.encode({ tokenIn: inputs[1] }),
                },
              ],
            },
          ],
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
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    const receipt = await sendTransactionSync(client, {
      calls: [
        Actions.token.transfer.call({
          token: output,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
      requireFunds: [
        {
          token: output,
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
          amount: parseUnits('20', 6),
        },
        {
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
        },
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
  test('rejects a failing payment without moving funds', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await expect(
      sendTransactionSync(client, {
        requireFunds: [
          {
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
          },
        ],
        account,
        calls: [
          Actions.token.transfer.call({
            token: output,
            to: recipient,
            amount: parseUnits('51', 6),
          }),
        ],
      }),
    ).rejects.toThrow('InsufficientBalance')
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
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    for (const token of inputs)
      await Actions.token.mintSync(client, {
        account: accounts[0],
        token,
        to: account.address,
        amount: parseUnits('500', 6),
      })
    await expect(
      estimateGas(client, {
        calls: [
          Actions.token.transfer.call({
            token: output,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
        requireFunds: [
          {
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
            ],
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
        requireFunds: [
          {
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
          },
        ],
        calls: [
          Actions.token.transfer.call({
            token: output,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
      }),
    ).rejects.toThrow()
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('1', 6),
    })
    expect(
      (
        await sendTransactionSync(client, {
          requireFunds: [
            {
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
            },
          ],
          calls: [
            Actions.token.transfer.call({
              token: output,
              to: recipient,
              amount: parseUnits('50', 6),
            }),
          ],
          account,
        })
      ).status,
    ).toBe('success')
  })
  test('rejects a source without liquidity', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
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
        calls: [
          Actions.token.transfer.call({
            token: output,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
        requireFunds: [
          {
            token: output,
            amount: parseUnits('50', 6),
            slippageBps: 0,
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
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
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
    await call(client, {
      account,
      calls: [{ to: recipient }],
      requireFunds: [
        {
          token: inputs[0],
          amount: parseUnits('520', 6),
          slippageBps: 0,
          sources: [
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: output }),
            },
          ],
        },
      ],
    })
    await expect(
      call(client, {
        account,
        calls: [{ to: recipient }],
        requireFunds: [
          {
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
          },
          {
            token: inputs[0],
            amount: parseUnits('520', 6),
            slippageBps: 0,
            sources: [
              {
                target: source,
                data: NativeDexFunding.encode({ tokenIn: output }),
              },
            ],
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
})
