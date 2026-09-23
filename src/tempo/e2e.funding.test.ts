import { NativeDexFunding } from 'ox/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
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

const client = getClient()
const output = Addresses.alphaUsd
const source = Addresses.nativeDexFundingSource
const recipient = '0x8888888888888888888888888888888888888888' as const

beforeAll(async () => {
  await Actions.token.transferSync(client, {
    account: accounts[0],
    token: Addresses.pathUsd,
    to: accounts[1].address,
    amount: parseUnits('100', 6),
  })

  await Actions.dex.placeSync(client, {
    account: accounts[0],
    token: Addresses.alphaUsd,
    amount: parseUnits('1000', 6),
    type: 'sell',
    tick: 0,
  })
  await Actions.dex.placeSync(client, {
    account: accounts[0],
    token: Addresses.betaUsd,
    amount: parseUnits('1000', 6),
    type: 'buy',
    tick: 0,
  })
})

afterAll(async () => {
  await fetch(`${rpcUrl}/stop`)
})

describe('sendTransactionSync', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    const receipt = await sendTransactionSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: output,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            {
              target: source,
              data: NativeDexFunding.encode({
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('470', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.betaUsd,
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
              tokenIn: Addresses.pathUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            target: source,
            data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
          },
        ],
      },
    ])
  })

  test('uses the node RPC signer for a funded payment', async () => {
    const account = accounts[0].address
    await Actions.token.transferSync(client, {
      feeToken: Addresses.pathUsd,
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
    await mintInputs(account)

    const prepared = await prepareTransactionRequest(client, {
      feeToken: Addresses.pathUsd,
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
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
            },
          ],
          amount: parseUnits('50', 6),
        },
      ],
    })

    expect(prepared.requireFunds).toEqual([
      {
        token: output,
        slippageBps: 0,
        sources: [
          {
            target: source,
            data: NativeDexFunding.encode({
              tokenIn: Addresses.pathUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            target: source,
            data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
          },
        ],
        amount: parseUnits('50', 6),
      },
    ])

    const receipt = await sendTransactionSync(client, {
      feeToken: Addresses.pathUsd,
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
      feeToken: Addresses.pathUsd,
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

    await mintInputs(account.address)

    const prepared = await prepareTransactionRequest(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: output,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            {
              target: source,
              data: NativeDexFunding.encode({
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
              tokenIn: Addresses.pathUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            target: source,
            data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
              tokenIn: Addresses.pathUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            target: source,
            data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
          },
        ],
      },
    ])
  })
})

describe('estimateGas', () => {
  test('includes funding without moving balances', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    expect(
      await estimateGas(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            token: output,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              {
                target: source,
                data: NativeDexFunding.encode({
                  tokenIn: Addresses.pathUsd,
                  maxAmountIn: parseUnits('30', 6),
                }),
              },
              {
                target: source,
                data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('call', () => {
  test('simulates funding and payment without persisting state', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    await call(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: output,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            {
              target: source,
              data: NativeDexFunding.encode({
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('behavior', () => {
  test('uses the existing balance before sourcing the shortfall', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: output,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    const receipt = await sendTransactionSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: output,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            {
              target: source,
              data: NativeDexFunding.encode({
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('470', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.betaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('490', 6))
  })

  test('continues after a source with zero input capacity', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    expect(
      (
        await sendTransactionSync(client, {
          feePayer: accounts[1],
          feeToken: Addresses.pathUsd,
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
                    tokenIn: Addresses.pathUsd,
                    maxAmountIn: 0n,
                  }),
                },
                {
                  target: source,
                  data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.betaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('450', 6))
  })

  test('repeated requirements specify target balances', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    const receipt = await sendTransactionSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
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
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
                tokenIn: Addresses.pathUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            },
            {
              target: source,
              data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
            },
          ],
        },
      ],
    })

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('450', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.betaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('rejects a failing payment without moving funds', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    await expect(
      sendTransactionSync(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            token: output,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              {
                target: source,
                data: NativeDexFunding.encode({
                  tokenIn: Addresses.pathUsd,
                  maxAmountIn: parseUnits('30', 6),
                }),
              },
              {
                target: source,
                data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.betaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('rejects insufficient input capacity without moving funds', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    await expect(
      estimateGas(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
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
                  tokenIn: Addresses.pathUsd,
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('funding cannot pay transaction fees', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.mintSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      account: accounts[0],
      token: Addresses.betaUsd,
      to: account.address,
      amount: parseUnits('500', 6),
    })

    await expect(
      sendTransactionSync(client, {
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              {
                target: source,
                data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
              },
            ],
          },
        ],
        calls: [
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
      }),
    ).rejects.toThrow()

    expect(
      (
        await sendTransactionSync(client, {
          feePayer: accounts[1],
          feeToken: Addresses.pathUsd,
          requireFunds: [
            {
              token: Addresses.pathUsd,
              amount: parseUnits('50', 6),
              slippageBps: 0,
              sources: [
                {
                  target: source,
                  data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
                },
              ],
            },
          ],
          calls: [
            Actions.token.transfer.call({
              token: Addresses.pathUsd,
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

    await mintInputs(account.address)

    const token = Addresses.thetaUsd
    await Actions.token.mintSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      account: accounts[0],
      token,
      to: account.address,
      amount: parseUnits('100', 6),
    })
    const before = await Actions.token.getBalance(client, {
      account: account.address,
      token,
    })

    await expect(
      call(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
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
    ).toBe(before.amount)
  })

  test('rechecks earlier balances after later requirements', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address)

    await Actions.dex.placeSync(client, {
      account: accounts[0],
      token: Addresses.alphaUsd,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: 0,
    })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: output,
      to: account.address,
      amount: parseUnits('50', 6),
    })
    await call(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      account,
      calls: [{ to: recipient }],
      requireFunds: [
        {
          token: Addresses.pathUsd,
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
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
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
                  tokenIn: Addresses.pathUsd,
                  maxAmountIn: parseUnits('30', 6),
                }),
              },
              {
                target: source,
                data: NativeDexFunding.encode({ tokenIn: Addresses.betaUsd }),
              },
            ],
          },
          {
            token: Addresses.pathUsd,
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

async function mintInputs(to: `0x${string}`) {
  for (const token of [Addresses.pathUsd, Addresses.betaUsd] as const)
    await Actions.token.mintSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      account: accounts[0],
      token,
      to,
      amount: parseUnits('500', 6),
    })
}
