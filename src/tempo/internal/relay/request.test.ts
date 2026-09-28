import { createServer } from 'node:http'
import { Signature } from 'ox'
import { createClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoLocalnet } from 'viem/chains'
import { Addresses, Relay, Store } from 'viem/tempo'
import { expect, onTestFinished, test } from 'vitest'

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
