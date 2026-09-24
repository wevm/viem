import { assert, beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import { deployEarnStack } from '~test/tempo/earn.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import {
  call,
  estimateGas,
  getTransaction,
  prepareTransactionRequest,
  readContract,
  sendTransactionSync,
  signTransaction,
} from '../actions/index.js'
import { ContractFunctionRevertedError } from '../errors/contract.js'
import { parseEventLogs, parseUnits } from '../index.js'
import {
  Abis,
  Account,
  Actions,
  Addresses,
  FundingPolicy,
  FundingSource,
  Tick,
} from './index.js'
import * as Transaction from './Transaction.js'

const client = getClient()
const recipient = '0x8888888888888888888888888888888888888888' as const

beforeAll(async () => {
  await Actions.token.transferSync(client, {
    account: accounts[0],
    amount: parseUnits('100', 6),
    to: accounts[1].address,
    token: Addresses.pathUsd,
  })

  await Actions.dex.placeSync(client, {
    account: accounts[0],
    amount: parseUnits('1000', 6),
    tick: 0,
    token: Addresses.alphaUsd,
    type: 'buy',
  })
  await Actions.dex.placeSync(client, {
    account: accounts[0],
    amount: parseUnits('1000', 6),
    tick: 0,
    token: Addresses.betaUsd,
    type: 'buy',
  })
})

describe('sendTransactionSync', () => {
  test('default', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const receipt = await sendTransactionSync(client, {
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('470', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.betaUsd,
        })
      ).amount,
    ).toBe(parseUnits('480', 6))
    const tx = await getTransaction(client, { hash: receipt.transactionHash })
    expect(tx.requireFunds).toEqual([
      {
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          FundingSource.dex({
            maxAmountIn: parseUnits('30', 6),
            tokenIn: Addresses.alphaUsd,
          }),
          FundingSource.dex({ tokenIn: Addresses.betaUsd }),
        ],
        token: Addresses.pathUsd,
      },
    ])
  })

  test('sends a prepared funded payment', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    const before = (
      await Actions.token.getBalance(client, {
        account: account.address,
        token: Addresses.pathUsd,
      })
    ).amount
    expect(before).toBe(0n)
    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const prepared = await prepareTransactionRequest(client, {
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(prepared.requireFunds).toEqual([
      {
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          FundingSource.dex({
            maxAmountIn: parseUnits('30', 6),
            tokenIn: Addresses.alphaUsd,
          }),
          FundingSource.dex({ tokenIn: Addresses.betaUsd }),
        ],
        token: Addresses.pathUsd,
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
          account: account.address,
          token: Addresses.pathUsd,
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
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(prepared.requireFunds).toEqual([
      {
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          FundingSource.dex({
            maxAmountIn: parseUnits('30', 6),
            tokenIn: Addresses.alphaUsd,
          }),
          FundingSource.dex({ tokenIn: Addresses.betaUsd }),
        ],
        token: Addresses.pathUsd,
      },
    ])

    const signed = await signTransaction(client, prepared)
    expect(
      Transaction.deserialize(signed as Transaction.TransactionSerializedTempo)
        .requireFunds,
    ).toEqual([
      {
        amount: parseUnits('50', 6),
        slippageBps: 0,
        sources: [
          FundingSource.dex({
            maxAmountIn: parseUnits('30', 6),
            tokenIn: Addresses.alphaUsd,
          }),
          FundingSource.dex({ tokenIn: Addresses.betaUsd }),
        ],
        token: Addresses.pathUsd,
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
        account,
        calls: [
          Actions.token.transfer.call({
            amount: parseUnits('50', 6),
            to: recipient,
            token: Addresses.pathUsd,
          }),
        ],
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                maxAmountIn: parseUnits('30', 6),
                tokenIn: Addresses.alphaUsd,
              }),
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
            ],
            token: Addresses.pathUsd,
          },
        ],
      }),
    ).toBeGreaterThan(0n)
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
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
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
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
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
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
      amount: parseUnits('50', 6),
      token: Addresses.pathUsd,
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
      amount: parseUnits('25', 6),
      token: Addresses.pathUsd,
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
      amount: parseUnits('25', 6),
      token: Addresses.pathUsd,
    })
  })
})

