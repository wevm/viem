import type { Capabilities as TempoCapabilities_ } from 'viem/tempo'
import { http as tempoHttp_ } from 'viem/tempo'
import { Client as CoreClient_ } from 'viem'
import { from as parseUnits } from 'ox/Value'
import { randomPrivateKey as generatePrivateKey } from 'ox/Secp256k1'
import { Actions as CoreActions_ } from 'viem'
import { tempoLocalnet as chain_ } from 'viem/chains'
import { Account as TempoAccount_ } from 'viem/tempo'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { http } from 'viem'

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
import * as Tempo from '~test/tempo.js'
import { createServer as createHttpServer } from '~test/http.js'
import { getDefaultTokens, resolveFeeToken } from './feeToken.js'

const userAccount = TempoAccount_.fromSecp256k1(Tempo.accounts[9]!.privateKey)
const feePayerAccount = TempoAccount_.fromSecp256k1(
  Tempo.accounts[0]!.privateKey,
)
const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)

// Token candidates for the local test chain.
const localnetTokens = [
  '0x20c0000000000000000000000000000000000000',
  '0x20c0000000000000000000000000000000000001',
  '0x20c0000000000000000000000000000000000002',
  '0x20c0000000000000000000000000000000000003',
] as const

const caller = Tempo.getClient({})

beforeAll(async () => {
  await Promise.all(
    [0, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({}), {
        account: TempoAccount_.fromSecp256k1(Tempo.accounts[index]!.privateKey),
        timeout: 60_000,
      }),
    ),
  )
  // userAccount prefers alphaUsd (a faucet-funded genesis token) as its fee token.
  await CoreActions_.contract.writeSync(caller, {
    ...Actions.fee.setUserToken.call({ token: Tempo.alphaUsd }),
    account: userAccount,
  })
})

test.each([undefined, Tempo.pathUsd] as const)(
  'resolves a fee token with override %s',
  async (feeToken) => {
    const client = CoreClient_.create({
      chain: chain_,
      transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
        resolveTokens: () => localnetTokens,

        plugins: [Relay.feeToken()],
      }),
    })
    const { transaction, capabilities } = await CoreActions_.transaction.fill(
      client,
      {
        account: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken,
      },
    )
    expect(transaction.feeToken?.toLowerCase()).toBe(feeToken ?? Tempo.alphaUsd)
    expect(transaction.feePayerSignature).toBeUndefined()
    expect(
      (
        capabilities as
          | TempoCapabilities_.FillTransactionCapabilities
          | undefined
      )?.sponsored,
    ).toBe(false)
  },
)

test('provides token defaults to a fee payer through frozen middleware', async () => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      resolveTokens: () => [Tempo.alphaUsd],

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
  const { transaction } = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(Tempo.alphaUsd)
  expect(transaction.feePayerSignature).toBeDefined()
})
test('cached metadata preserves bigint fields', async () => {
  const store = Store.memory()
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      resolveTokens: () => [Tempo.alphaUsd],

      plugins: [Relay.feeToken(), Relay.simulate({ store })],
    }),
  })
  const first = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const second = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(
    (
      second.capabilities as
        | TempoCapabilities_.FillTransactionCapabilities
        | undefined
    )?.balanceDiffs,
  ).toEqual(
    (
      first.capabilities as
        | TempoCapabilities_.FillTransactionCapabilities
        | undefined
    )?.balanceDiffs,
  )
  expect(
    (
      second.capabilities as
        | TempoCapabilities_.FillTransactionCapabilities
        | undefined
    )?.fee?.symbol,
  ).toBe('AlphaUSD')
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

test.each([
  [1, '0x9f6F3991D525015a6F8CaF062C83b62fD3AC4436'],
  [8453, '0xB2000000000000000000002fEb517dFeC7415344'],
] as const)(
  'default candidates include OUSD on chain %s',
  async (chainId, address) => {
    expect(await getDefaultTokens(chainId)).toEqual([address])
  },
)

test.each([1337])(
  'default candidates are empty for an unlisted chain: %s',
  async (chainId) => {
    expect(await getDefaultTokens(chainId)).toMatchInlineSnapshot('[]')
  },
)

