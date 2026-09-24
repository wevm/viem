import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
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
import {
  Abis,
  Account,
  Actions,
  Addresses,
  FundingSource,
  Tick,
} from './index.js'
import * as Transaction from './Transaction.js'

const client = getClient()
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
    type: 'buy',
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

describe('sendTransactionSync', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const receipt = await sendTransactionSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
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

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
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
        token: Addresses.pathUsd,
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          {
            to: source,
            data: FundingSource.encodeData({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            to: source,
            data: FundingSource.encodeData({ tokenIn: Addresses.betaUsd }),
          },
        ],
      },
    ])
  })

  test('sends a prepared funded payment', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    const before = (
      await Actions.token.getBalance(client, {
        token: Addresses.pathUsd,
        account: account.address,
      })
    ).amount
    expect(before).toBe(0n)
    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const prepared = await prepareTransactionRequest(client, {
      feeToken: Addresses.pathUsd,
      calls: [
        Actions.token.transfer.call({
          token: Addresses.pathUsd,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
      feePayer: accounts[1],
      requireFunds: [
        {
          token: Addresses.pathUsd,
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          amount: parseUnits('50', 6),
        },
      ],
    })

    expect(prepared.requireFunds).toEqual([
      {
        token: Addresses.pathUsd,
        slippageBps: 0,
        sources: [
          {
            to: source,
            data: FundingSource.encodeData({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            to: source,
            data: FundingSource.encodeData({ tokenIn: Addresses.betaUsd }),
          },
        ],
        amount: parseUnits('50', 6),
      },
    ])

    const receipt = await sendTransactionSync(client, {
      feeToken: Addresses.pathUsd,
      ...prepared,
      account,
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
          token: Addresses.pathUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(before)
  })
})

describe('prepareTransactionRequest', () => {
  test('preserves requirements through preparation and signing', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const prepared = await prepareTransactionRequest(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
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

    expect(prepared.requireFunds).toEqual([
      {
        token: Addresses.pathUsd,
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          {
            to: source,
            data: FundingSource.encodeData({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            to: source,
            data: FundingSource.encodeData({ tokenIn: Addresses.betaUsd }),
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
        token: Addresses.pathUsd,
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          {
            to: source,
            data: FundingSource.encodeData({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
          },
          {
            to: source,
            data: FundingSource.encodeData({ tokenIn: Addresses.betaUsd }),
          },
        ],
      },
    ])
  })
})

describe('estimateGas', () => {
  test('includes funding without moving balances', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    expect(
      await estimateGas(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                tokenIn: Addresses.alphaUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
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
    ).toBeGreaterThan(0n)
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('call', () => {
  test('simulates funding and payment without persisting state', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await call(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
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

    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('Actions.token.transferSync', () => {
  test('funds the transfer from the requested sources', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const { amount, receipt } = await Actions.token.transferSync(client, {
      account,
      amount: parseUnits('50', 6),
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })

    expect(receipt.status).toBe('success')
    expect(amount).toBe(parseUnits('50', 6))
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.requireFunds?.[0]).toMatchObject({
      token: Addresses.pathUsd,
      amount: parseUnits('50', 6),
    })
    expect(
      parseEventLogs({
        abi: Abis.tip20Funder,
        eventName: 'SourceFunded',
        logs: receipt.logs,
      }).map(({ args }) => args.amountOut),
    ).toEqual([parseUnits('30', 6), parseUnits('20', 6)])
  })

  test('requires explicit requirements when transferring from another account', async () => {
    await expect(
      Actions.token.transferSync(client, {
        account: accounts[0],
        amount: parseUnits('1', 6),
        from: accounts[1].address,
        requireFunds: [{ sources: [] }],
        to: recipient,
        token: Addresses.pathUsd,
      }),
    ).rejects.toThrow(
      'When `from` is set, specify `token` and `amount` in each `requireFunds` entry; funding targets the transaction sender, not `from`.',
    )
  })
})

describe('Actions.token.burnSync', () => {
  test('infers the burned token and amount', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await mintInputs(account.address, [Addresses.alphaUsd])
    await Actions.token.grantRolesSync(client, {
      account: accounts[0],
      roles: ['issuer'],
      to: account.address,
      token: Addresses.pathUsd,
    })

    const { amount, receipt } = await Actions.token.burnSync(client, {
      account,
      amount: parseUnits('25', 6),
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
        },
      ],
      token: Addresses.pathUsd,
    })

    expect(receipt.status).toBe('success')
    expect(amount).toBe(parseUnits('25', 6))
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.requireFunds?.[0]).toMatchObject({
      token: Addresses.pathUsd,
      amount: parseUnits('25', 6),
    })
  })
})

describe('Actions.dex.sellSync', () => {
  test('infers the exact input token and amount', async () => {
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      amount: parseUnits('100', 6),
      tick: 0,
      token: Addresses.betaUsd,
      type: 'sell',
    })
    const account = Account.fromSecp256k1(generatePrivateKey())
    await mintInputs(account.address, [Addresses.alphaUsd])

    const { receipt } = await Actions.dex.sellSync(client, {
      account,
      amountIn: parseUnits('25', 6),
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      minAmountOut: 1n,
      requireFunds: [
        {
          sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
        },
      ],
      tokenIn: Addresses.pathUsd,
      tokenOut: Addresses.betaUsd,
    })

    expect(receipt.status).toBe('success')
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.requireFunds?.[0]).toMatchObject({
      token: Addresses.pathUsd,
      amount: parseUnits('25', 6),
    })
  })
})

describe('behavior', () => {
  test('uses the existing balance before sourcing the shortfall', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: Addresses.pathUsd,
      to: account.address,
      amount: parseUnits('10', 6),
    })
    const receipt = await sendTransactionSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
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

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
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

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    expect(
      (
        await sendTransactionSync(client, {
          feePayer: accounts[1],
          feeToken: Addresses.pathUsd,
          calls: [
            Actions.token.transfer.call({
              token: Addresses.pathUsd,
              to: recipient,
              amount: parseUnits('50', 6),
            }),
          ],
          account,
          requireFunds: [
            {
              token: Addresses.pathUsd,
              amount: parseUnits('50', 6),
              slippageBps: 0,
              sources: [
                FundingSource.dex({
                  tokenIn: Addresses.alphaUsd,
                  maxAmountIn: 0n,
                }),
                FundingSource.dex({ tokenIn: Addresses.betaUsd }),
              ],
            },
          ],
        })
      ).status,
    ).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
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

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const receipt = await sendTransactionSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      calls: [
        Actions.token.transfer.call({
          token: Addresses.pathUsd,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      account,
      requireFunds: [
        {
          token: Addresses.pathUsd,
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          amount: parseUnits('20', 6),
        },
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              tokenIn: Addresses.alphaUsd,
              maxAmountIn: parseUnits('30', 6),
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
        },
      ],
    })

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
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

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await expect(
      sendTransactionSync(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                tokenIn: Addresses.alphaUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
            ],
          },
        ],
        account,
        calls: [
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('51', 6),
          }),
        ],
      }),
    ).rejects.toThrow('InsufficientBalance')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
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

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await expect(
      estimateGas(client, {
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        calls: [
          Actions.token.transfer.call({
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                tokenIn: Addresses.alphaUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
            ],
          },
        ],
      }),
    ).rejects.toThrow()
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('funding cannot pay transaction fees', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await mintInputs(account.address, [Addresses.betaUsd])

    await expect(
      sendTransactionSync(client, {
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [FundingSource.dex({ tokenIn: Addresses.betaUsd })],
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
              sources: [FundingSource.dex({ tokenIn: Addresses.betaUsd })],
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

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

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
            token: Addresses.pathUsd,
            to: recipient,
            amount: parseUnits('50', 6),
          }),
        ],
        account,
        requireFunds: [
          {
            token: Addresses.pathUsd,
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [FundingSource.dex({ tokenIn: token })],
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

  test('bounds funding input at a non-parity DEX price', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.thetaUsd])
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      token: Addresses.thetaUsd,
      amount: parseUnits('100', 6),
      type: 'buy',
      tick: Tick.fromPrice('0.98'),
    })

    const transaction = {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      account,
      calls: [
        Actions.token.transfer.call({
          token: Addresses.pathUsd,
          to: recipient,
          amount: parseUnits('50', 6),
        }),
      ],
      requireFunds: [
        {
          token: Addresses.pathUsd,
          amount: parseUnits('50', 6),
          sources: [FundingSource.dex({ tokenIn: Addresses.thetaUsd })],
        },
      ],
    } as const

    await expect(
      estimateGas(client, {
        ...transaction,
        requireFunds: [{ ...transaction.requireFunds[0], slippageBps: 100 }],
      }),
    ).rejects.toThrow('InsufficientFunding')

    const receipt = await sendTransactionSync(client, {
      ...transaction,
      requireFunds: [{ ...transaction.requireFunds[0], slippageBps: 300 }],
    })

    expect(receipt.status).toBe('success')
    const [funded] = parseEventLogs({
      abi: Abis.tip20Funder,
      eventName: 'SourceFunded',
      logs: receipt.logs,
    })
    expect(funded.args.amountIn).toBeGreaterThan(parseUnits('50.5', 6))
    expect(funded.args.amountIn).toBeLessThanOrEqual(parseUnits('51.5', 6))
    expect(funded.args.amountOut).toBe(parseUnits('50', 6))
  })

  test('rechecks earlier balances after later requirements', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await Actions.dex.placeSync(client, {
      account: accounts[0],
      token: Addresses.alphaUsd,
      amount: parseUnits('100', 6),
      type: 'sell',
      tick: 0,
    })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      token: Addresses.pathUsd,
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
          token: Addresses.alphaUsd,
          amount: parseUnits('520', 6),
          slippageBps: 0,
          sources: [FundingSource.dex({ tokenIn: Addresses.pathUsd })],
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
            token: Addresses.pathUsd,
            amount: parseUnits('80', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                tokenIn: Addresses.alphaUsd,
                maxAmountIn: parseUnits('30', 6),
              }),
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
            ],
          },
          {
            token: Addresses.alphaUsd,
            amount: parseUnits('520', 6),
            slippageBps: 0,
            sources: [FundingSource.dex({ tokenIn: Addresses.pathUsd })],
          },
        ],
      }),
    ).rejects.toThrow('InsufficientFunding')
    expect(
      (
        await Actions.token.getBalance(client, {
          token: Addresses.alphaUsd,
          account: account.address,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

async function mintInputs(to: `0x${string}`, tokens: readonly `0x${string}`[]) {
  for (const token of tokens)
    await Actions.token.mintSync(client, {
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      account: accounts[0],
      token,
      to,
      amount: parseUnits('500', 6),
    })
}
