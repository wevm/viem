import { TransactionRequest } from 'ox/tempo'
import { encodeFunctionData, getAddress, parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { deployContract, waitForTransactionReceipt } from 'viem/actions'
import { Abis, Account, Actions, Addresses } from 'viem/tempo'
import { beforeAll, describe, expect, test } from 'vitest'
import { FundingInference } from '~contracts/generated.js'
import { accounts, getClient } from '~test/tempo/config.js'
import { infer } from './funding.js'

describe('infer', () => {
  const client = getClient()
  const account = Account.fromSecp256k1(generatePrivateKey())
  let contract: `0x${string}`
  beforeAll(async () => {
    const hash = await deployContract(client, {
      account: accounts[0],
      ...FundingInference,
      bytecode: FundingInference.bytecode.object,
    })
    contract = (await waitForTransactionReceipt(client, { hash }))
      .contractAddress!
    await Actions.token.mintSync(client, {
      account: accounts[0],
      to: account.address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
    })
    await Actions.token.approveSync(client, {
      account,
      token: Addresses.alphaUsd,
      spender: contract,
      amount: 2n ** 128n - 1n,
    })
    await Actions.token.mintSync(client, {
      account: accounts[0],
      to: contract,
      token: Addresses.alphaUsd,
      amount: 1000n,
    })
  })

  const recipient = '0x9999999999999999999999999999999999999999'

  const transfer = (token: `0x${string}`, amount: bigint, to = recipient) => ({
    to: token,
    data: encodeFunctionData({
      abi: Abis.tip20,
      functionName: 'transfer',
      args: [to as `0x${string}`, amount],
    }),
  })

  const balanceOf = {
    to: Addresses.alphaUsd,
    data: encodeFunctionData({
      abi: Abis.tip20,
      functionName: 'balanceOf',
      args: [account.address],
    }),
  } as const

  test('infers transfer batches from calldata', async () => {
    const result = await infer(client, {
      tokens: [Addresses.pathUsd, Addresses.alphaUsd],
      transaction: TransactionRequest.toRpc({
        from: account.address,
        calls: [
          transfer(Addresses.pathUsd, 100n),
          transfer(Addresses.alphaUsd, 200n),
        ],
      }),
    })
    expect(result).toMatchInlineSnapshot(`
    [
      {
        "amount": "0x64",
        "token": "0x20C0000000000000000000000000000000000000",
      },
      {
        "amount": "0xc8",
        "token": "0x20C0000000000000000000000000000000000001",
      },
    ]
  `)
  })

  test('retains overrides while discovering multiple missing tokens', async () => {
    const result = await infer(client, {
      tokens: [],
      transaction: TransactionRequest.toRpc({
        from: account.address,
        calls: [
          transfer(Addresses.alphaUsd, 100n),
          transfer(Addresses.betaUsd, 200n),
          transfer(Addresses.alphaUsd, 300n),
          balanceOf,
        ],
      }),
    })
    expect(result).toEqual([
      { token: '0x20C0000000000000000000000000000000000001', amount: '0x190' },
      { token: '0x20C0000000000000000000000000000000000002', amount: '0xc8' },
    ])
  })

  test('counts temporary self-transfer balance requirements', async () => {
    const result = await infer(client, {
      tokens: [Addresses.alphaUsd],
      transaction: TransactionRequest.toRpc({
        from: account.address,
        calls: [
          transfer(Addresses.alphaUsd, 100n, account.address),
          transfer(Addresses.alphaUsd, 20n),
        ],
      }),
    })
    expect(result).toEqual([
      { token: '0x20C0000000000000000000000000000000000001', amount: '0x64' },
    ])
  })

  test('does not fund a different transferFrom owner', async () => {
    const owner = Account.fromSecp256k1(generatePrivateKey())
    await Actions.token.mintSync(client, {
      account: accounts[0],
      to: owner.address,
      token: Addresses.pathUsd,
      amount: parseUnits('1', 6),
    })
    await Actions.token.approveSync(client, {
      account: owner,
      token: Addresses.alphaUsd,
      spender: account.address,
      amount: 100n,
    })
    await expect(
      infer(client, {
        tokens: [],
        transaction: TransactionRequest.toRpc({
          from: account.address,
          calls: [
            {
              to: Addresses.alphaUsd,
              data: encodeFunctionData({
                abi: Abis.tip20,
                functionName: 'transferFrom',
                args: [owner.address, recipient, 100n],
              }),
            },
          ],
        }),
      }),
    ).rejects.toThrow('Funding inference failed')
  })

  test('tracks the peak debit through an arbitrary contract', async () => {
    const result = await infer(client, {
      tokens: [Addresses.alphaUsd],
      transaction: TransactionRequest.toRpc({
        from: account.address,
        calls: [
          {
            to: contract,
            data: encodeFunctionData({
              ...FundingInference,
              functionName: 'roundTrip',
              args: [Addresses.alphaUsd],
            }),
          },
        ],
      }),
    })
    expect(result).toEqual([
      { token: '0x20C0000000000000000000000000000000000001', amount: '0x64' },
    ])
  })

  test('incoming tokens cover a later payment', async () => {
    expect(
      await infer(client, {
        tokens: [Addresses.alphaUsd],
        transaction: TransactionRequest.toRpc({
          from: account.address,
          calls: [
            {
              to: contract,
              data: encodeFunctionData({
                ...FundingInference,
                functionName: 'receiveFirst',
                args: [Addresses.alphaUsd],
              }),
            },
          ],
        }),
      }),
    ).toEqual([])
  })

  test.each([
    { functionName: 'sweep', amount: '0x1000000000000000000000000' },
    { functionName: 'checkBalance', amount: undefined },
    { functionName: 'remainingBalance', amount: '0x64' },
  ] as const)(
    'returns simulated transfers for $functionName without balance validation',
    async ({ functionName, amount }) => {
      expect(
        await infer(client, {
          tokens: [Addresses.alphaUsd],
          transaction: TransactionRequest.toRpc({
            from: account.address,
            calls: [
              {
                to: contract,
                data: encodeFunctionData({
                  ...FundingInference,
                  functionName,
                  args: [Addresses.alphaUsd],
                }),
              },
            ],
          }),
        }),
      ).toEqual(
        amount === undefined
          ? []
          : [
              {
                token: '0x20C0000000000000000000000000000000000001',
                amount,
              },
            ],
      )
    },
  )

  test('bounds retries when successive calls need more of an unknown token', async () => {
    await expect(
      infer(client, {
        tokens: [],
        transaction: TransactionRequest.toRpc({
          from: account.address,
          calls: [
            ...Array.from({ length: 17 }, (_, i) =>
              transfer(Addresses.betaUsd, BigInt(i + 1)),
            ),
            balanceOf,
          ],
        }),
      }),
    ).rejects.toThrow('exceeded 16 simulations')
  })

  test('retries identical shortfalls at different points in the batch', async () => {
    expect(
      await infer(client, {
        tokens: [],
        transaction: TransactionRequest.toRpc({
          from: account.address,
          calls: [
            transfer(Addresses.betaUsd, 100n),
            transfer(Addresses.betaUsd, 100n),
            balanceOf,
          ],
        }),
      }),
    ).toEqual([
      { token: '0x20C0000000000000000000000000000000000002', amount: '0xc8' },
    ])
  })

  test.each(['caughtTransfer', 'caughtRevert'] as const)(
    'counts only surviving transfers through %s',
    async (functionName) => {
      expect(
        await infer(client, {
          tokens: [Addresses.alphaUsd],
          transaction: TransactionRequest.toRpc({
            from: account.address,
            calls: [
              {
                to: contract,
                data: encodeFunctionData({
                  ...FundingInference,
                  functionName,
                  args: [Addresses.alphaUsd],
                }),
              },
            ],
          }),
        }),
      ).toEqual([
        { token: '0x20C0000000000000000000000000000000000001', amount: '0x14' },
      ])
    },
  )

  test.each(['allowance', 'revert'] as const)(
    'stops on an unrelated %s after resolving a shortfall',
    async (failure) => {
      const call =
        failure === 'allowance'
          ? ({
              to: Addresses.alphaUsd,
              data: encodeFunctionData({
                abi: Abis.tip20,
                functionName: 'transferFrom',
                args: [account.address, recipient, 100n],
              }),
            } as const)
          : {
              to: contract,
              data: encodeFunctionData({
                ...FundingInference,
                functionName: 'revertAfterTransfer',
                args: [Addresses.alphaUsd, account.address],
              }),
            }
      await expect(
        infer(client, {
          tokens: [],
          transaction: TransactionRequest.toRpc({
            from: account.address,
            calls: [transfer(Addresses.betaUsd, 100n), call],
          }),
        }),
      ).rejects.toThrow('Funding inference failed')
    },
  )

  test('includes the existing balance when retrying an unseeded token', async () => {
    const sender = Account.fromSecp256k1(generatePrivateKey())
    const { token } = await Actions.token.createSync(client, {
      account: accounts[0],
      admin: accounts[0],
      currency: 'USD',
      name: 'Inference Token',
      symbol: 'INFER',
    })
    await Actions.token.grantRolesSync(client, {
      account: accounts[0],
      token,
      roles: ['issuer'],
      to: accounts[0].address,
    })
    await Actions.token.mintSync(client, {
      account: accounts[0],
      token,
      to: sender.address,
      amount: 40n,
    })
    expect(
      await infer(client, {
        tokens: [],
        transaction: TransactionRequest.toRpc({
          from: sender.address,
          calls: [transfer(token, 100n), balanceOf],
        }),
      }),
    ).toEqual([{ token: getAddress(token), amount: '0x64' }])
  })

  test('preserves an approval before transferFrom in the same batch', async () => {
    const sender = Account.fromSecp256k1(generatePrivateKey())
    const approval = Actions.token.approve.call({
      token: Addresses.alphaUsd,
      spender: contract,
      amount: 120n,
    })
    const payment = {
      to: contract,
      data: encodeFunctionData({
        ...FundingInference,
        functionName: 'roundTrip',
        args: [Addresses.alphaUsd],
      }),
    }
    expect(
      await infer(client, {
        tokens: [Addresses.alphaUsd],
        transaction: TransactionRequest.toRpc({
          from: sender.address,
          calls: [approval, payment],
        }),
      }),
    ).toEqual([
      { token: '0x20C0000000000000000000000000000000000001', amount: '0x64' },
    ])
    await expect(
      infer(client, {
        tokens: [Addresses.alphaUsd],
        transaction: TransactionRequest.toRpc({
          from: sender.address,
          calls: [payment, approval],
        }),
      }),
    ).rejects.toThrow('Funding inference failed')
  })

  test.each([undefined, '0x1234'] as const)(
    'infers a burn with memo %s',
    async (memo) => {
      expect(
        await infer(client, {
          tokens: [Addresses.alphaUsd],
          transaction: TransactionRequest.toRpc({
            from: accounts[0].address,
            calls: [
              Actions.token.burn.call({
                token: Addresses.alphaUsd,
                amount: 100n,
                memo,
              }),
            ],
          }),
        }),
      ).toEqual([
        { token: '0x20C0000000000000000000000000000000000001', amount: '0x64' },
      ])
    },
  )

  test('subtracts mints before memo transfers without counting memo logs twice', async () => {
    expect(
      await infer(client, {
        tokens: [Addresses.alphaUsd],
        transaction: TransactionRequest.toRpc({
          from: accounts[0].address,
          calls: [
            Actions.token.mint.call({
              token: Addresses.alphaUsd,
              to: accounts[0].address,
              amount: 40n,
              memo: '0x1234',
            }),
            Actions.token.transfer.call({
              token: Addresses.alphaUsd,
              to: recipient,
              amount: 100n,
              memo: '0xabcd',
            }),
          ],
        }),
      }),
    ).toEqual([
      { token: '0x20C0000000000000000000000000000000000001', amount: '0x3c' },
    ])
  })
})