test('an explicit token does not require token discovery', async () => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      resolveTokens: () => {
        throw new Error('Discovery is unavailable')
      },

      plugins: [Relay.feeToken()],
    }),
  })
  const { transaction } = await CoreActions_.transaction.fill(client, {
    account: userAccount.address,
    feeToken: Tempo.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(Tempo.alphaUsd)
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
    token: Tempo.pathUsd,
    feeToken: Tempo.alphaUsd,
  })
  const active = new Set<symbol>()
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
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
    Tempo.alphaUsd,
  ] as const
  await expect(
    resolveFeeToken(client, {
      account: userAccount.address,
      exclude: Tempo.pathUsd,
      tokens,
    }),
  ).resolves.toMatchObject({ feeToken: Tempo.alphaUsd })
})

test('uses a funded preference outside the configured candidates', async () => {
  const account = TempoAccount_.fromSecp256k1(Tempo.accounts[6]!.privateKey)
  await Actions.faucet.fundSync(caller, { account, timeout: 60_000 })
  await CoreActions_.contract.writeSync(caller, {
    ...Actions.fee.setUserToken.call({ token: Tempo.alphaUsd }),
    account,
  })
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      resolveTokens: () => [localnetTokens[2]],

      plugins: [Relay.feeToken()],
    }),
  })
  const { transaction } = await CoreActions_.transaction.fill(client, {
    account: account.address,
    calls: [
      Actions.token.transfer.call(caller, {
        token: localnetTokens[2],
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  expect(transaction.feeToken?.toLowerCase()).toBe(Tempo.alphaUsd)
})

test('uses a funded call target outside the configured candidates', async () => {
  const account = TempoAccount_.fromSecp256k1(Tempo.accounts[10]!.privateKey)
  await Actions.token.transferSync(caller, {
    account: userAccount,
    token: localnetTokens[2],
    to: account.address,
    amount: 100_000_000n,
  })
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      resolveTokens: () => [Tempo.pathUsd],

      plugins: [Relay.feeToken()],
    }),
  })
  const { transaction } = await CoreActions_.transaction.fill(client, {
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

test.skipIf('localnet' !== 'localnet')(
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
      transport: http(server.url),
    })

    const account = Account.fromSecp256k1(generatePrivateKey())
    const token = Tempo.alphaUsd

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

    const receipt = await CoreActions_.transaction.sendSync(client, {
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

test.each(['direct', 'quote'] as const)(
  'skips illiquid preferences and candidates until the %s route is funded',
  async (route) => {
    // Fresh tokens start without pools, so the test controls when each route becomes usable.
    const account = Account.fromSecp256k1(generatePrivateKey())
    const { token: quoteToken } = await Actions.token.createSync(caller, {
      account: userAccount,
      admin: userAccount.address,
      feeToken: Tempo.alphaUsd,
      name: 'Quote Test',
      symbol: 'QUOTE',
      currency: 'USD',
    })
    await Actions.token.grantRolesSync(caller, {
      account: userAccount,
      feeToken: Tempo.alphaUsd,
      token: quoteToken,
      roles: ['issuer'],
      to: userAccount.address,
    })
    await Actions.token.mintSync(caller, {
      account: userAccount,
      feeToken: Tempo.alphaUsd,
      token: quoteToken,
      to: userAccount.address,
      amount: parseUnits('10', 6),
    })
    const { token } = await Actions.token.createSync(caller, {
      account: userAccount,
      admin: userAccount.address,
      feeToken: Tempo.alphaUsd,
      name: 'Liquidity Test',
      symbol: 'LIQ',
      currency: 'USD',
      quoteToken,
    })
    await Actions.token.grantRolesSync(caller, {
      account: userAccount,
      feeToken: Tempo.alphaUsd,
      token,
      roles: ['issuer'],
      to: userAccount.address,
    })
    // The illiquid preference has the largest balance; AlphaUSD provides a smaller, liquid fallback.
    await Actions.token.mintSync(caller, {
      account: userAccount,
      feeToken: Tempo.alphaUsd,
      token,
      to: account.address,
      amount: parseUnits('1000', 6),
    })
    await Actions.token.transferSync(caller, {
      account: userAccount,
      feeToken: Tempo.alphaUsd,
      token: Tempo.alphaUsd,
      to: account.address,
      amount: parseUnits('1', 6),
    })
    await Actions.fee.setUserTokenSync(caller, {
      account,
      feeToken: Tempo.alphaUsd,
      token,
    })

    // Observe real RPC requests to ensure liquidity checks stay within the single preflight call.
    const requests: string[] = []
    const client = CoreClient_.create({
      chain: chain_,
      transport: http(Tempo.rpcUrl, {
        onFetchRequest(_request, init) {
          requests.push(JSON.parse(init!.body as string).method)
        },
      }),
    })

    // Reject the illiquid preference whether or not it also appears in the candidate list.
    for (const tokens of [[Tempo.alphaUsd], [token, Tempo.alphaUsd]] as const) {
      requests.length = 0
      const result = await resolveFeeToken(client, {
        account: account.address,
        tokens,
      })

      expect(result).toMatchInlineSnapshot(`
        {
          "feeToken": "0x20c0000000000000000000000000000000000001",
          "virtualAddresses": undefined,
        }
      `)
      expect(requests).toMatchInlineSnapshot(`
        [
          "eth_call",
        ]
      `)
    }

    // A full relay fill must use AlphaUSD even when the transfer targets the illiquid token.
    const relayClient = CoreClient_.create({
      chain: chain_,
      transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
        resolveTokens: () => [token, Tempo.alphaUsd],
        plugins: [Relay.feeToken()],
      }),
    })
    const { transaction } = await CoreActions_.transaction.fill(relayClient, {
      account: account.address,
      calls: [
        Actions.token.transfer.call(caller, {
          token,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })

    expect(transaction.feeToken).toMatchInlineSnapshot(
      `"0x20c0000000000000000000000000000000000001"`,
    )

    // Without a liquid fallback, leave selection to the execution node.
    const empty = await resolveFeeToken(client, {
      account: account.address,
      tokens: [token],
    })

    expect(empty).toMatchInlineSnapshot(`
      {
        "feeToken": undefined,
        "virtualAddresses": undefined,
      }
    `)

    // Fund either the direct route to pathUSD or the first leg through the quote token.
    await Actions.amm.mintSync(caller, {
      account: userAccount,
      feeToken: Tempo.alphaUsd,
      userTokenAddress: token,
      validatorTokenAddress: route === 'direct' ? Tempo.pathUsd : quoteToken,
      validatorTokenAmount: parseUnits('1', 6),
      to: userAccount.address,
    })
    if (route === 'quote') {
      // The first leg alone is insufficient: the quote token still needs a pool into pathUSD.
      const incomplete = await resolveFeeToken(client, {
        account: account.address,
        tokens: [token],
      })

      expect(incomplete).toMatchInlineSnapshot(`
        {
          "feeToken": undefined,
          "virtualAddresses": undefined,
        }
      `)

      await Actions.amm.mintSync(caller, {
        account: userAccount,
        feeToken: Tempo.alphaUsd,
        userTokenAddress: quoteToken,
        validatorTokenAddress: Tempo.pathUsd,
        validatorTokenAmount: parseUnits('1', 6),
        to: userAccount.address,
      })
    }

    // Once the route is complete, the preference wins outside the candidate list with no extra RPC.
    requests.length = 0
    const liquid = await resolveFeeToken(client, {
      account: account.address,
      tokens: [Tempo.alphaUsd],
    })

    expect(liquid.feeToken?.toLowerCase()).toBe(token.toLowerCase())
    expect(requests).toMatchInlineSnapshot(`
      [
        "eth_call",
      ]
    `)
  },
)

test('the validator token needs no pool', async () => {
  const result = await resolveFeeToken(caller, {
    account: feePayerAccount.address,
    exclude: Tempo.alphaUsd,
    tokens: [Tempo.pathUsd],
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "feeToken": "0x20c0000000000000000000000000000000000000",
      "virtualAddresses": undefined,
    }
  `)
})
