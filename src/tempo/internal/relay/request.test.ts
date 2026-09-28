import { createServer } from 'node:http'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Secp256k1, Signature } from 'ox'
import { Transaction as core_Transaction, TxEnvelopeTempo } from 'ox/tempo'
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoLocalnet } from 'viem/chains'
import { Addresses, Relay, Store, VirtualAddress } from 'viem/tempo'
import { expect, onTestFinished, test } from 'vitest'
import { createHttpServer } from '~test/utils.js'

test('preserves the requested fee token through an external relay', async () => {
  const account = privateKeyToAccount(
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  )
  const client = createClient({
    chain: tempoLocalnet,
    transport: http('http://127.0.0.1:1', { retryCount: 0 }),
  })
  const upstream = Relay.create({
    client,
    resolveTokens: () => [Addresses.pathUsd],
    plugins: [Relay.feePayer({ account })],
  })
  const server = await createHttpServer(createRequestListener(upstream.fetch))
  onTestFinished(() => server.close())
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
  ['transaction', 'feePayer', 'multisig'].flatMap((mode) =>
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
      client: createClient({
        chain: tempoLocalnet,
        transport: http(`http://127.0.0.1:${address.port}`, { retryCount: 0 }),
      }),
      plugins:
        mode === 'transaction'
          ? [Relay.simulate(), Relay.feeToken()]
          : mode === 'feePayer'
            ? [
                Relay.feePayer({
                  account: privateKeyToAccount(
                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                  ),
                }),
              ]
            : [Relay.multisig({ store: Store.memory() })],
    })
    await expect(
      relay.request(
        {
          method:
            mode === 'multisig' ? 'multisig_getConfig' : 'eth_fillTransaction',
          params: [
            mode !== 'multisig'
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
  expect(
    await handle({ method: 'eth_fillTransaction', params: [{}] }),
  ).toMatchInlineSnapshot(`
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
        "input": undefined,
        "nonce": "0x0",
        "to": undefined,
        "transactionIndex": null,
        "type": "0x76",
        "value": "0x0",
      },
    }
  `)
})

test('post-fill hooks and signing run concurrently against an immutable transaction', async () => {
  const ready = Promise.withResolvers<void>()
  const account = privateKeyToAccount(
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
  const account = privateKeyToAccount(`0x${'0'.repeat(63)}1`)
  const target = VirtualAddress.from({
    masterId: '0x00000001',
    userTag: '0x000000000001',
  })
  const relay = Relay.create({
    client: createClient({
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
  expect(result.capabilities?.sponsored).toBe(true)
  expect(result.capabilities?.virtualAddresses).toBeUndefined()
})

test.each(['tempo_simulateV1', 'eth_simulateV1', 'eth_call'])(
  'propagates cancellation during %s',
  async (method) => {
    const started = Promise.withResolvers<void>()
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
      const account = privateKeyToAccount(`0x${'0'.repeat(63)}1`)
      const relay = Relay.create({
        client: createClient({
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
      client: createClient({
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
    const account = privateKeyToAccount(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    )
    const client = createClient({
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
