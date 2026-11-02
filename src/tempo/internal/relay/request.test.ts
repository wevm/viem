import type { Capabilities as TempoCapabilities_ } from 'viem/tempo'
import { Client as CoreClient_ } from 'viem'
import { Account as CoreAccount_ } from 'viem'
import { withResolvers } from '../../../core/internal/promise.js'
import { createServer } from 'node:http'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Secp256k1, Signature } from 'ox'
import { Transaction as core_Transaction, TxEnvelopeTempo } from 'ox/tempo'
import { Actions as CoreActions_, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import {
  Account,
  Actions,
  Addresses,
  Relay,
  Store,
  VirtualAddress,
  withRelay,
} from 'viem/tempo'
import { expect, onTestFinished, test } from 'vitest'
import { createServer as createHttpServer } from '~test/http.js'
import * as Tempo from '~test/tempo.js'

test.each([1, false, {}, [], 'recipient', '0x1234'])(
  'rejects malformed call targets through Fetch: %s',
  async (to) => {
    const relay = Relay.create({
      client: CoreClient_.create({
        chain: tempoLocalnet,
        transport: http('http://127.0.0.1:1', { retryCount: 0 }),
      }),
      plugins: [Relay.feeToken()],
    })
    const response = await relay.fetch(
      new Request('https://relay.example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_fillTransaction',
          params: [{ calls: [{ to }] }],
        }),
      }),
    )
    expect(await response.json()).toEqual({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32602, message: 'Invalid transaction call target.' },
    })
  },
)

test('preserves the requested fee token through an external relay', async () => {
  const account = CoreAccount_.fromPrivateKey(
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  )
  const client = CoreClient_.create({
    chain: tempoLocalnet,
    transport: http('http://127.0.0.1:1', { retryCount: 0 }),
  })
  const upstream = Relay.create({
    client,
    resolveTokens: () => [Addresses.pathUsd],
    plugins: [Relay.feePayer({ account })],
  })
  const server = await createHttpServer(createRequestListener(upstream.fetch))
  onTestFinished(async () => {
    await server.close()
  })
  const relay = Relay.create({
    client,
    plugins: [
      Relay.feePayer({
        allowedFeePayers: [server.url],
        internal_allowUnsafeUrls: true,
      }),
    ],
  })
  const feeToken = '0x20c0000000000000000000000000000000000001'
  const result = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        type: '0x76',
        from: account.address,
        chainId: tempoLocalnet.id,
        nonce: '0x0',
        gas: '0x186a0',
        maxFeePerGas: '0x1',
        maxPriorityFeePerGas: '0x0',
        calls: [{ to: account.address, value: '0x0' }],
        feePayer: server.url,
        feeToken,
      },
    ],
  })) as Relay.Plugin.FillResult
  const transaction = core_Transaction.fromRpc(
    result.tx as core_Transaction.Rpc,
  )!
  const envelope = TxEnvelopeTempo.from(
    transaction as TxEnvelopeTempo.TxEnvelopeTempo,
  )
  expect(transaction.feeToken).toBe(feeToken)
  expect(
    Secp256k1.recoverAddress({
      payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
        sender: account.address,
      }),
      signature: envelope.feePayerSignature!,
    }),
  ).toBe(account.address.toLowerCase())
})