describe('behavior: `keyAuthorization` on transaction', () => {
  test.each(['secp256k1', 'p256', 'webAuthn'] as const)(
    'funds with an existing policy (%s)',
    async (type) => {
      const { account, accessKey } = await setupAccessKey(type)
      const { policyId, rules } = await Actions.funding.createPolicySync(
        client,
        {
          account,
          admins: [account.address],
          feePayer: accounts[1],
          rules: {
            maxSlippageBps: 100,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        },
      )
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          accessKey,
          account,
          fundingPolicy: policyId,
          limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
        },
      )
      for (let i = 0; i < 2; i++) {
        const discovery = await Actions.funding.discover(client, {
          account: account.address,
          amount: parseUnits('25', 6),
          policyId,
          rules,
          token: Addresses.pathUsd,
        })
        const { receipt } = await Actions.token.transferSync(client, {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization: i === 0 ? keyAuthorization : undefined,
          requireFunds: [discovery],
          to: recipient,
          token: Addresses.pathUsd,
        })
        expect(receipt.status).toBe('success')
        expect(
          await Actions.accessKey.getFundingPolicyId(client, {
            accessKey,
            account,
          }),
        ).toBe(policyId)
      }
      expect(
        (
          await Actions.accessKey.getRemainingLimit(client, {
            accessKey,
            account,
            token: Addresses.pathUsd,
          })
        ).remaining,
      ).toBe(0n)
      await expect(
        Actions.token
          .transferSync(client, {
            account: accessKey,
            amount: parseUnits('1', 6),
            feePayer: accounts[1],
            requireFunds: [
              {
                rules,
                sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
              },
            ],
            to: recipient,
            token: Addresses.pathUsd,
          })
          .catch((error) => {
            throw (
              error.walk?.(
                (cause: Error) =>
                  cause instanceof ContractFunctionRevertedError,
              ) ?? new Error(error.shortMessage ?? error.message)
            )
          }),
      ).rejects.toThrowErrorMatchingSnapshot()
    },
  )

  test('creates an inline policy, installs a key, and pays with keyAuthorization', async () => {
    const { account, accessKey } = await setupAccessKey('p256')
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: {
        admins: [account.address],
        rules: {
          maxSlippageBps: 100,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
            ],
          },
        },
      },
      limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
    })
    assert(typeof keyAuthorization.fundingPolicy === 'object')
    const { rules } = keyAuthorization.fundingPolicy

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: parseUnits('25', 6),
      feePayer: accounts[1],
      keyAuthorization,
      requireFunds: [
        {
          rules,
          sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })
    expect(receipt.status).toBe('success')
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.keyAuthorization?.fundingPolicy).toEqual({
      admins: [account.address.toLowerCase()],
      rules,
    })
    expect(transaction.requireFunds?.[0]?.policyRules).toBe(
      FundingPolicy.encode(rules),
    )
    const policyId = await Actions.accessKey.getFundingPolicyId(client, {
      accessKey,
      account,
    })
    expect(policyId).toBeGreaterThan(0n)
    expect(
      (await Actions.funding.getPolicy(client, { policyId })).rulesHash,
    ).toBe(FundingPolicy.hash(rules))
    const { receipt: reused } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: parseUnits('25', 6),
      feePayer: accounts[1],
      requireFunds: [
        {
          rules,
          sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })
    expect(reused.status).toBe('success')
    expect(
      (await getTransaction(client, { hash: reused.transactionHash }))
        .keyAuthorization,
    ).toBeNull()
  })
})

