import { createClient } from 'viem'
import { fillTransaction } from 'viem/actions'
import { Actions, Relay, Store, withRelay } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

// Keep token candidates independent of the token-list API.
const localnetTokens = [
  '0x20c0000000000000000000000000000000000000',
  '0x20c0000000000000000000000000000000000001',
  '0x20c0000000000000000000000000000000000002',
  '0x20c0000000000000000000000000000000000003',
] as const

const caller = Tempo.getClient({ chain: Tempo.chain })

beforeAll(async () => {
  await Promise.all(
    [0, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({ chain: Tempo.chain }), {
        account: Tempo.accounts[index]!,
        timeout: 60_000,
      }),
    ),
  )
  // userAccount prefers alphaUsd (a faucet-funded genesis token) as its fee token.
  await Actions.fee.setUserTokenSync(caller, {
    account: userAccount,
    token: Tempo.addresses.alphaUsd,
  })
})

test.each([undefined, Tempo.addresses.pathUsd])(
  'resolves a fee token with override %s',
  async (feeToken) => {
    const client = createClient({
      chain: Tempo.chain,
      transport: withRelay(Tempo.http(), {
        plugins: [Relay.feeToken({ resolveTokens: () => localnetTokens })],
      }),
    })
    const { transaction, capabilities } = await fillTransaction(client, {
      account: userAccount.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feeToken,
    })
    expect(transaction.feeToken?.toLowerCase()).toBe(
      feeToken ?? Tempo.addresses.alphaUsd,
    )
    expect(transaction.feePayerSignature).toBeUndefined()
    expect(capabilities?.sponsored).toBe(false)
  },
)

test('provides token defaults to a fee payer through frozen middleware', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.feePayer({ account: feePayerAccount }),
        ((next) =>
          Object.freeze((request, options) =>
            next(request, options),
          )) satisfies Relay.Plugin,
        Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
      ],
    }),
  })
  const { transaction } = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(Tempo.addresses.alphaUsd)
  expect(transaction.feePayerSignature).toBeDefined()
})
test('cached metadata preserves bigint fields', async () => {
  const store = Store.memory()
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.feeToken({
          resolveTokens: () => [Tempo.addresses.alphaUsd],
          store,
        }),
        Relay.simulate({ store }),
      ],
    }),
  })
  const first = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const second = await fillTransaction(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(second.capabilities?.balanceDiffs).toEqual(
    first.capabilities?.balanceDiffs,
  )
  expect(second.capabilities?.fee?.symbol).toBe('AlphaUSD')
})