test.each(
  ['transaction', 'feePayer', 'configurable'].flatMap((mode) =>
    [0, 1].map((retryCount) => ({ mode, retryCount })),
  ),
)(
  'preserves the downstream retry budget: $mode, $retryCount',
  async ({ mode, retryCount }) => {
    // A temporarily unavailable endpoint becomes permanently unavailable after
    // the permitted attempts. An extra forwarding retry changes the observed error.
    const server = createServer()
    const failures = Array.from({ length: retryCount + 1 }, () => ({
      code: -32603,
      message: 'Temporarily unavailable',
    }))
    server.on('request', (_request, response) => {
      response.setHeader('Content-Type', 'application/json')
      response.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: failures.shift() ?? {
            code: -32602,
            message: 'Permanently unavailable',
          },
        }),
      )
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    onTestFinished(
      () =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()))
          server.closeAllConnections()
        }),
    )
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing port')
    const relay = Relay.create({
      client: CoreClient_.create({
        chain: tempoLocalnet,
        transport: http(`http://127.0.0.1:${address.port}`, { retryCount: 0 }),
      }),
      plugins:
        mode === 'transaction'
          ? [Relay.simulate(), Relay.feeToken()]
          : mode === 'feePayer'
            ? [
                Relay.feePayer({
                  account: CoreAccount_.fromPrivateKey(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                  ),
                }),
              ]
            : [Relay.accounts({ store: Store.memory() })],
    })
    await expect(
      relay.request(
        {
          method:
            mode === 'configurable'
              ? 'account_getConfig'
              : 'eth_fillTransaction',
          params: [
            mode !== 'configurable'
              ? {
                  from: '0x0000000000000000000000000000000000000001',
                  to: '0x0000000000000000000000000000000000000002',
                  feeToken: Addresses.pathUsd,
                }
              : { address: '0x0000000000000000000000000000000000000001' },
          ],
        },
        { retryCount, retryDelay: 0 },
      ),
    ).rejects.toMatchObject({ code: -32603 })
    // The first request must consume the entire downstream retry budget.
    await expect(
      relay.request({ method: 'eth_blockNumber' }, { retryCount: 0 }),
    ).rejects.toMatchObject({ code: -32602 })
  },
)

test('middleware shares request state and sees the result before enrichment', async () => {
  const handle = Relay.handleRequest(
    async (request) => ({ tx: {}, capabilities: { method: request.method } }),
    {
      plugins: [
        {
          async handleRequest(context, next) {
            context.request = {
              ...context.request,
              params: [{ to: '0x0000000000000000000000000000000000000001' }],
            }
            await next()
            const filled = context.result as Relay.Plugin.FillResult
            expect(filled.capabilities?.preview).toBeUndefined()
            context.result = {
              ...filled,
              capabilities: { ...filled.capabilities, middleware: true },
            }
          },
          async afterFill(filled) {
            expect(filled.capabilities?.middleware).toBe(true)
            return { capabilities: { preview: 'complete' } }
          },
        },
      ],
    },
  )
  expect(await handle({ method: 'eth_fillTransaction', params: [{}] }))
    .toMatchInlineSnapshot(`
    {
      "capabilities": {
        "method": "eth_fillTransaction",
        "middleware": true,
        "preview": "complete",
        "sponsored": false,
      },
      "tx": {
        "blockHash": undefined,
        "blockNumber": null,
        "calls": [
          {
            "data": "0x",
            "to": undefined,
            "value": undefined,
          },
        ],
        "from": undefined,
        "gas": "0x0",
        "hash": undefined,
        "nonce": "0x0",
        "transactionIndex": null,
        "type": "0x76",
      },
    }
  `)
})

test('post-fill hooks and signing run concurrently against an immutable transaction', async () => {
  const ready = withResolvers<void>()
  const account = CoreAccount_.fromPrivateKey(
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  )
  const handle = Relay.handleRequest(
    async () => ({ tx: { calls: [{ to: account.address }] } }),
    {
      plugins: [
        {
          async afterFill(filled) {
            await ready.promise
            expect(Object.isFrozen(filled.tx)).toBe(true)
            expect(Object.isFrozen((filled.tx.calls as unknown[])[0])).toBe(
              true,
            )
            return { capabilities: { preview: true } }
          },
        },
        {
          async signTransaction() {
            const signature = await account.sign({
              hash: `0x${'00'.repeat(32)}`,
            })
            ready.resolve()
            return Signature.toRpc(Signature.from(signature))
          },
        },
      ],
    },
  )
  try {
    const result = (await handle({
      method: 'eth_fillTransaction',
      params: [{}],
    })) as Relay.Plugin.FillResult
    expect(result.capabilities?.preview).toBe(true)
    expect(result.tx.feePayerSignature).toBeDefined()
  } finally {
    ready.resolve()
  }
})

test('rejects competing hook capabilities and multiple signers', async () => {
  const plugin: Relay.Plugin = {
    async afterFill() {
      return { capabilities: { fee: 'ambiguous' } }
    },
  }
  const handle = Relay.handleRequest(async () => ({ tx: {} }), {
    plugins: [plugin, plugin],
  })
  await expect(
    handle({ method: 'eth_fillTransaction', params: [{}] }),
  ).rejects.toMatchObject({ code: -32603 })
  const signer: Relay.Plugin = {
    async signTransaction() {
      return undefined
    },
  }
  expect(() =>
    Relay.handleRequest(async () => null, { plugins: [signer, signer] }),
  ).toThrow('Only one relay transaction signer')
})