describe('behavior: owner-authorized', () => {
  test('uses the existing balance before sourcing the shortfall', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: parseUnits('10', 6),
      to: account.address,
      token: Addresses.pathUsd,
    })
    const receipt = await sendTransactionSync(client, {
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('470', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.betaUsd,
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
          account,
          calls: [
            Actions.token.transfer.call({
              amount: parseUnits('50', 6),
              to: recipient,
              token: Addresses.pathUsd,
            }),
          ],
          feePayer: accounts[1],
          feeToken: Addresses.pathUsd,
          requireFunds: [
            {
              amount: parseUnits('50', 6),
              slippageBps: 0,
              sources: [
                FundingSource.dex({
                  maxAmountIn: 0n,
                  tokenIn: Addresses.alphaUsd,
                }),
                FundingSource.dex({ tokenIn: Addresses.betaUsd }),
              ],
              token: Addresses.pathUsd,
            },
          ],
        })
      ).status,
    ).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.betaUsd,
        })
      ).amount,
    ).toBe(parseUnits('450', 6))
  })

  test('repeated requirements specify target balances', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const receipt = await sendTransactionSync(client, {
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('20', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
        {
          amount: parseUnits('50', 6),
          slippageBps: 0,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('30', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({ tokenIn: Addresses.betaUsd }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('450', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.betaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('rejects a failing payment without moving funds', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await expect(
      sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.transfer.call({
            amount: parseUnits('51', 6),
            to: recipient,
            token: Addresses.pathUsd,
          }),
        ],
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                maxAmountIn: parseUnits('30', 6),
                tokenIn: Addresses.alphaUsd,
              }),
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
            ],
            token: Addresses.pathUsd,
          },
        ],
      }),
    ).rejects.toThrow('InsufficientBalance')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.betaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('rejects insufficient input capacity without moving funds', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    await expect(
      estimateGas(client, {
        account,
        calls: [
          Actions.token.transfer.call({
            amount: parseUnits('50', 6),
            to: recipient,
            token: Addresses.pathUsd,
          }),
        ],
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                maxAmountIn: parseUnits('30', 6),
                tokenIn: Addresses.alphaUsd,
              }),
            ],
            token: Addresses.pathUsd,
          },
        ],
      }).catch((error) => {
        throw (
          error.walk?.(
            (cause: Error) => cause instanceof ContractFunctionRevertedError,
          ) ?? new Error(error.shortMessage ?? error.message)
        )
      }),
    ).rejects.toThrowErrorMatchingSnapshot()
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })

  test('funding cannot pay transaction fees', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())
    await mintInputs(account.address, [Addresses.betaUsd])

    await expect(
      sendTransactionSync(client, {
        account,
        calls: [
          Actions.token.transfer.call({
            amount: parseUnits('50', 6),
            to: recipient,
            token: Addresses.pathUsd,
          }),
        ],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [FundingSource.dex({ tokenIn: Addresses.betaUsd })],
            token: Addresses.pathUsd,
          },
        ],
      }).catch((error) => {
        throw (
          error.walk?.(
            (cause: Error) => cause instanceof ContractFunctionRevertedError,
          ) ?? new Error(error.shortMessage ?? error.message)
        )
      }),
    ).rejects.toThrowErrorMatchingSnapshot()

    expect(
      (
        await sendTransactionSync(client, {
          account,
          calls: [
            Actions.token.transfer.call({
              amount: parseUnits('50', 6),
              to: recipient,
              token: Addresses.pathUsd,
            }),
          ],
          feePayer: accounts[1],
          feeToken: Addresses.pathUsd,
          requireFunds: [
            {
              amount: parseUnits('50', 6),
              slippageBps: 0,
              sources: [FundingSource.dex({ tokenIn: Addresses.betaUsd })],
              token: Addresses.pathUsd,
            },
          ],
        })
      ).status,
    ).toBe('success')
  })

  test('rejects a source without liquidity', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])

    const token = Addresses.thetaUsd
    await Actions.token.mintSync(client, {
      account: accounts[0],
      amount: parseUnits('100', 6),
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      to: account.address,
      token,
    })
    const before = await Actions.token.getBalance(client, {
      account: account.address,
      token,
    })

    await expect(
      call(client, {
        account,
        calls: [
          Actions.token.transfer.call({
            amount: parseUnits('50', 6),
            to: recipient,
            token: Addresses.pathUsd,
          }),
        ],
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            amount: parseUnits('50', 6),
            slippageBps: 0,
            sources: [FundingSource.dex({ tokenIn: token })],
            token: Addresses.pathUsd,
          },
        ],
      }).catch((error) => {
        throw (
          error.walk?.(
            (cause: Error) => cause instanceof ContractFunctionRevertedError,
          ) ?? new Error(error.shortMessage ?? error.message)
        )
      }),
    ).rejects.toThrowErrorMatchingSnapshot()
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token,
        })
      ).amount,
    ).toBe(before.amount)
  })

  test('bounds funding input at a non-parity DEX price', async () => {
    const account = Account.fromSecp256k1(generatePrivateKey())

    await mintInputs(account.address, [Addresses.thetaUsd])
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      amount: parseUnits('100', 6),
      tick: Tick.fromPrice('0.98'),
      token: Addresses.thetaUsd,
      type: 'buy',
    })

    const transaction = {
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('50', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          sources: [FundingSource.dex({ tokenIn: Addresses.thetaUsd })],
          token: Addresses.pathUsd,
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
      amount: parseUnits('100', 6),
      tick: 0,
      token: Addresses.alphaUsd,
      type: 'sell',
    })
    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: parseUnits('50', 6),
      to: account.address,
      token: Addresses.pathUsd,
    })
    await call(client, {
      account,
      calls: [{ to: recipient }],
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      requireFunds: [
        {
          amount: parseUnits('520', 6),
          slippageBps: 0,
          sources: [FundingSource.dex({ tokenIn: Addresses.pathUsd })],
          token: Addresses.alphaUsd,
        },
      ],
    })
    await expect(
      call(client, {
        account,
        calls: [{ to: recipient }],
        feePayer: accounts[1],
        feeToken: Addresses.pathUsd,
        requireFunds: [
          {
            amount: parseUnits('80', 6),
            slippageBps: 0,
            sources: [
              FundingSource.dex({
                maxAmountIn: parseUnits('30', 6),
                tokenIn: Addresses.alphaUsd,
              }),
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
            ],
            token: Addresses.pathUsd,
          },
          {
            amount: parseUnits('520', 6),
            slippageBps: 0,
            sources: [FundingSource.dex({ tokenIn: Addresses.pathUsd })],
            token: Addresses.alphaUsd,
          },
        ],
      }),
    ).rejects.toThrow('InsufficientFunding')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
  })
})

