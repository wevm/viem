import { createClient } from 'viem'
import { fillTransaction } from 'viem/actions'
import { Actions, Relay, withRelay } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const recipient = Tempo.accounts[7]!

const caller = Tempo.getClient({ chain: Tempo.chain })

beforeAll(async () => {
  await Actions.faucet.fundSync(caller, {
    account: userAccount,
    timeout: 60_000,
  })
})

test('returns fees and balance changes without executing the transfer', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), { plugins: [Relay.simulate()] }),
  })
  const before = await Actions.token.getBalance(caller, {
    account: recipient.address,
    token: Tempo.addresses.alphaUsd,
  })
  const { capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feeToken: Tempo.addresses.alphaUsd,
  })
  expect(capabilities?.fee?.symbol).toBe('AlphaUSD')
  expect(Object.values(capabilities?.balanceDiffs ?? {}).flat()).toMatchObject([
    {
      address: Tempo.addresses.alphaUsd,
      direction: 'outgoing',
      value: '0x1',
    },
  ])
  expect(
    await Actions.token.getBalance(caller, {
      account: recipient.address,
      token: Tempo.addresses.alphaUsd,
    }),
  ).toEqual(before)
})

test.each([50n, 200n])(
  'retains approval exposure after a direct transfer of %s',
  async (amount) => {
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), { plugins: [Relay.simulate()] }),
    })
    const { capabilities } = await fillTransaction(client, {
      account: userAccount.address,
      feeToken: Tempo.addresses.alphaUsd,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount,
        }),
        Actions.token.approve.call(caller, {
          token: Tempo.addresses.alphaUsd,
          spender: recipient.address,
          amount: 200n,
        }),
      ],
    })
    expect(
      Object.values(capabilities?.balanceDiffs ?? {}).flat(),
    ).toMatchObject([
      {
        address: Tempo.addresses.alphaUsd,
        direction: 'outgoing',
        value: amount === 50n ? '0xfa' : '0x190',
      },
    ])
  },
)

test.each([
  { amounts: [100n, 200n], value: '0xc8' },
  { amounts: [200n, 100n], value: '0x64' },
  { amounts: [200n, 0n], value: undefined },
  { amounts: [0n, 200n], value: '0xc8' },
])('reports final approval exposure: $amounts', async ({ amounts, value }) => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), { plugins: [Relay.simulate()] }),
  })
  const { capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    feeToken: Tempo.addresses.alphaUsd,
    calls: amounts.map((amount) =>
      Actions.token.approve.call(caller, {
        token: Tempo.addresses.alphaUsd,
        spender: recipient.address,
        amount,
      }),
    ),
  })
  const diffs = Object.values(capabilities?.balanceDiffs ?? {}).flat()
  if (value === undefined) expect(diffs).toEqual([])
  else
    expect(diffs).toMatchObject([
      {
        address: Tempo.addresses.alphaUsd,
        direction: 'outgoing',
        recipients: [recipient.address],
        value,
      },
    ])
})

test('keeps replacement approvals separate across tokens and spenders', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), { plugins: [Relay.simulate()] }),
  })
  const { capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.approve.call(caller, {
        token: Tempo.addresses.alphaUsd,
        spender: recipient.address,
        amount: 100n,
      }),
      Actions.token.approve.call(caller, {
        token: Tempo.addresses.pathUsd,
        spender: recipient.address,
        amount: 400n,
      }),
      Actions.token.approve.call(caller, {
        token: Tempo.addresses.alphaUsd,
        spender: Tempo.accounts[6]!.address,
        amount: 300n,
      }),
      Actions.token.approve.call(caller, {
        token: Tempo.addresses.alphaUsd,
        spender: recipient.address,
        amount: 200n,
      }),
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 50n,
      }),
    ],
  })
  expect(Object.values(capabilities?.balanceDiffs ?? {}).flat()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        address: Tempo.addresses.alphaUsd,
        direction: 'outgoing',
        value: '0x226',
      }),
      expect.objectContaining({
        address: Tempo.addresses.pathUsd,
        direction: 'outgoing',
        value: '0x190',
      }),
    ]),
  )
})

test.each([
  { gas: 1_000_000n, amount: '0x1', formatted: '0.000001' },
  { gas: 1_000_001n, amount: '0x2', formatted: '0.000002' },
])('rounds the reported fee up: $gas', async ({ gas, amount, formatted }) => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.simulate(),
        Relay.feePayer({
          account: Tempo.accounts[0]!,
          feeToken: Tempo.addresses.alphaUsd,
        }),
      ],
    }),
  })
  const { capabilities } = await fillTransaction(client, {
    account: userAccount.address,
    feePayer: true,
    feeToken: Tempo.addresses.alphaUsd,
    gas,
    nonce: 0,
    maxFeePerGas: 1_000_000n,
    maxPriorityFeePerGas: 0n,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(capabilities?.fee).toMatchObject({ amount, formatted })
})