test('token resolution is shared across plugins but isolated between requests and chains', async () => {
  const candidates = [
    Addresses.pathUsd,
    '0x20c0000000000000000000000000000000000001',
  ] as const
  const available = [...candidates]
  const handle = Relay.handleRequest(async () => null, {
    resolveTokens: () => [available.shift()!],
    plugins: [
      {
        async handleRequest(context, next) {
          const first = await context.resolveTokens()
          await next()
          context.result = { first, second: context.result }
        },
      },
      {
        async handleRequest(context) {
          return context.resolveTokens()
        },
      },
    ],
  })
  const result = await Promise.all([
    handle({ method: 'relay_tokens' }, { chainId: 1 }),
    handle({ method: 'relay_tokens' }, { chainId: 2 }),
  ])
  expect(result).toEqual(
    candidates.map((token) => ({ first: [token], second: [token] })),
  )
})

test('next cannot execute the downstream handler twice', async () => {
  const handle = Relay.handleRequest(async () => 'done', {
    plugins: [
      {
        async handleRequest(_context, next) {
          await next()
          await next()
        },
      },
    ],
  })
  await expect(handle({ method: 'relay_example' })).rejects.toThrow(
    'next() may only be called once',
  )
})

test('post-fill hooks receive only the selected fill, not intermediate downstream requests', async () => {
  const handle = Relay.handleRequest(
    async (request) => ({ tx: request.params![0] }),
    {
      plugins: [
        {
          async handleRequest(context) {
            await context.client.request({
              method: 'eth_fillTransaction',
              params: [{ nonce: '0x1' }],
            } as never)
            return context.client.request({
              method: 'eth_fillTransaction',
              params: [{ nonce: '0x2' }],
            } as never)
          },
          async afterFill(filled) {
            if (filled.tx.nonce !== '0x2')
              throw new Error('Intermediate fill reached enrichment')
            return { capabilities: { selectedNonce: filled.tx.nonce } }
          },
        },
      ],
    },
  )
  const result = (await handle(
    { method: 'eth_fillTransaction', params: [{}] },
    { chainId: tempoLocalnet.id },
  )) as Relay.Plugin.FillResult
  expect(result.capabilities?.selectedNonce).toMatchInlineSnapshot('"0x2"')
})