describe('behavior: access key', () => {
  test('preserves separate caps for repeated sources', async () => {
    const { account, accessKey } = await setupAccessKey()
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: {
        admins: [account.address],
        rules: {
          maxSlippageBps: 100,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
            ],
          },
        },
      },
      limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
    })
    assert(typeof keyAuthorization.fundingPolicy === 'object')
    const { rules } = keyAuthorization.fundingPolicy

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: parseUnits('25', 6),
      feePayer: accounts[1],
      keyAuthorization,
      requireFunds: [
        {
          rules,
          sources: [
            FundingSource.dex({
              maxAmountIn: parseUnits('10', 6),
              tokenIn: Addresses.alphaUsd,
            }),
            FundingSource.dex({
              maxAmountIn: parseUnits('15', 6),
              tokenIn: Addresses.alphaUsd,
            }),
          ],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('475', 6))
    const transaction = await getTransaction(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.requireFunds?.[0]?.sources).toEqual([
      FundingSource.dex({
        maxAmountIn: parseUnits('10', 6),
        tokenIn: Addresses.alphaUsd,
      }),
      FundingSource.dex({
        maxAmountIn: parseUnits('15', 6),
        tokenIn: Addresses.alphaUsd,
      }),
    ])
  })

  test('rejects sources supplied in reverse policy order', async () => {
    const { account, accessKey } = await setupAccessKey()
    const ordered = {
      maxSlippageBps: 100,
      sources: {
        [Addresses.pathUsd]: [
          FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
          FundingSource.dex({ tokenIn: Addresses.betaUsd }),
        ],
      },
    }
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: { admins: [account.address], rules: ordered },
    })
    await expect(
      Actions.token
        .transferSync(client, {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: [
            {
              rules: ordered,
              sources: [
                FundingSource.dex({ tokenIn: Addresses.betaUsd }),
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          ],
          to: recipient,
          token: Addresses.pathUsd,
        })
        .catch((error) => {
          throw (
            error.walk?.(
              (cause: Error) => cause instanceof ContractFunctionRevertedError,
            ) ?? new Error(error.shortMessage ?? error.message)
          )
        }),
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  test('retains inline policy and key installation after payment reverts', async () => {
    const { account, accessKey } = await setupAccessKey()
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: {
        admins: [account.address],
        rules: {
          maxSlippageBps: 100,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
            ],
          },
        },
      },
      limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
    })
    assert(typeof keyAuthorization.fundingPolicy === 'object')
    const { rules } = keyAuthorization.fundingPolicy

    const receipt = await sendTransactionSync(client, {
      account: accessKey,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('26', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      // Bypass estimation to submit the intentional revert and inspect persisted key state.
      gas: 20_000_000n,
      keyAuthorization,
      requireFunds: [
        {
          amount: parseUnits('25', 6),
          rules,
          sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
          token: Addresses.pathUsd,
        },
      ],
    })
    expect(receipt.status).toBe('reverted')
    const policyId = await Actions.accessKey.getFundingPolicyId(client, {
      accessKey,
      account,
    })
    expect(policyId).toBeGreaterThan(0n)
    expect(
      (await Actions.funding.getPolicy(client, { policyId })).rulesHash,
    ).toBe(FundingPolicy.hash(rules))
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('500', 6))
    expect(
      (
        await Actions.accessKey.getRemainingLimit(client, {
          accessKey,
          account,
          token: Addresses.pathUsd,
        })
      ).remaining,
    ).toBe(parseUnits('50', 6))
  })

  test.each([
    'missing',
    'tampered',
    'input',
    'output',
    'slippage',
    'limit',
    'revoked',
    'expired',
  ] as const)('rejects invalid delegated funding: %s', async (failure) => {
    const { account, accessKey } = await setupAccessKey()
    const { policyId, rules } = await Actions.funding.createPolicySync(client, {
      account,
      admins: [account.address],
      feePayer: accounts[1],
      rules: {
        maxSlippageBps: 100,
        sources: {
          [Addresses.pathUsd]: [
            FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
          ],
        },
      },
    })
    const authorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      ...(failure === 'expired' ? { expiry: 1 } : {}),
      fundingPolicy: policyId,
      limits: [
        {
          limit: failure === 'limit' ? 0n : parseUnits('50', 6),
          token: Addresses.pathUsd,
        },
      ],
    })
    if (failure !== 'expired')
      await sendTransactionSync(client, {
        account,
        feePayer: accounts[1],
        keyAuthorization: authorization,
      })
    if (failure === 'revoked')
      await Actions.accessKey.revokeSync(client, {
        accessKey,
        account,
        feePayer: accounts[1],
      })
    const before = await Actions.token.getBalance(client, {
      account: account.address,
      token: Addresses.alphaUsd,
    })
    await expect(
      Actions.token
        .transferSync(client, {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          ...(failure === 'expired' ? { keyAuthorization: authorization } : {}),
          requireFunds: [
            {
              ...(failure === 'missing'
                ? {}
                : {
                    rules:
                      failure === 'tampered'
                        ? { ...rules, maxSlippageBps: 200 }
                        : rules,
                  }),
              ...(failure === 'slippage' ? { slippageBps: 101 } : {}),
              sources: [
                FundingSource.dex({
                  tokenIn:
                    failure === 'input'
                      ? Addresses.betaUsd
                      : Addresses.alphaUsd,
                }),
              ],
            },
          ],
          throwOnReceiptRevert: true,
          to: recipient,
          token: failure === 'output' ? Addresses.betaUsd : Addresses.pathUsd,
        })
        .catch((error) => {
          throw (
            error.walk?.(
              (cause: Error) => cause instanceof ContractFunctionRevertedError,
            ) ?? new Error(error.shortMessage ?? error.message)
          )
        }),
    ).rejects.toThrowErrorMatchingSnapshot()
    expect(
      await Actions.token.getBalance(client, {
        account: account.address,
        token: Addresses.alphaUsd,
      }),
    ).toEqual(before)
  })

  test('requires current rules after updates, including when the balance is already sufficient', async () => {
    const { account, accessKey } = await setupAccessKey()
    const { policyId, rules } = await Actions.funding.createPolicySync(client, {
      account,
      admins: [account.address],
      feePayer: accounts[1],
      rules: {
        maxSlippageBps: 100,
        sources: {
          [Addresses.pathUsd]: [
            FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
          ],
        },
      },
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: policyId,
    })
    await Actions.token.mintSync(client, {
      account: accounts[0],
      amount: parseUnits('50', 6),
      to: account.address,
      token: Addresses.pathUsd,
    })
    await Actions.funding.setPolicyAdminsSync(client, {
      account,
      admins: [account.address, accounts[0].address],
      feePayer: accounts[1],
      keyAuthorization,
      policyId,
    })
    expect(
      (await Actions.funding.getPolicy(client, { policyId })).rulesHash,
    ).toBe(FundingPolicy.hash(rules))
    const { rules: updated } = await Actions.funding.setPolicyRulesSync(
      client,
      {
        account,
        feePayer: accounts[1],
        policyId,
        rules: { ...rules, maxSlippageBps: 50 },
      },
    )
    await expect(
      Actions.token
        .transferSync(client, {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: [
            {
              rules,
              sources: [],
            },
          ],
          to: recipient,
          token: Addresses.pathUsd,
        })
        .catch((error) => {
          throw (
            error.walk?.(
              (cause: Error) => cause instanceof ContractFunctionRevertedError,
            ) ?? new Error(error.shortMessage ?? error.message)
          )
        }),
    ).rejects.toThrowErrorMatchingSnapshot()
    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: parseUnits('25', 6),
      feePayer: accounts[1],
      requireFunds: [{ rules: updated, sources: [] }],
      to: recipient,
      token: Addresses.pathUsd,
    })
    expect(receipt.status).toBe('success')
  })

  test('rolls back funding and spending charges when payment reverts', async () => {
    const { account, accessKey } = await setupAccessKey()
    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: {
        admins: [account.address],
        rules: {
          maxSlippageBps: 100,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
            ],
          },
        },
      },
      limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
    })
    await sendTransactionSync(client, {
      account,
      feePayer: accounts[1],
      keyAuthorization,
    })
    assert(typeof keyAuthorization.fundingPolicy === 'object')
    const { rules } = keyAuthorization.fundingPolicy

    const before = await Actions.token.getBalance(client, {
      account: account.address,
      token: Addresses.alphaUsd,
    })
    const receipt = await sendTransactionSync(client, {
      account: accessKey,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('26', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      // Bypass estimation to verify rollback from a mined, reverted transaction.
      gas: 2_000_000n,
      requireFunds: [
        {
          amount: parseUnits('25', 6),
          rules,
          sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
          token: Addresses.pathUsd,
        },
      ],
    })
    expect(receipt.status).toBe('reverted')
    expect(
      await Actions.token.getBalance(client, {
        account: account.address,
        token: Addresses.alphaUsd,
      }),
    ).toEqual(before)
    expect(
      (
        await Actions.accessKey.getRemainingLimit(client, {
          accessKey,
          account,
          token: Addresses.pathUsd,
        })
      ).remaining,
    ).toBe(parseUnits('50', 6))
  })
})

