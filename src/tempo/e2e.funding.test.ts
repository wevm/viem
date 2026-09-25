import { TxEnvelopeTempo } from 'ox/tempo'
import { assert, beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient, http } from '~test/tempo/config.js'
import { deployEarnStack } from '~test/tempo/earn.js'
import { generatePrivateKey } from '../accounts/generatePrivateKey.js'
import {
  call,
  estimateGas,
  fillTransaction,
  getTransaction,
  prepareTransactionRequest,
  readContract,
  sendTransactionSync,
  signTransaction,
} from '../actions/index.js'
import { ContractFunctionRevertedError } from '../errors/contract.js'
import { custom, parseEventLogs, parseUnits } from '../index.js'
import {
  Abis,
  Account,
  Actions,
  Addresses,
  Funding,
  FundingPolicy,
  FundingSource,
  Store,
  Tick,
  withFunding,
  withRelay,
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
          policyRules: rules,
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
                policyRules: rules,
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
          policyRules: rules,
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
          policyRules: rules,
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
          policyRules: rules,
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
              policyRules: ordered,
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
          policyRules: rules,
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
                    policyRules:
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
              policyRules: rules,
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
      requireFunds: [{ policyRules: updated, sources: [] }],
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
          policyRules: rules,
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
      policyRules: rules,
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
                policyRules: rules,
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

describe('withFunding', () => {
  const client = getClient({
    transport: withFunding(http(), { store: Store.memory() }),
  })

  beforeAll(async () => {
    await Actions.token.transferSync(client, {
      account: accounts[0],
      amount: parseUnits('100', 6),
      to: accounts[1].address,
      token: Addresses.pathUsd,
    })

    // Initialize every standard input pair inspected by the default route.
    for (const token of [
      Addresses.alphaUsd,
      Addresses.betaUsd,
      Addresses.thetaUsd,
    ] as const)
      await Actions.dex.placeSync(client, {
        account: accounts[0],
        amount: parseUnits('1000', 6),
        tick: 0,
        token,
        type: 'buy',
      })
  })

  test('default', async () => {
    const account = await setupAccount()
    const result = await Actions.token.transferSync(client, {
      account,
      amount: parseUnits('50', 6),
      feePayer: accounts[1],
      requireFunds: [{ slippageBps: 0 }],
      to: recipient,
      token: Addresses.pathUsd,
    })
    expect(
      parseEventLogs({
        abi: Abis.tip20Funder,
        logs: result.receipt.logs,
      }).map(({ address, args, eventName }) => ({ address, args, eventName })),
    ).toMatchInlineSnapshot(
      [
        {
          args: {
            account: expect.any(String),
            requestHash: expect.any(String),
          },
        },
        { args: { account: expect.any(String) } },
      ],
      `
      [
        {
          "address": "0x1120000000000000000000000000000000000000",
          "args": {
            "account": Any<String>,
            "amountIn": 50000000n,
            "amountOut": 50000000n,
            "assetIn": "0x20C0000000000000000000000000000000000001",
            "assetOut": "0x20C0000000000000000000000000000000000000",
            "requestHash": Any<String>,
            "source": "0x1120000000000000000000000000000000000001",
          },
          "eventName": "SourceFunded",
        },
        {
          "address": "0x1120000000000000000000000000000000000000",
          "args": {
            "account": Any<String>,
            "asset": "0x20C0000000000000000000000000000000000000",
            "fundedAmount": 50000000n,
            "key": "0x0000000000000000000000000000000000000000",
            "requiredAmount": 50000000n,
          },
          "eventName": "FundsRequired",
        },
      ]
    `,
    )

    expect(result).toMatchInlineSnapshot(
      {
        from: expect.any(String),
        receipt: {
          blockHash: expect.any(String),
          blockNumber: expect.any(BigInt),
          cumulativeGasUsed: expect.any(BigInt),
          effectiveGasPrice: expect.any(BigInt),
          gasUsed: expect.any(BigInt),
          from: expect.any(String),
          logs: expect.any(Array),
          logsBloom: expect.any(String),
          transactionHash: expect.any(String),
        },
      },
      `
      {
        "amount": 50000000n,
        "decimals": 6,
        "formatted": "50",
        "from": Any<String>,
        "receipt": {
          "blockHash": Any<String>,
          "blockNumber": Any<BigInt>,
          "contractAddress": null,
          "cumulativeGasUsed": Any<BigInt>,
          "effectiveGasPrice": Any<BigInt>,
          "feePayer": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "from": Any<String>,
          "gasUsed": Any<BigInt>,
          "logs": Any<Array>,
          "logsBloom": Any<String>,
          "multisig": undefined,
          "status": "success",
          "to": "0x20c0000000000000000000000000000000000000",
          "transactionHash": Any<String>,
          "transactionIndex": 0,
          "type": "0x76",
        },
        "to": "0x8888888888888888888888888888888888888888",
      }
    `,
    )
    const transaction = await getTransaction(client, {
      hash: result.receipt.transactionHash,
    })
    expect(transaction).toMatchInlineSnapshot(
      {
        blockHash: expect.any(String),
        blockNumber: expect.any(BigInt),
        from: expect.any(String),
        hash: expect.any(String),
        blockTimestamp: expect.any(BigInt),
        feePayerSignature: {
          r: expect.any(String),
          s: expect.any(String),
          v: expect.any(BigInt),
          yParity: expect.any(Number),
        },
        gas: expect.any(BigInt),
        gasPrice: expect.any(BigInt),
        maxFeePerGas: expect.any(BigInt),
        signature: {
          signature: {
            r: expect.any(BigInt),
            s: expect.any(BigInt),
            yParity: expect.any(Number),
          },
        },
        validAfter: expect.any(Number),
        validBefore: expect.any(Number),
      },
      `
      {
        "accessList": [],
        "authorizationList": [],
        "blockHash": Any<String>,
        "blockNumber": Any<BigInt>,
        "blockTimestamp": Any<BigInt>,
        "calls": [
          {
            "data": "0xa9059cbb00000000000000000000000088888888888888888888888888888888888888880000000000000000000000000000000000000000000000000000000002faf080",
            "to": "0x20c0000000000000000000000000000000000000",
            "value": 0n,
          },
        ],
        "chainId": 1337,
        "data": undefined,
        "feePayerSignature": {
          "r": Any<String>,
          "s": Any<String>,
          "v": Any<BigInt>,
          "yParity": Any<Number>,
        },
        "feeToken": null,
        "from": Any<String>,
        "gas": Any<BigInt>,
        "gasPrice": Any<BigInt>,
        "hash": Any<String>,
        "keyAuthorization": null,
        "maxFeePerBlobGas": undefined,
        "maxFeePerGas": Any<BigInt>,
        "maxPriorityFeePerGas": 0n,
        "multisig": undefined,
        "nonce": 0,
        "nonceKey": 115792089237316195423570985008687907853269984665640564039457584007913129639935n,
        "requireFunds": [
          {
            "amount": 50000000n,
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000002faf080",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ],
        "signature": {
          "signature": {
            "r": Any<BigInt>,
            "s": Any<BigInt>,
            "yParity": Any<Number>,
          },
          "type": "secp256k1",
        },
        "to": null,
        "transactionIndex": 0,
        "type": "tempo",
        "typeHex": "0x76",
        "v": undefined,
        "validAfter": Any<Number>,
        "validBefore": Any<Number>,
        "value": 0n,
        "yParity": undefined,
      }
    `,
    )
    // The output was spent by the transfer; 50 AlphaUSD funded it.
    expect(
      await Actions.token.getBalance(client, {
        account: account.address,
        token: Addresses.pathUsd,
      }),
    ).toMatchInlineSnapshot(`
      {
        "amount": 0n,
        "decimals": 6,
        "formatted": "0",
      }
    `)
    expect(
      await Actions.token.getBalance(client, {
        account: account.address,
        token: Addresses.alphaUsd,
      }),
    ).toMatchInlineSnapshot(`
      {
        "amount": 50000000n,
        "decimals": 6,
        "formatted": "50",
      }
    `)
  })

  test('preserves explicit caps and route defaults do not change complete requirements', async () => {
    const account = await setupAccount()
    const requirement = {
      amount: parseUnits('50', 6),
      slippageBps: 0,
      sources: [
        FundingSource.dex({
          maxAmountIn: parseUnits('50', 6),
          tokenIn: Addresses.alphaUsd,
        }),
      ],
      token: Addresses.pathUsd,
    } as const
    const result = await fillTransaction(client, {
      account,
      calls: [{ to: recipient }],
      feePayer: accounts[1],
      requireFunds: [requirement],
    })
    expect(result).toMatchInlineSnapshot(
      {
        raw: expect.any(String),
        transaction: {
          from: expect.any(String),
          gas: expect.any(BigInt),
          hash: expect.any(String),
          maxFeePerGas: expect.any(BigInt),
        },
      },
      `
      {
        "raw": Any<String>,
        "transaction": {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x8888888888888888888888888888888888888888",
              "value": 0n,
            },
          ],
          "chainId": 1337,
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "from": Any<String>,
          "gas": Any<BigInt>,
          "gasPrice": undefined,
          "hash": Any<String>,
          "keyAuthorization": null,
          "maxFeePerBlobGas": undefined,
          "maxFeePerGas": Any<BigInt>,
          "maxPriorityFeePerGas": 0n,
          "multisig": undefined,
          "nonce": 0,
          "nonceKey": 0n,
          "requireFunds": [
            {
              "amount": 50000000n,
              "slippageBps": 0,
              "sources": [
                {
                  "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000002faf080",
                  "to": "0x1120000000000000000000000000000000000001",
                },
              ],
              "token": "0x20c0000000000000000000000000000000000000",
            },
          ],
          "signature": {
            "signature": {
              "r": 59728239767604526217550949535444980007647751110991992555989432467883920033125n,
              "s": 17143831728048845831134990513685258884275296176139135115431336905099564136145n,
              "yParity": 0,
            },
            "type": "secp256k1",
          },
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
        },
      }
    `,
    )
    expect(
      TxEnvelopeTempo.deserialize(result.raw as TxEnvelopeTempo.Serialized),
    ).toMatchInlineSnapshot(
      {
        from: expect.any(String),
        gas: expect.any(BigInt),
        maxFeePerGas: expect.any(BigInt),
      },
      `
      {
        "calls": [
          {
            "to": "0x8888888888888888888888888888888888888888",
          },
        ],
        "chainId": 1337,
        "from": Any<String>,
        "gas": Any<BigInt>,
        "maxFeePerGas": Any<BigInt>,
        "nonce": 0n,
        "nonceKey": 0n,
        "requireFunds": [
          {
            "amount": 50000000n,
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000002faf080",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ],
        "signature": {
          "signature": {
            "r": 59728239767604526217550949535444980007647751110991992555989432467883920033125n,
            "s": 17143831728048845831134990513685258884275296176139135115431336905099564136145n,
            "yParity": 0,
          },
          "type": "secp256k1",
        },
        "type": "tempo",
      }
    `,
    )
  })

  test('fills sources when gas, fees, and nonce are already supplied', async () => {
    const account = await setupAccount()
    const result = await prepareTransactionRequest(client, {
      account,
      calls: [{ to: recipient }],
      feePayer: accounts[1],
      gas: 2_000_000n,
      maxFeePerGas: 20_000_000_000n,
      maxPriorityFeePerGas: 0n,
      nonce: 0,
      requireFunds: [{ amount: parseUnits('50', 6), token: Addresses.pathUsd }],
    })
    expect(result).toMatchInlineSnapshot(
      {
        account: { address: expect.any(String), publicKey: expect.any(String) },
        chain: { rpcUrls: { default: { http: [expect.any(String)] } } },
        from: expect.any(String),
        validAfter: expect.any(Number),
        validBefore: expect.any(Number),
      },
      `
      {
        "account": {
          "address": Any<String>,
          "keyType": "secp256k1",
          "publicKey": Any<String>,
          "sign": [Function],
          "signAuthorization": [Function],
          "signKeyAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "signVoucher": [Function],
          "source": "root",
          "type": "local",
        },
        "calls": [
          {
            "to": "0x8888888888888888888888888888888888888888",
          },
        ],
        "chain": {
          "blockTime": 1000,
          "extend": [Function],
          "extendSchema": {},
          "fees": undefined,
          "formatters": {
            "transaction": {
              "exclude": [
                "aaAuthorizationList",
              ],
              "format": [Function],
              "type": "transaction",
            },
            "transactionReceipt": {
              "exclude": undefined,
              "format": [Function],
              "type": "transactionReceipt",
            },
            "transactionRequest": {
              "exclude": undefined,
              "format": [Function],
              "type": "transactionRequest",
            },
          },
          "hardfork": "t3",
          "id": 1337,
          "name": "Tempo",
          "nativeCurrency": {
            "decimals": 6,
            "name": "USD",
            "symbol": "USD",
          },
          "prepareTransactionRequest": [
            [Function],
            {
              "runAt": [
                "beforeFillTransaction",
                "afterFillParameters",
              ],
            },
          ],
          "rpcUrls": {
            "default": {
              "http": [
                Any<String>,
              ],
            },
          },
          "serializers": {
            "transaction": [Function],
            "transactionEnvelope": [Function],
          },
          "verifyHash": [Function],
        },
        "chainId": 1337,
        "feePayer": {
          "address": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
          "keyType": "secp256k1",
          "publicKey": "0x037f40766fbc839e1b69a19685ce42f967a74a87d597a52ef525810484908b3303da5a99a45c7e297d121be1014502a0829ea9c327fa97caad1355f007bcc7bf",
          "sign": [Function],
          "signAuthorization": [Function],
          "signKeyAuthorization": [Function],
          "signMessage": [Function],
          "signTransaction": [Function],
          "signTypedData": [Function],
          "signVoucher": [Function],
          "source": "root",
          "type": "local",
        },
        "from": Any<String>,
        "gas": 2000000n,
        "maxFeePerGas": 20000000000n,
        "maxPriorityFeePerGas": 0n,
        "nonce": 0,
        "nonceKey": 115792089237316195423570985008687907853269984665640564039457584007913129639935n,
        "requireFunds": [
          {
            "amount": 50000000n,
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000002faf080",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ],
        "type": "tempo",
        "validAfter": Any<Number>,
        "validBefore": Any<Number>,
      }
    `,
    )
  })

  test('resolves async routes by chain and output token', async () => {
    const account = await setupAccount()
    await Actions.token.mintSync(client, {
      account: accounts[0],
      amount: parseUnits('100', 6),
      to: account.address,
      token: Addresses.pathUsd,
    })
    await Actions.dex.placeSync(client, {
      account: accounts[0],
      amount: parseUnits('1000', 6),
      tick: 0,
      token: Addresses.betaUsd,
      type: 'sell',
    })
    const routedClient = getClient({
      transport: withFunding(http(), {
        store: Store.memory(),
        getRoute: async ({ chainId, token }) => {
          if (chainId !== 1337) return undefined
          if (token.toLowerCase() === Addresses.pathUsd.toLowerCase())
            return {
              slippageBps: 100,
              sources: [FundingSource.dex({ tokenIn: Addresses.alphaUsd })],
            }
          if (token.toLowerCase() === Addresses.betaUsd.toLowerCase())
            return {
              slippageBps: 50,
              sources: [FundingSource.dex({ tokenIn: Addresses.pathUsd })],
            }
          return undefined
        },
      }),
    })
    const result = await fillTransaction(routedClient, {
      account,
      calls: [{ to: recipient }],
      feePayer: accounts[1],
      requireFunds: [{ amount: parseUnits('25', 6), token: Addresses.betaUsd }],
    })
    expect(result).toMatchInlineSnapshot(
      {
        raw: expect.any(String),
        transaction: {
          from: expect.any(String),
          gas: expect.any(BigInt),
          hash: expect.any(String),
          maxFeePerGas: expect.any(BigInt),
        },
      },
      `
      {
        "raw": Any<String>,
        "transaction": {
          "accessList": [],
          "authorizationList": [],
          "calls": [
            {
              "data": "0x",
              "to": "0x8888888888888888888888888888888888888888",
              "value": 0n,
            },
          ],
          "chainId": 1337,
          "data": undefined,
          "feePayerSignature": undefined,
          "feeToken": null,
          "from": Any<String>,
          "gas": Any<BigInt>,
          "gasPrice": undefined,
          "hash": Any<String>,
          "keyAuthorization": null,
          "maxFeePerBlobGas": undefined,
          "maxFeePerGas": Any<BigInt>,
          "maxPriorityFeePerGas": 0n,
          "multisig": undefined,
          "nonce": 0,
          "nonceKey": 0n,
          "requireFunds": [
            {
              "amount": 25000000n,
              "slippageBps": 50,
              "sources": [
                {
                  "data": "0x00000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017f6088",
                  "to": "0x1120000000000000000000000000000000000001",
                },
              ],
              "token": "0x20c0000000000000000000000000000000000002",
            },
          ],
          "signature": {
            "signature": {
              "r": 59728239767604526217550949535444980007647751110991992555989432467883920033125n,
              "s": 17143831728048845831134990513685258884275296176139135115431336905099564136145n,
              "yParity": 0,
            },
            "type": "secp256k1",
          },
          "to": null,
          "type": "tempo",
          "typeHex": "0x76",
          "validAfter": null,
          "validBefore": null,
          "value": 0n,
        },
      }
    `,
    )
  })

  test('discovers Earn shares and transfers the redeemed output', async () => {
    const stack = await deployEarnStack(getClient({ account: accounts[0] }), {
      asset: Addresses.pathUsd,
    })
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
      vault: stack.adapter,
    })
    const earnClient = getClient({
      transport: withFunding(http(), {
        store: Store.memory(),
        getRoute: ({ token }) => {
          if (token.toLowerCase() === Addresses.pathUsd.toLowerCase())
            return {
              sources: [
                FundingSource.earn({
                  source: stack.fundingSource,
                  vault: stack.adapter,
                }),
              ],
            }
          return undefined
        },
      }),
    })
    const result = await Actions.token.transferSync(earnClient, {
      account,
      amount: parseUnits('50', 6),
      feePayer: accounts[1],
      requireFunds: true,
      to: recipient,
      token: Addresses.pathUsd,
    })
    expect(
      parseEventLogs({
        abi: Abis.tip20Funder,
        logs: result.receipt.logs,
      }).map(({ address, args, eventName }) => ({ address, args, eventName })),
    ).toMatchInlineSnapshot(
      [
        {
          args: {
            account: expect.any(String),
            requestHash: expect.any(String),
            assetIn: expect.any(String),
            source: expect.any(String),
          },
        },
        { args: { account: expect.any(String) } },
      ],
      `
      [
        {
          "address": "0x1120000000000000000000000000000000000000",
          "args": {
            "account": Any<String>,
            "amountIn": 50000000n,
            "amountOut": 50000000n,
            "assetIn": Any<String>,
            "assetOut": "0x20C0000000000000000000000000000000000000",
            "requestHash": Any<String>,
            "source": Any<String>,
          },
          "eventName": "SourceFunded",
        },
        {
          "address": "0x1120000000000000000000000000000000000000",
          "args": {
            "account": Any<String>,
            "asset": "0x20C0000000000000000000000000000000000000",
            "fundedAmount": 50000000n,
            "key": "0x0000000000000000000000000000000000000000",
            "requiredAmount": 50000000n,
          },
          "eventName": "FundsRequired",
        },
      ]
    `,
    )

    expect(result).toMatchInlineSnapshot(
      {
        from: expect.any(String),
        receipt: {
          blockHash: expect.any(String),
          blockNumber: expect.any(BigInt),
          cumulativeGasUsed: expect.any(BigInt),
          effectiveGasPrice: expect.any(BigInt),
          gasUsed: expect.any(BigInt),
          from: expect.any(String),
          logs: expect.any(Array),
          logsBloom: expect.any(String),
          transactionHash: expect.any(String),
        },
      },
      `
      {
        "amount": 50000000n,
        "decimals": 6,
        "formatted": "50",
        "from": Any<String>,
        "receipt": {
          "blockHash": Any<String>,
          "blockNumber": Any<BigInt>,
          "contractAddress": null,
          "cumulativeGasUsed": Any<BigInt>,
          "effectiveGasPrice": Any<BigInt>,
          "feePayer": "0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650",
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "from": Any<String>,
          "gasUsed": Any<BigInt>,
          "logs": Any<Array>,
          "logsBloom": Any<String>,
          "multisig": undefined,
          "status": "success",
          "to": "0x20c0000000000000000000000000000000000000",
          "transactionHash": Any<String>,
          "transactionIndex": 0,
          "type": "0x76",
        },
        "to": "0x8888888888888888888888888888888888888888",
      }
    `,
    )
    expect(
      await Actions.token.getBalance(client, {
        account: account.address,
        token: stack.shareToken,
      }),
    ).toMatchInlineSnapshot(`
      {
        "amount": 50000000n,
        "decimals": 6,
        "formatted": "50",
      }
    `)
  })

  describe('access keys', () => {
    test('with existing policy', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const client = getClient({
        transport: withFunding(http(), { store }),
      })
      const { policyId, rules, rulesHash } =
        await Actions.funding.createPolicySync(client, {
          account,
          admins: [account.address],
          feePayer: accounts[1],
          rules: {
            maxSlippageBps: 0,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: policyId,
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // Both payments use registered rules; the second reuses the installed key.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('with inline policy', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const client = getClient({
        transport: withFunding(http(), { store }),
      })
      const { rules, rulesHash } = await Actions.funding.createPolicySync(
        client,
        {
          account,
          admins: [account.address],
          feePayer: accounts[1],
          rules: {
            maxSlippageBps: 0,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        },
      )
      await store.removeItem(
        `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
      )
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: { admins: [account.address], rules },
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // Both payments use registered rules; the second reuses the installed key.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('with installed key', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const client = getClient({
        transport: withFunding(http(), { store }),
      })
      const { policyId, rules, rulesHash } =
        await Actions.funding.createPolicySync(client, {
          account,
          admins: [account.address],
          feePayer: accounts[1],
          rules: {
            maxSlippageBps: 0,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: policyId,
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )
      await sendTransactionSync(client, {
        account,
        feePayer: accounts[1],
        keyAuthorization,
      })

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // Both payments use registered rules; the second reuses the installed key.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('with relay', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const node = getClient()
      const handler = Funding.handleRequest(
        (request, options) => node.request(request as never, options),
        { store },
      )
      const client = getClient({
        transport: withRelay(http(), custom({ request: handler })),
      })
      const { policyId, rules, rulesHash } =
        await Actions.funding.createPolicySync(client, {
          account,
          admins: [account.address],
          feePayer: accounts[1],
          rules: {
            maxSlippageBps: 0,
            sources: {
              [Addresses.pathUsd]: [
                FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
              ],
            },
          },
        })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: policyId,
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // Both payments use registered rules; the second reuses the installed key.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('with relay and inline policy', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const node = getClient()
      const handler = Funding.handleRequest(
        (request, options) => node.request(request as never, options),
        { store },
      )
      const client = getClient({
        transport: withRelay(http(), custom({ request: handler })),
      })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: {
            admins: [account.address],
            rules: {
              maxSlippageBps: 0,
              sources: {
                [Addresses.pathUsd]: [
                  FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
                ],
              },
            },
          },
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )

      assert(typeof keyAuthorization.fundingPolicy === 'object')
      const { rules } = keyAuthorization.fundingPolicy
      const rulesHash = FundingPolicy.hash(rules)

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // The first payment installs the key and inline policy using registered rules.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('with default policy', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const { policyId, rules, rulesHash } =
        await Actions.funding.createPolicySync(
          getClient({ transport: withFunding(http(), { store }) }),
          {
            account,
            admins: [account.address],
            feePayer: accounts[1],
            rules: {
              maxSlippageBps: 0,
              sources: {
                [Addresses.pathUsd]: [
                  FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
                ],
              },
            },
          },
        )
      const client = getClient({
        transport: withFunding(http(), { policyId, store }),
      })

      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: true,
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )

      expect(keyAuthorization.fundingPolicy).toBe(policyId)

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // The owner signs the resolved policy ID before the first funded payment.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('with relay and default policy', async () => {
      const { account, accessKey } = await setupAccessKey()
      const store = Store.memory()
      const { policyId, rules, rulesHash } =
        await Actions.funding.createPolicySync(
          getClient({ transport: withFunding(http(), { store }) }),
          {
            account,
            admins: [account.address],
            feePayer: accounts[1],
            rules: {
              maxSlippageBps: 0,
              sources: {
                [Addresses.pathUsd]: [
                  FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
                ],
              },
            },
          },
        )
      const node = getClient()
      const handler = Funding.handleRequest(
        (request, options) => node.request(request as never, options),
        { policyId, store },
      )
      const client = getClient({
        transport: withRelay(http(), custom({ request: handler })),
      })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: true,
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )

      expect(keyAuthorization.fundingPolicy).toBe(policyId)

      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toEqual(FundingPolicy.encode(rules))

      // The owner signs the resolved policy ID before the first funded payment.
      const { receipt: firstReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          keyAuthorization,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(firstReceipt.status).toMatchInlineSnapshot(`"success"`)
      const firstTransaction = await getTransaction(client, {
        hash: firstReceipt.transactionHash,
      })
      expect(firstTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)

      // Reuse the installed key without resubmitting its authorization.
      const { receipt: secondReceipt } = await Actions.token.transferSync(
        client,
        {
          account: accessKey,
          amount: parseUnits('25', 6),
          feePayer: accounts[1],
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        },
      )
      expect(secondReceipt.status).toMatchInlineSnapshot(`"success"`)
      const secondTransaction = await getTransaction(client, {
        hash: secondReceipt.transactionHash,
      })
      expect(secondTransaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "slippageBps": 0,
            "sources": [
              {
                "data": "0x00000000000000000000000020c000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000017d7840",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
      expect(
        await store.getItem(
          `funding:1337:${Addresses.fundingPolicy}:rules:${rulesHash}`,
        ),
      ).toBe(FundingPolicy.encode(rules))
      expect(
        await Actions.accessKey.getRemainingLimit(client, {
          account: account.address,
          accessKey,
          token: Addresses.pathUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "periodEnd": 0n,
          "remaining": 0n,
        }
      `)
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.alphaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 450000000n,
          "decimals": 6,
          "formatted": "450",
        }
      `)
    })

    test('fills omitted rules while preserving explicit sources and caps', async () => {
      const { account, accessKey } = await setupAccessKey()
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: {
            admins: [account.address],
            rules: {
              maxSlippageBps: 0,
              sources: {
                [Addresses.pathUsd]: [
                  FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
                ],
              },
            },
          },
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('25', 6) }],
        },
      )
      const { receipt } = await Actions.token.transferSync(client, {
        account: accessKey,
        amount: parseUnits('25', 6),
        feePayer: accounts[1],
        keyAuthorization,
        requireFunds: [
          {
            sources: [
              FundingSource.dex({
                tokenIn: Addresses.alphaUsd,
                maxAmountIn: parseUnits('10', 6),
              }),
              FundingSource.dex({
                tokenIn: Addresses.alphaUsd,
                maxAmountIn: parseUnits('15', 6),
              }),
            ],
          },
        ],
        to: recipient,
        token: Addresses.pathUsd,
      })
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.requireFunds).toMatchInlineSnapshot(`
        [
          {
            "amount": 25000000n,
            "policyRules": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000020c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000011200000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000020c0000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            "sources": [
              {
                "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000989680",
                "to": "0x1120000000000000000000000000000000000001",
              },
              {
                "data": "0x00000000000000000000000020c00000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000e4e1c0",
                "to": "0x1120000000000000000000000000000000000001",
              },
            ],
            "token": "0x20c0000000000000000000000000000000000000",
          },
        ]
      `)
    })

    test('uses updated policy rules even with a warm cache', async () => {
      const { account, accessKey } = await setupAccessKey()
      const { policyId } = await Actions.funding.createPolicySync(client, {
        account,
        admins: [account.address],
        feePayer: accounts[1],
        rules: {
          maxSlippageBps: 0,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.dex({ tokenIn: Addresses.alphaUsd }),
            ],
          },
        },
      })
      const keyAuthorization = await Actions.accessKey.signAuthorization(
        client,
        {
          account,
          accessKey,
          fundingPolicy: policyId,
          limits: [{ token: Addresses.pathUsd, limit: parseUnits('50', 6) }],
        },
      )
      await Actions.token.transferSync(client, {
        account: accessKey,
        amount: parseUnits('25', 6),
        feePayer: accounts[1],
        keyAuthorization,
        requireFunds: true,
        to: recipient,
        token: Addresses.pathUsd,
      })
      const { rules } = await Actions.funding.setPolicyRulesSync(client, {
        account,
        feePayer: accounts[1],
        policyId,
        rules: {
          maxSlippageBps: 0,
          sources: {
            [Addresses.pathUsd]: [
              FundingSource.dex({ tokenIn: Addresses.betaUsd }),
            ],
          },
        },
      })
      const { receipt } = await Actions.token.transferSync(client, {
        account: accessKey,
        amount: parseUnits('25', 6),
        feePayer: accounts[1],
        requireFunds: true,
        to: recipient,
        token: Addresses.pathUsd,
      })
      const transaction = await getTransaction(client, {
        hash: receipt.transactionHash,
      })
      expect(transaction.requireFunds?.[0]?.policyRules).toBe(
        FundingPolicy.encode(rules),
      )
      expect(
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.betaUsd,
        }),
      ).toMatchInlineSnapshot(`
        {
          "amount": 475000000n,
          "decimals": 6,
          "formatted": "475",
        }
      `)
    })
  })

  describe('behavior', () => {
    test('rejects inferred funding when transferring from another account', async () => {
      await expect(
        Actions.token.transferSync(client, {
          account: accounts[0],
          amount: parseUnits('1', 6),
          from: accounts[1].address,
          requireFunds: true,
          to: recipient,
          token: Addresses.pathUsd,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: When \`from\` is set, specify \`token\` and \`amount\` in each \`requireFunds\` entry; funding targets the transaction sender, not \`from\`.]`,
      )
    })

    test('rejects missing routes without falling back to ordinary preparation', async () => {
      const account = await setupAccount()
      await expect(
        prepareTransactionRequest(client, {
          account,
          calls: [{ to: recipient }],
          feePayer: accounts[1],
          requireFunds: [
            { amount: 1n, token: '0x20c000000000000000000000000000000000ffff' },
          ],
        }).catch((error) => {
          throw new Error(error.details ?? error.shortMessage)
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: No funding route configured for 0x20c000000000000000000000000000000000ffff.]`,
      )
    })

    test('does not discover when sources are explicitly empty', async () => {
      const account = await setupAccount()
      await expect(
        fillTransaction(client, {
          account,
          calls: [{ to: recipient }],
          feePayer: accounts[1],
          requireFunds: [{ amount: 1n, sources: [], token: Addresses.pathUsd }],
        }).catch((error) => {
          throw new Error(error.details ?? error.shortMessage)
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: execution reverted: TIP20 funding error: InsufficientFunding(InsufficientFunding { required: 1, available: 0 })]`,
      )
    })

    test('propagates insufficient input capacity', async () => {
      const account = await setupAccount()
      await expect(
        fillTransaction(client, {
          account,
          calls: [{ to: recipient }],
          feePayer: accounts[1],
          requireFunds: [
            { amount: parseUnits('200', 6), token: Addresses.pathUsd },
          ],
        }).catch((error) => {
          throw new Error(error.details ?? error.shortMessage)
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: execution reverted: TIP20 funding error: InsufficientFunding(InsufficientFunding { required: 200000000, available: 100000000 })]`,
      )
    })
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

async function setupAccount() {
  const account = Account.fromSecp256k1(generatePrivateKey())
  await Actions.token.mintSync(client, {
    account: accounts[0],
    amount: parseUnits('100', 6),
    to: account.address,
    token: Addresses.alphaUsd,
  })
  return account
}