test('estimates sponsored fills without caller fee caps and restores them', async () => {
  const fill = (
    parameters: Record<string, unknown>,
    tx: Record<string, unknown> = {},
  ) =>
    Relay.handleRequest(
      async (request) => {
        const { feeToken, maxFeePerGas, maxPriorityFeePerGas } = request
          .params![0] as Record<string, unknown>
        return {
          tx: {
            gas: '0x5208',
            maxFeePerGas: '0x64',
            maxPriorityFeePerGas: '0x2',
            ...tx,
          },
          capabilities: {
            forwarded: { feeToken, maxFeePerGas, maxPriorityFeePerGas },
          },
        }
      },
      { plugins: [{}] },
    )({
      method: 'eth_fillTransaction',
      params: [{ feePayer: true, feeToken: Addresses.pathUsd, ...parameters }],
    }) as Promise<Relay.Plugin.FillResult>
  const results = await Promise.all([
    fill({ maxFeePerGas: '0x32', maxPriorityFeePerGas: '0x1' }),
    fill({ maxFeePerGas: 50n }),
    fill({ maxFeePerGas: 50 }, { maxPriorityFeePerGas: '0x64' }),
    fill({ maxFeePerGas: '0x32' }, { maxPriorityFeePerGas: undefined }),
    fill({ gas: '0x1', maxFeePerGas: '0x32' }),
    fill({ maxFeePerGas: '0xzz' }),
    fill({ maxFeePerGas: '0x32', maxPriorityFeePerGas: -1 }),
    fill({ maxFeePerGas: '0x32', feePayer: false }),
    fill(
      { maxFeePerGas: '0x32' },
      {
        feePayerSignature: { r: '0x1', s: '0x2', yParity: '0x0' },
      },
    ),
    fill({ maxPriorityFeePerGas: '0x5' }),
    fill({ maxPriorityFeePerGas: '0xc8' }),
    fill({ maxPriorityFeePerGas: '0x5' }, { maxFeePerGas: undefined }),
    fill({ maxFeePerGas: '0x5', maxPriorityFeePerGas: '0x6' }),
    fill({ maxFeePerGas: '0x032' }),
    fill({ maxFeePerGas: `0x1${'0'.repeat(64)}` }),
  ])

  expect(
    results.map(({ capabilities, tx }) => ({
      forwarded: capabilities?.forwarded,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x32",
        "maxPriorityFeePerGas": "0x1",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x32",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x32",
        "maxPriorityFeePerGas": "0x32",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x32",
        "maxPriorityFeePerGas": "0x32",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": "0x32",
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": "0xzz",
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": "0x32",
          "maxPriorityFeePerGas": -1,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "maxFeePerGas": "0x32",
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x5",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0xc8",
        "maxPriorityFeePerGas": "0xc8",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": undefined,
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": "0x5",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": "0x5",
          "maxPriorityFeePerGas": "0x6",
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": "0x032",
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
      {
        "forwarded": {
          "feeToken": undefined,
          "maxFeePerGas": "0x10000000000000000000000000000000000000000000000000000000000000000",
          "maxPriorityFeePerGas": undefined,
        },
        "maxFeePerGas": "0x64",
        "maxPriorityFeePerGas": "0x2",
      },
    ]
  `)
})

test('sponsors an unfunded sender that sets fee fields without gas', async () => {
  const feePayer = Account.fromSecp256k1(Tempo.accounts[0]!.privateKey)
  const recipient = Tempo.accounts[7]!
  const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  await Actions.faucet.fundSync(Tempo.getClient(), {
    account: feePayer,
    timeout: 60_000,
  })
  const client = CoreClient_.create({
    chain: tempoLocalnet,
    transport: withRelay(http(Tempo.rpcUrl), {
      plugins: [Relay.feePayer({ account: feePayer })],
    }),
  })

  const { transaction } = await CoreActions_.transaction.fill(client, {
    account: sender.address,
    calls: [
      Actions.token.approve.call(client, {
        amount: 1n,
        spender: recipient.address,
        token: Tempo.alphaUsd,
      }),
    ],
    maxFeePerGas: 50_000_000_000n,
    maxPriorityFeePerGas: 1n,
  })
  const { gas, maxFeePerGas, maxPriorityFeePerGas } = transaction
  const receipt = await CoreActions_.transaction.sendRawSync(client, {
    transaction: await signTransaction(sender, transaction),
  })

  expect({ maxFeePerGas, maxPriorityFeePerGas }).toMatchInlineSnapshot(`
    {
      "maxFeePerGas": 50000000000n,
      "maxPriorityFeePerGas": 1n,
    }
  `)
  expect(gas).toBeGreaterThan(0n)
  expect({
    feePayer: receipt.feePayer,
    status: receipt.status,
  }).toMatchInlineSnapshot(`
    {
      "feePayer": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "status": "success",
    }
  `)
})

test('sponsors an unfunded sender that sets only a priority fee without gas', async () => {
  const feePayer = Account.fromSecp256k1(Tempo.accounts[0]!.privateKey)
  const recipient = Tempo.accounts[7]!
  const sender = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  await Actions.faucet.fundSync(Tempo.getClient(), {
    account: feePayer,
    timeout: 60_000,
  })
  const client = CoreClient_.create({
    chain: tempoLocalnet,
    transport: withRelay(http(Tempo.rpcUrl), {
      plugins: [Relay.feePayer({ account: feePayer })],
    }),
  })

  const { transaction } = await CoreActions_.transaction.fill(client, {
    account: sender.address,
    calls: [
      Actions.token.approve.call(client, {
        amount: 1n,
        spender: recipient.address,
        token: Tempo.alphaUsd,
      }),
    ],
    maxPriorityFeePerGas: 1_000_000_000n,
  })
  const { gas, maxFeePerGas, maxPriorityFeePerGas } = transaction
  const receipt = await CoreActions_.transaction.sendRawSync(client, {
    transaction: await signTransaction(sender, transaction),
  })

  expect(maxPriorityFeePerGas).toMatchInlineSnapshot(`1000000000n`)
  expect(maxFeePerGas).toBeGreaterThanOrEqual(maxPriorityFeePerGas!)
  expect(gas).toBeGreaterThan(0n)
  expect({
    feePayer: receipt.feePayer,
    status: receipt.status,
  }).toMatchInlineSnapshot(`
    {
      "feePayer": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "status": "success",
    }
  `)
})

test('simulation middleware rejects malformed fill quantities before forwarding', async () => {
  const handle = Relay.handleRequest(
    async () => {
      throw new Error('Malformed request reached downstream')
    },
    { plugins: [Relay.simulate()] },
  )
  await expect(
    handle(
      { method: 'eth_fillTransaction', params: [{ value: '0xzz' }] },
      { chainId: tempoLocalnet.id },
    ),
  ).rejects.toMatchObject({ code: -32602 })
})

test('keeps a sponsored fill when optional virtual-address metadata is unavailable', async () => {
  const account = CoreAccount_.fromPrivateKey(`0x${'0'.repeat(63)}1`)
  const target = VirtualAddress.from({
    masterId: '0x00000001',
    userTag: '0x000000000001',
  })
  const relay = Relay.create({
    client: CoreClient_.create({
      chain: tempoLocalnet,
      transport: http('http://127.0.0.1:1', { retryCount: 0, timeout: 500 }),
    }),
    plugins: [Relay.feePayer({ account })],
  })
  const result = (await relay.request({
    method: 'eth_fillTransaction',
    params: [
      {
        from: account.address,
        chainId: tempoLocalnet.id,
        nonce: '0x0',
        gas: '0x186a0',
        maxFeePerGas: '0x1',
        maxPriorityFeePerGas: '0x0',
        feeToken: Addresses.pathUsd,
        calls: [{ to: target }],
        feePayer: true,
      },
    ],
  })) as Relay.Plugin.FillResult
  expect(result.tx.feePayerSignature).toBeDefined()
  expect(
    (
      result.capabilities as
        | TempoCapabilities_.FillTransactionCapabilities
        | undefined
    )?.sponsored,
  ).toBe(true)
  expect(
    (
      result.capabilities as
        | TempoCapabilities_.FillTransactionCapabilities
        | undefined
    )?.virtualAddresses,
  ).toBeUndefined()
})

test.each(['tempo_simulateV1', 'eth_call'])(
  'propagates cancellation during %s',
  async (method) => {
    const started = withResolvers<void>()
    const controller = new AbortController()
    const server = await createHttpServer(async (request, response) => {
      let raw = ''
      for await (const chunk of request) raw += chunk
      const body = JSON.parse(raw)
      if (body.method === method) {
        started.resolve()
        return
      }
      response.setHeader('Content-Type', 'application/json')
      response.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: 'Method not found' },
        }),
      )
    })
    try {
      const account = CoreAccount_.fromPrivateKey(`0x${'0'.repeat(63)}1`)
      const relay = Relay.create({
        client: CoreClient_.create({
          chain: tempoLocalnet,
          transport: http(server.url, { retryCount: 0 }),
        }),
        plugins: [Relay.feePayer({ account }), Relay.simulate()],
      })
      const pending = relay.request(
        {
          method: 'eth_fillTransaction',
          params: [
            {
              from: account.address,
              chainId: tempoLocalnet.id,
              nonce: '0x0',
              gas: '0x186a0',
              maxFeePerGas: '0x1',
              maxPriorityFeePerGas: '0x0',
              feeToken: Addresses.pathUsd,
              calls: [{ to: account.address }],
              feePayer: true,
              capabilities: { balanceDiffs: method !== 'eth_call' },
            },
          ],
        },
        { signal: controller.signal, retryCount: 0 },
      )
      const rejected = expect(pending).rejects.toMatchObject({
        name: 'AbortError',
      })
      await started.promise
      controller.abort()
      await rejected
    } finally {
      controller.abort()
      await server.close()
    }
  },
)

test.each([null, [], 'call', 1])(
  'reports malformed call %s as invalid params through Fetch',
  async (call) => {
    const relay = Relay.create({
      client: CoreClient_.create({
        chain: tempoLocalnet,
        transport: http('http://127.0.0.1:1', { retryCount: 0 }),
      }),
      plugins: [Relay.simulate()],
    })
    const response = await relay.fetch(
      new Request('https://relay.example', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_fillTransaction',
          params: [{ calls: [call] }],
        }),
      }),
    )
    expect(await response.json()).toMatchObject({
      error: { code: -32602, message: 'Expected a transaction call object.' },
    })
  },
)

test.each(['none', 'explicit', 'resolved'])(
  'replaces a supplied signature and records local sponsorship with fee token: %s',
  async (mode) => {
    const account = CoreAccount_.fromPrivateKey(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    )
    const client = CoreClient_.create({
      chain: tempoLocalnet,
      transport: http('http://127.0.0.1:1', { retryCount: 0 }),
    })
    const transaction = {
      type: '0x76',
      from: account.address,
      chainId: tempoLocalnet.id,
      nonce: '0x0',
      nonceKey: '0xff',
      gas: '0x186a0',
      maxFeePerGas: '0x1',
      maxPriorityFeePerGas: '0x0',
      feeToken: mode === 'resolved' ? undefined : Addresses.pathUsd,
      calls: [{ to: account.address, value: '0x0' }],
      feePayer: true,
      feePayerSignature: { r: '0x1', s: '0x2', yParity: '0x0' },
    }
    const request = { method: 'eth_fillTransaction', params: [transaction] }
    const relay = Relay.create({
      client,
      resolveTokens: () => [Addresses.pathUsd],
      plugins: [
        ...(mode !== 'none' ? [Relay.feeToken()] : []),
        Relay.feePayer({
          account,
          onSponsored: () => {
            throw new Error('Recording unavailable')
          },
        }),
      ],
    })
    await expect(relay.request(request)).rejects.toMatchObject({
      code: -32603,
      message: 'Internal error',
    })

    const sponsored = Relay.create({
      client,
      resolveTokens: () => [Addresses.pathUsd],
      plugins: [
        ...(mode !== 'none' ? [Relay.feeToken()] : []),
        Relay.feePayer({ account }),
      ],
    })
    const result = (await sponsored.request(request)) as Relay.Plugin.FillResult
    expect(result.tx.nonceKey).toBe('0xff')
    expect(result.tx.feePayerSignature).toBeDefined()
    expect(Signature.fromRpc(result.tx.feePayerSignature as never).r).not.toBe(
      1n,
    )
  },
)

test.each(['handler', 'create', 'transport'])(
  'bounds nested callbacks that ignore the fill deadline: %s',
  async (mode) => {
    const release = withResolvers<void>()
    const completed = withResolvers<unknown>()
    const rpc = http('http://127.0.0.1:1', { retryCount: 0 })
    const options = {
      timeout: 60_000,
      plugins: [
        {
          async handleRequest(context) {
            await release.promise
            completed.resolve(context.client.request({ method: 'eth_chainId' }))
          },
        },
      ],
    } satisfies Relay.handleRequest.Options
    const inner =
      mode === 'handler'
        ? Relay.handleRequest(rpc.setup().request, options)
        : mode === 'create'
          ? Relay.create<number>({
              client: CoreClient_.create({
                chain: tempoLocalnet,
                transport: rpc,
              }),
              ...options,
            }).request
          : withRelay(rpc, options).setup({ chain: tempoLocalnet }).request
    const relay = Relay.handleRequest(inner, {
      timeout: 20,
      plugins: [Relay.simulate()],
    })
    await expect(
      relay(
        { method: 'eth_fillTransaction', params: [{}] },
        { chainId: tempoLocalnet.id },
      ),
    ).rejects.toMatchObject({
      code: -32005,
      message: 'Relay fill exceeded its deadline.',
    })
    const rejected = expect(completed.promise).rejects.toMatchObject({
      code: -32005,
      message: 'Relay fill exceeded its deadline.',
    })
    release.resolve()
    await rejected
  },
)

test('allows transport retries beyond four attempts', async () => {
  let requests = 0
  const server = await createHttpServer((_request, response) => {
    requests++
    if (requests <= 5) {
      response.writeHead(503)
      response.end()
      return
    }
    response.setHeader('Content-Type', 'application/json')
    response.end(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -32602, message: 'Permanently unavailable' },
      }),
    )
  })
  try {
    const relay = Relay.create({
      client: CoreClient_.create({
        chain: tempoLocalnet,
        transport: http(server.url),
      }),
      plugins: [Relay.simulate()],
    })
    await expect(
      relay.request(
        { method: 'eth_fillTransaction', params: [{}] },
        {
          retryCount: 10,
          retryDelay: 0,
        },
      ),
    ).rejects.toMatchObject({
      code: -32602,
      message: 'Permanently unavailable',
    })
    expect(requests).toBe(6)
  } finally {
    await server.close()
  }
})

test('aborts a Retry-After delay at the fill deadline', async () => {
  const server = await createHttpServer((_request, response) => {
    response.writeHead(503, { 'Retry-After': '60' })
    response.end()
  })
  try {
    const relay = Relay.create({
      client: CoreClient_.create({
        chain: tempoLocalnet,
        transport: http(server.url),
      }),
      timeout: 100,
      plugins: [Relay.simulate()],
    })
    await expect(
      relay.request(
        { method: 'eth_fillTransaction', params: [{}] },
        {
          retryCount: 10,
        },
      ),
    ).rejects.toMatchObject({
      code: -32005,
      message: 'Relay fill exceeded its deadline.',
    })
  } finally {
    await server.close()
  }
})

test('rejects invalid timeouts', () => {
  for (const timeout of [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])
    expect(() =>
      Relay.handleRequest(async () => null, {
        timeout,
        plugins: [Relay.simulate()],
      }),
    ).toThrow('Expected a positive integer for timeout.')
})

test('rejects a timeout that would overflow the runtime timer', () => {
  expect(() =>
    Relay.handleRequest(async () => null, {
      plugins: [Relay.simulate()],
      timeout: 2 ** 31,
    }),
  ).toThrow('The fill timeout cannot exceed 2147483647 milliseconds.')
})

test('rejects an already aborted fill without starting callbacks', async () => {
  const controller = new AbortController()
  controller.abort()
  const relay = Relay.handleRequest(async () => null, {
    plugins: [
      {
        async handleRequest() {
          throw new Error('Unexpected callback')
        },
      },
    ],
  })
  await expect(
    relay(
      { method: 'eth_fillTransaction', params: [{}] },
      { signal: controller.signal },
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
})

test.each(['create', 'transport'])(
  'retries downstream I/O without rerunning %s middleware',
  async (mode) => {
    const requests: string[] = []
    const server = await createHttpServer(async (request, response) => {
      let raw = ''
      for await (const chunk of request) raw += chunk
      const body = JSON.parse(raw)
      requests.push(body.method)
      if (body.method === 'eth_fillTransaction') {
        response.writeHead(503)
        response.end()
        return
      }
      response.setHeader('Content-Type', 'application/json')
      response.end(
        JSON.stringify({ jsonrpc: '2.0', id: body.id, result: '0x7a69' }),
      )
    })
    try {
      const options = {
        plugins: [
          {
            async handleRequest(context, next) {
              if (context.request.method === 'eth_fillTransaction')
                await context.client.request({ method: 'eth_chainId' })
              await next()
            },
          },
        ],
      } satisfies Relay.handleRequest.Options
      const inner =
        mode === 'create'
          ? Relay.create<number>({
              client: CoreClient_.create({
                chain: tempoLocalnet,
                transport: http(server.url),
              }),
              ...options,
            }).request
          : withRelay(http(server.url), options).setup({ chain: tempoLocalnet })
              .request
      const relay = Relay.handleRequest(inner, {
        plugins: [Relay.simulate()],
      })
      await expect(
        relay(
          { method: 'eth_fillTransaction', params: [{}] },
          {
            chainId: tempoLocalnet.id,
            retryCount: 1,
            retryDelay: 0,
          },
        ),
      ).rejects.toMatchObject({ code: -32603 })
      expect(requests).toEqual([
        'eth_chainId',
        'eth_fillTransaction',
        'eth_fillTransaction',
      ])
    } finally {
      await server.close()
    }
  },
)

/** Signs a prepared request or filled transaction as `account` through the Tempo envelope. */
function signTransaction(
  account: { signTransaction: Account.Account['signTransaction'] },
  request: unknown,
) {
  return account.signTransaction(
    tempoLocalnet.transaction.toEnvelope(request as never) as never,
    { chain: tempoLocalnet } as never,
  )
}