describe('funding source: earn', () => {
  let stack: Awaited<ReturnType<typeof deployEarnStack>>

  beforeAll(async () => {
    const client = getClient({ account: accounts[0] })

    stack = await deployEarnStack(client, { asset: Addresses.pathUsd })
  })

  test('default', async () => {
    // Start with 100 shares and no liquid PathUSD or standing source allowance.
    const account = await setupEarnAccount(stack.adapter)

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: parseUnits('50', 6),
      feePayer: accounts[1],
      requireFunds: [
        {
          sources: [
            FundingSource.earn({
              source: stack.fundingSource,
              vault: stack.adapter,
            }),
          ],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })

    expect(receipt.status).toBe('success')

    // Redeeming 50 shares leaves 50 of the original 100 shares.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(parseUnits('50', 6))

    // The payment consumes all 50 PathUSD supplied by the vault.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.pathUsd,
        })
      ).amount,
    ).toBe(0n)

    // Temporary funding permission leaves no standing share allowance.
    expect(
      (
        await Actions.token.getAllowance(client, {
          account: account.address,
          spender: stack.fundingSource,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(0n)
  })

  test('capped inputs', async () => {
    // Earn supplies 50 PathUSD; the DEX supplies the remaining 25 from AlphaUSD.
    const account = await setupEarnAccount(stack.adapter)

    await mintInputs(account.address, [Addresses.alphaUsd])

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: parseUnits('75', 6),
      feePayer: accounts[1],
      requireFunds: [
        {
          sources: [
            FundingSource.earn({
              maxValueIn: parseUnits('50', 6),
              source: stack.fundingSource,
              vault: stack.adapter,
            }),
            FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
          ],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })

    expect(receipt.status).toBe('success')

    // The value cap stops redemption at 50 shares while the vault rate is 1:1.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(parseUnits('50', 6))

    // The remaining 25 PathUSD costs 25 of the initial 500 AlphaUSD.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        })
      ).amount,
    ).toBe(parseUnits('475', 6))

    // The payment consumes the combined output of both sources.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.pathUsd,
        })
      ).amount,
    ).toBe(0n)
  })

  test('discovers policy-approved Earn funds and spends with keyAuthorization', async () => {
    const account = await setupEarnAccount(stack.adapter)
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    // Allow this vault to supply at most 50 PathUSD of share value per invocation.
    const { policyId, rules } = await Actions.funding.createPolicySync(client, {
      account,
      admins: [account.address],
      feePayer: accounts[1],
      rules: {
        maxSlippageBps: 100,
        sources: {
          [Addresses.pathUsd]: [
            FundingSource.earn({
              maxValueIn: parseUnits('50', 6),
              source: stack.fundingSource,
              vault: stack.adapter,
            }),
          ],
        },
      },
    })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: policyId,
      limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
    })

    // Discover approved funds, then pass the result directly into the payment.
    const discovery = await Actions.funding.discover(client, {
      account: account.address,
      amount: parseUnits('50', 6),
      policyId,
      rules,
      token: Addresses.pathUsd,
    })

    expect(discovery.sources).toHaveLength(1)
    expect(discovery.sources[0]?.to.toLowerCase()).toBe(
      stack.fundingSource.toLowerCase(),
    )

    const { receipt } = await Actions.token.transferSync(client, {
      account: accessKey,
      amount: parseUnits('50', 6),
      feePayer: accounts[1],
      keyAuthorization,
      requireFunds: [discovery],
      to: recipient,
      token: Addresses.pathUsd,
    })

    expect(receipt.status).toBe('success')

    // The authorized payment redeems 50 shares from the owner.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(parseUnits('50', 6))

    // Funding and payment consume the 50 PathUSD limit once, exhausting it.
    expect(
      (
        await Actions.accessKey.getRemainingLimit(client, {
          accessKey,
          account,
          token: Addresses.pathUsd,
        })
      ).remaining,
    ).toBe(0n)
  })

  test('rejects execution caps above the access key policy', async () => {
    const account = await setupEarnAccount(stack.adapter)
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: account,
    })

    const keyAuthorization = await Actions.accessKey.signAuthorization(client, {
      accessKey,
      account,
      fundingPolicy: {
        admins: [account.address],
        rules: {
          maxSlippageBps: 100,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.earn({
                maxAmountIn: parseUnits('50', 6),
                maxValueIn: parseUnits('50', 6),
                source: stack.fundingSource,
                vault: stack.adapter,
              }),
            ],
          },
        },
      },
      limits: [{ limit: parseUnits('50', 6), token: Addresses.pathUsd }],
    })

    assert(typeof keyAuthorization.fundingPolicy === 'object')
    const { rules } = keyAuthorization.fundingPolicy

    // Neither execution cap may exceed the corresponding signed policy cap.
    for (const cap of ['maxAmountIn', 'maxValueIn'] as const) {
      await expect(
        Actions.token
          .transferSync(client, {
            account: accessKey,
            amount: parseUnits('25', 6),
            feePayer: accounts[1],
            keyAuthorization,
            requireFunds: [
              {
                rules,
                sources: [
                  FundingSource.earn({
                    maxAmountIn: parseUnits('50', 6),
                    maxValueIn: parseUnits('50', 6),
                    source: stack.fundingSource,
                    vault: stack.adapter,
                    [cap]: parseUnits('51', 6),
                  }),
                ],
              },
            ],
            to: recipient,
            token: Addresses.pathUsd,
          })
          .catch((error) => {
            const cause = error.walk?.(
              (cause: Error) => cause instanceof ContractFunctionRevertedError,
            )
            if (
              !(cause instanceof ContractFunctionRevertedError) ||
              !cause.data
            )
              throw error
            throw new Error(cause.data.errorName)
          }),
      ).rejects.toThrowErrorMatchingSnapshot()
    }

    // Both rejected requests leave all 100 shares untouched.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(parseUnits('100', 6))
  })

  test('rolls redemption back when the payment reverts', async () => {
    const account = await setupEarnAccount(stack.adapter)

    // Redeem 50, then attempt to spend 51 so the payment reverts.
    const receipt = await sendTransactionSync(client, {
      account,
      calls: [
        Actions.token.transfer.call({
          amount: parseUnits('51', 6),
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ],
      feePayer: accounts[1],
      // Bypass estimation to verify a mined revert restores the shares.
      gas: 3_000_000n,
      requireFunds: [
        {
          amount: parseUnits('50', 6),
          sources: [
            FundingSource.earn({
              source: stack.fundingSource,
              vault: stack.adapter,
            }),
          ],
          token: Addresses.pathUsd,
        },
      ],
    })

    expect(receipt.status).toBe('reverted')

    // The payment revert restores all 100 shares, including those redeemed during funding.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(parseUnits('100', 6))

    // Rollback also removes the PathUSD produced by redemption.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.pathUsd,
        })
      ).amount,
    ).toBe(0n)
  })

  test('values the input cap in underlying tokens after vault yield', async () => {
    const account = await setupEarnAccount(stack.adapter)

    // Double the vault backing without minting shares to increase their underlying value.
    const supply = await readContract(client, {
      abi: Abis.tip20,
      address: stack.shareToken,
      functionName: 'totalSupply',
    })

    await stack.donate(supply)

    await mintInputs(account.address, [Addresses.alphaUsd])

    const { receipt } = await Actions.token.transferSync(client, {
      account,
      amount: parseUnits('50', 6),
      feePayer: accounts[1],
      requireFunds: [
        {
          slippageBps: 100,
          sources: [
            FundingSource.earn({
              maxValueIn: parseUnits('50', 6),
              source: stack.fundingSource,
              vault: stack.adapter,
            }),
            // Cover any base-unit shortfall from share conversion rounding.
            FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
          ],
        },
      ],
      to: recipient,
      token: Addresses.pathUsd,
    })

    expect(receipt.status).toBe('success')

    // At two PathUSD per share, the 50 PathUSD value cap consumes 25 shares and leaves 75.
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: stack.shareToken,
        })
      ).amount,
    ).toBe(parseUnits('75', 6))
  })
})

