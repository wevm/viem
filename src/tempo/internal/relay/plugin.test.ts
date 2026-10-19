import { Secp256k1 } from 'ox'
import { Transaction as core_Transaction, TxEnvelopeTempo } from 'ox/tempo'
import { createClient, getAddress, http } from 'viem'
import { fillTransaction } from 'viem/actions'
import {
  Actions,
  type Capabilities,
  Relay,
  Store,
  VirtualAddress,
  withRelay,
} from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { rpcUrl } from '~test/tempo/prool.js'

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

test.each(['legacy', 'calls'])(
  'reports malformed %s values as invalid params through Fetch',
  async (shape) => {
    const relay = Relay.create({ client: caller, plugins: [Relay.simulate()] })
    const response = await relay.fetch(
      new Request('https://relay.example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_fillTransaction',
          params: [
            {
              from: userAccount.address,
              ...(shape === 'legacy'
                ? { to: recipient.address, value: '0xzz' }
                : { calls: [{ to: recipient.address, value: '0xzz' }] }),
            },
          ],
        }),
      }),
    )
    expect(await response.json()).toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32602,
          "message": "Invalid transaction value.",
        },
        "id": 1,
        "jsonrpc": "2.0",
      }
    `)
  },
)

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

test.each(['plain', 'custom'] as const)(
  'built-in plugins compose around a downstream handler: %s',
  async (mode) => {
    const downstream: Relay.handleRequest.Handler = (request) =>
      caller.request(request as never)
    const plugins = [
      Relay.simulate(),
      Relay.feePayer({ account: feePayerAccount }),
      ...(mode === 'custom'
        ? [
            {
              async handleRequest(_context, next) {
                return next()
              },
            } satisfies Relay.Plugin,
          ]
        : []),
      Relay.feeToken(),
    ]
    const handle = Relay.handleRequest(downstream, {
      plugins,
      resolveTokens: () => [Tempo.addresses.alphaUsd],
    })
    const result = (await handle(
      {
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            calls: [
              Actions.token.transfer.call(caller, {
                token: Tempo.addresses.alphaUsd,
                to: recipient.address,
                amount: 1n,
              }),
            ],
          },
        ],
      },
      { chainId: Tempo.chain.id },
    )) as {
      tx: Record<string, unknown>
      capabilities: Capabilities.FillTransactionCapabilities
    }
    const transaction = core_Transaction.fromRpc(
      result.tx as core_Transaction.Rpc,
    )!
    expect(transaction.feeToken?.toLowerCase()).toBe(
      Tempo.addresses.alphaUsd.toLowerCase(),
    )
    expect(result.capabilities.sponsored).toBe(true)
    expect(result.capabilities.balanceDiffs).toBeDefined()
    expect(result.capabilities.fee).toBeDefined()
    const envelope = TxEnvelopeTempo.from(
      transaction as TxEnvelopeTempo.TxEnvelopeTempo,
    )
    expect(
      Secp256k1.recoverAddress({
        payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
          sender: userAccount.address,
        }),
        signature: envelope.feePayerSignature!,
      }),
    ).toBe(feePayerAccount.address.toLowerCase())
  },
)

test.each(
  Array.from({ length: 8 }, (_, mask) =>
    [false, true].map((reverse) => ({ mask, reverse })),
  ).flat(),
)('enabled plugins $mask, reversed $reverse', async ({ mask, reverse }) => {
  const plugins = [
    Relay.feePayer({ account: feePayerAccount }),
    Relay.feeToken(),
    Relay.simulate(),
  ].filter((_, index) => mask & (1 << index))
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: reverse ? [...plugins].reverse() : plugins,
      resolveTokens: () => localnetTokens,
    }),
  })
  const result = await fillTransaction(client, {
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
  expect(result.transaction.gas).toBeGreaterThan(0n)
  if (mask !== 0) expect(result.capabilities?.sponsored).toBe(Boolean(mask & 1))
  expect(Boolean(result.transaction.feePayerSignature)).toBe(Boolean(mask & 1))
  expect(Boolean(result.capabilities?.fee)).toBe(Boolean(mask & 4))
  expect(Boolean(result.capabilities?.balanceDiffs)).toBe(Boolean(mask & 4))
})

test('built-in plugins preserve unrelated requests and request options', async () => {
  const signal = new AbortController().signal
  const request = { method: 'eth_chainId' }
  const options = { signal, retryCount: 0, uid: 'unrelated' }
  const handle = Relay.handleRequest(
    async (request, options) => ({ request, options }),
    {
      plugins: [Relay.feePayer(), Relay.feeToken(), Relay.simulate()],
    },
  )
  expect(await handle(request, options)).toEqual({ request, options })
})

test('built-in plugins preserve nested RPC errors and normalize expiration', async () => {
  const upstreamError = {
    code: -32603,
    message: 'Revm error: transaction expired: valid_before is in the past',
  }
  const handle = Relay.handleRequest(
    async () => {
      throw new Error('Transport failed', { cause: upstreamError })
    },
    { plugins: [Relay.simulate()] },
  )
  await expect(
    handle(
      {
        method: 'eth_fillTransaction',
        params: [{ from: userAccount.address, to: recipient.address }],
      },
      { chainId: Tempo.chain.id },
    ),
  ).rejects.toMatchObject({
    code: -32003,
    message: 'Transaction expired.',
    data: { code: 'transaction_expired' },
  })
})

test.each(['0x76', '0x78'] as const)(
  'malformed Tempo envelope %s returns invalid params',
  async (serialized) => {
    for (const plugin of [
      Relay.feePayer(),
      Relay.feeToken(),
      Relay.simulate(),
    ]) {
      const relay = Relay.create({ client: caller, plugins: [plugin] })
      for (const method of [
        'eth_signRawTransaction',
        'eth_sendRawTransaction',
        'eth_sendRawTransactionSync',
      ]) {
        const response = await relay.fetch(
          new Request('https://relay.example', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method,
              params: [serialized],
            }),
          }),
        )
        expect(await response.json()).toMatchObject({
          id: 1,
          error: {
            code: -32602,
            message: 'Invalid serialized Tempo transaction.',
          },
        })
      }
    }
  },
)

test('simulation and virtual-address resolution progress while sponsorship is pending', async () => {
  const simulated = Promise.withResolvers<void>()
  const resolved = Promise.withResolvers<void>()
  const virtual = VirtualAddress.from({
    masterId: '0xffffffff',
    userTag: '0x000000000001',
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      resolveTokens: () => [Tempo.addresses.alphaUsd],

      plugins: [
        Relay.simulate(),
        Relay.feePayer({
          account: feePayerAccount,
          onSponsored: async () => {
            await simulated.promise
          },
        }),
        Relay.feeToken(),
        {
          async handleRequest(context, next) {
            const { request } = context
            if (request.method === 'tempo_simulateV1') await resolved.promise
            await next()
            const result = context.result
            if (request.method === 'tempo_simulateV1') simulated.resolve()
            if (request.method === 'eth_call') resolved.resolve()
            return result
          },
        },
      ] satisfies readonly Relay.Plugin[],
    }),
  })
  try {
    const { transaction, capabilities } = await fillTransaction(client, {
      account: userAccount.address,
      calls: [
        { to: virtual },
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })
    expect(transaction.feePayerSignature).toBeDefined()
    expect(capabilities?.balanceDiffs).toBeDefined()
    expect(capabilities).toMatchObject({
      virtualAddresses: { [virtual]: null },
    })
  } finally {
    simulated.resolve()
    resolved.resolve()
  }
})

test.each([
  'not-a-chain',
  '',
  ' ',
  '0x',
  '0xzz',
  '1.5',
  null,
  {},
  -1,
  0,
  1.5,
  Number.MAX_SAFE_INTEGER + 1,
])('rejects an invalid explicit chain ID: %s', async (chainId) => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  await expect(
    relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          chainId,
          to: recipient.address,
        },
      ],
    }),
  ).rejects.toMatchObject({
    code: -32602,
    message: 'Invalid transaction chain ID.',
  })
})

test.each(['none', 'accept', 'reject'] as const)(
  'fills within four HTTP requests with cold caches and maximum candidates: %s',
  async (sponsorship) => {
    const requests: string[] = []
    const rpc = Tempo.getClient({
      transport: http(rpcUrl, {
        retryCount: 0,
        onFetchRequest(_request, init) {
          const body = JSON.parse(init.body as string)
          expect(Array.isArray(body)).toBe(false)
          requests.push(body.method)
        },
      }),
    })
    const targets = Array.from({ length: 100 }, (_, index) =>
      VirtualAddress.from({
        masterId: '0xffffffff',
        userTag: `0x${(index + 1).toString(16).padStart(12, '0')}`,
      }),
    )
    const relay = Relay.create({
      client: rpc,
      resolveTokens: () => [
        localnetTokens[2],
        ...Array.from(
          { length: 99 },
          (_, index) =>
            `0x20c0${(index + 100).toString(16).padStart(36, '0')}` as const,
        ),
      ],
      plugins: [
        ...(sponsorship === 'none'
          ? []
          : [
              Relay.feePayer({
                account: feePayerAccount,
                validate: () => sponsorship === 'accept',
              }),
            ]),
        Relay.feeToken(),
        Relay.simulate({ store: Store.memory() }),
      ],
    })
    const result = (await relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          calls: [
            Actions.token.transfer.call(caller, {
              token: localnetTokens[2],
              to: recipient.address,
              amount: 1n,
            }),
            ...targets.map((to) => ({ to })),
          ],
        },
      ],
    })) as Relay.Plugin.FillResult
    expect(result.capabilities?.sponsored).toBe(sponsorship === 'accept')
    expect(result.capabilities?.virtualAddresses).toEqual(
      Object.fromEntries(targets.map((target) => [target, null])),
    )
    expect(result.capabilities?.balanceDiffs).toMatchObject({
      [userAccount.address]: [
        expect.objectContaining({
          address: localnetTokens[2],
          value: '0x1',
        }),
      ],
    })
    expect(result.capabilities?.fee).toBeDefined()
    expect(requests).toEqual(
      sponsorship === 'reject'
        ? [
            'eth_fillTransaction',
            'eth_call',
            'eth_fillTransaction',
            'tempo_simulateV1',
          ]
        : sponsorship === 'none'
          ? ['eth_call', 'eth_fillTransaction', 'tempo_simulateV1']
          : ['eth_fillTransaction', 'tempo_simulateV1', 'eth_call'],
    )
  },
)

test.each(['handler', 'create', 'transport'])(
  'allows more than four requests through nested relays: %s',
  async (mode) => {
    const requests: string[] = []
    const rpc = http(rpcUrl, {
      retryCount: 0,
      onFetchRequest(_request, init) {
        requests.push(JSON.parse(init.body as string).method)
      },
    })({})
    const options = {
      plugins: [
        {
          async handleRequest(context, next) {
            if (context.request.method === 'eth_fillTransaction') {
              await context.client.request({ method: 'eth_blockNumber' })
              await context.client.request({ method: 'eth_blockNumber' })
            }
            await next()
          },
        },
      ],
    } satisfies Relay.handleRequest.Options
    const inner =
      mode === 'handler'
        ? Relay.handleRequest(rpc.request, options)
        : mode === 'create'
          ? Relay.create<number>({
              client: Tempo.getClient({
                chain: Tempo.chain,
                transport: () => rpc,
              }),
              ...options,
            }).request
          : withRelay(() => rpc, options)({ chain: Tempo.chain }).request
    const outer = Relay.handleRequest(inner, {
      plugins: [
        {
          async handleRequest(context, next) {
            if (context.request.method === 'eth_fillTransaction')
              for (let i = 0; i < 3; i++)
                await context.client.request({ method: 'eth_blockNumber' })
            await next()
          },
        },
      ],
    })
    const result = outer(
      {
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            feeToken: Tempo.addresses.alphaUsd,
            calls: [{ to: recipient.address, data: '0x', value: '0x0' }],
          },
        ],
      },
      { chainId: Tempo.chain.id },
    )
    await expect(result).resolves.toMatchObject({
      tx: { feeToken: Tempo.addresses.alphaUsd },
    })
    expect(requests).toEqual([
      ...Array.from({ length: 5 }, () => 'eth_blockNumber'),
      'eth_fillTransaction',
    ])
  },
)

test('preserves deficit metadata within four requests with virtual recipients', async () => {
  const { token } = await Actions.token.createSync(caller, {
    account: userAccount,
    admin: userAccount.address,
    name: 'Budget Deficit',
    symbol: 'DEF',
    currency: 'USD',
  })
  await Actions.token.grantRolesSync(caller, {
    account: userAccount,
    token,
    roles: ['issuer'],
    to: userAccount.address,
  })
  await Actions.token.mintSync(caller, {
    account: userAccount,
    token,
    to: userAccount.address,
    amount: 40_000_000n,
  })
  const requests: string[] = []
  const rpc = Tempo.getClient({
    transport: http(rpcUrl, {
      retryCount: 0,
      onFetchRequest(_request, init) {
        requests.push(JSON.parse(init.body as string).method)
      },
    }),
  })
  const virtual = VirtualAddress.from({
    masterId: '0xffffffff',
    userTag: '0x000000000001',
  })
  const relay = Relay.create({
    client: rpc,
    resolveTokens: () => [Tempo.addresses.alphaUsd],
    plugins: [Relay.feeToken(), Relay.simulate()],
  })
  const result = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        from: userAccount.address,
        calls: [
          Actions.token.transfer.call(caller, {
            token,
            to: recipient.address,
            amount: 100_000_000n,
          }),
          { to: virtual, value: '0x0', data: '0x' },
        ],
        capabilities: { errors: true },
      },
    ],
  })) as Relay.Plugin.FillResult
  expect(result.capabilities).toMatchObject({
    error: { errorName: 'InsufficientBalance' },
    insufficientFunds: {
      amount: '0x3938700',
      decimals: 6,
      formatted: '60',
      symbol: 'DEF',
      token: getAddress(token),
    },
    virtualAddresses: { [virtual]: null },
  })
  expect(requests).toEqual([
    'eth_call',
    'eth_fillTransaction',
    'tempo_simulateV1',
    'eth_call',
  ])
})
