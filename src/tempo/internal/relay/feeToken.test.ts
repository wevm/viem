import { createRequestListener } from '@remix-run/node-fetch-server'
import { createClient, http, parseUnits } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import { fillTransaction, sendTransactionSync } from 'viem/actions'
import { tempo, tempoModerato } from 'viem/chains'
import {
  Account,
  Actions,
  Addresses,
  Relay,
  Store,
  withRelay,
} from 'viem/tempo'
import { beforeAll, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'
import { getDefaultTokens, resolveFeeToken } from './feeToken.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

// Token candidates for the local test chain.
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
        resolveTokens: () => localnetTokens,

        plugins: [Relay.feeToken()],
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
      resolveTokens: () => [Tempo.addresses.alphaUsd],

      plugins: [
        Relay.feePayer({ account: feePayerAccount }),
        {
          async handleRequest(_context, next) {
            return next()
          },
        } satisfies Relay.Plugin,
        Relay.feeToken(),
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
      resolveTokens: () => [Tempo.addresses.alphaUsd],

      plugins: [Relay.feeToken(), Relay.simulate({ store })],
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

test.each([false, true])(
  'redacts token-list failures, simulate: %s',
  async (simulate) => {
    const relay = Relay.create({
      resolveTokens: () => {
        throw new Error('Private token-list configuration')
      },

      client: caller,
      plugins: [...(simulate ? [Relay.simulate()] : []), Relay.feeToken()],
    })
    await expect(
      relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            to: recipient.address,
            capabilities: { errors: true },
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: -32603,
      message: 'Internal error',
      data: { code: 'internal_error' },
    })
  },
)

test('default candidates include mainnet tokens and exclude testnet-only tokens', async () => {
  const tokens = await getDefaultTokens(tempo.id)
  expect(tokens).toContain('0x20c0000000000000000000000000000000000000')
  expect(tokens).toContain('0x20c000000000000000000000f047dd7018e50367')
  expect(tokens).not.toContain('0x20c0000000000000000000000000000000000001')
  expect(tokens).not.toContain('0x20c000000000000000000000d72572838bbee59c')
})

test('default candidates use the testnet deployments in token-set order', async () => {
  expect(await getDefaultTokens(tempoModerato.id)).toMatchInlineSnapshot(`
    [
      "0x20c0000000000000000000000000000000000001",
      "0x20c0000000000000000000000000000000000002",
      "0x20c000000000000000000000d72572838bbee59c",
      "0x20c0000000000000000000000000000000000000",
      "0x20c0000000000000000000000000000000000003",
      "0x20c0000000000000000000009e8d7eb59b783726",
    ]
  `)
})

test.each([1, 1337])(
  'default candidates are empty for an unlisted chain: %s',
  async (chainId) => {
    expect(await getDefaultTokens(chainId)).toMatchInlineSnapshot('[]')
  },
)

test('an explicit token does not require token discovery', async () => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      resolveTokens: () => {
        throw new Error('Discovery is unavailable')
      },

      plugins: [Relay.feeToken()],
    }),
  })
  const { transaction } = await fillTransaction(client, {
    account: userAccount.address,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(Tempo.addresses.alphaUsd)
})

test.each(['calls', 'resolver'] as const)(
  'rejects excessive fee candidates from %s',
  async (source) => {
    const tokens = Array.from(
      { length: 101 },
      (_, i) => `0x20c0${(i + 100).toString(16).padStart(36, '0')}` as const,
    )
    const relay = Relay.create({
      resolveTokens: () => (source === 'resolver' ? tokens : []),

      client: caller,
      plugins: [Relay.feeToken()],
    })
    await expect(
      relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            calls: source === 'calls' ? tokens.map((to) => ({ to })) : [],
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: -32602,
      message: 'Fee-token candidates exceed the limit of 100 tokens.',
    })
  },
)

test('selects a funded token within a downstream concurrency budget', async () => {
  await Actions.fee.setUserTokenSync(caller, {
    account: userAccount,
    token: Tempo.addresses.pathUsd,
    feeToken: Tempo.addresses.alphaUsd,
  })
  const active = new Set<symbol>()
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        {
          async handleRequest(_context, next) {
            const slot = Symbol()
            active.add(slot)
            try {
              // Ten balance reads may overlap with the user-token lookup.
              if (active.size > 11)
                throw new Error('Downstream concurrency exceeded')
              return await next()
            } finally {
              active.delete(slot)
            }
          },
        },
      ] satisfies readonly Relay.Plugin[],
    }),
  })
  const tokens = [
    ...Array.from(
      { length: 30 },
      (_, i) => `0x20c0${(i + 100).toString(16).padStart(36, '0')}` as const,
    ),
    Tempo.addresses.alphaUsd,
  ]
  await expect(
    resolveFeeToken(client, {
      account: userAccount.address,
      exclude: Tempo.addresses.pathUsd,
      tokens,
    }),
  ).resolves.toMatchObject({ feeToken: Tempo.addresses.alphaUsd })
})

test('uses a funded preference outside the configured candidates', async () => {
  const account = Tempo.accounts[6]!
  await Actions.faucet.fundSync(caller, { account, timeout: 60_000 })
  await Actions.fee.setUserTokenSync(caller, {
    account,
    token: Tempo.addresses.alphaUsd,
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      resolveTokens: () => [localnetTokens[2]],

      plugins: [Relay.feeToken()],
    }),
  })
  const { transaction } = await fillTransaction(client, {
    account: account.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: localnetTokens[2],
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(Tempo.addresses.alphaUsd)
})

test('uses a funded call target outside the configured candidates', async () => {
  const account = Tempo.accounts[10]!
  await Actions.token.transferSync(caller, {
    account: userAccount,
    token: localnetTokens[2],
    to: account.address,
    amount: 100_000_000n,
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      resolveTokens: () => [Tempo.addresses.pathUsd],

      plugins: [Relay.feeToken()],
    }),
  })
  const { transaction } = await fillTransaction(client, {
    account: account.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: localnetTokens[2],
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(localnetTokens[2])
})

test.skipIf(Tempo.nodeEnv !== 'localnet')(
  'plain HTTP transport: selects a funded token and broadcasts the transaction',
  async () => {
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => localnetTokens,
      plugins: [Relay.feeToken()],
    })
    const server = await createHttpServer(createRequestListener(relay.fetch))
    onTestFinished(async () => {
      await server.close()
    })
    const client = Tempo.getClient({
      chain: Tempo.chain,
      transport: http(server.url),
    })
    const account = Account.fromSecp256k1(generatePrivateKey())
    const token = Tempo.addresses.alphaUsd
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token,
      to: account.address,
      amount: parseUnits('1', 6),
    })
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.pathUsd,
        })
      ).amount,
    ).toMatchInlineSnapshot(`0n`)
    const balance = await Actions.token.getBalance(client, {
      account: recipient.address,
      token,
    })
    const receipt = await sendTransactionSync(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.feeToken).toBe(token)
    expect(receipt.feePayer).toBe(account.address.toLowerCase())
    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`1n`)
  },
)