async function mintInputs(to: `0x${string}`, tokens: readonly `0x${string}`[]) {
  for (const token of tokens)
    await Actions.token.mintSync(client, {
      account: accounts[0],
      amount: parseUnits('500', 6),
      feePayer: accounts[1],
      feeToken: Addresses.pathUsd,
      to,
      token,
    })
}

async function setupAccessKey(
  type: 'secp256k1' | 'p256' | 'webAuthn' = 'secp256k1',
) {
  const account = Account.fromSecp256k1(generatePrivateKey())
  const accessKey =
    type === 'webAuthn'
      ? Account.fromHeadlessWebAuthn(generatePrivateKey(), {
          access: account,
          origin: 'http://localhost',
          rpId: 'localhost',
        })
      : (type === 'p256' ? Account.fromP256 : Account.fromSecp256k1)(
          generatePrivateKey(),
          { access: account },
        )
  await mintInputs(account.address, [Addresses.alphaUsd, Addresses.betaUsd])
  return { accessKey, account }
}

async function setupEarnAccount(vault: `0x${string}`) {
  const account = Account.fromSecp256k1(generatePrivateKey())
  await Actions.token.mintSync(client, {
    account: accounts[0],
    amount: parseUnits('100', 6),
    to: account.address,
    token: Addresses.pathUsd,
  })
  await Actions.earn.depositSync(client, {
    account,
    assetAmount: parseUnits('100', 6),
    feePayer: accounts[1],
    shareAmountMin: 1n,
    vault,
  })
  return account
}
