import { Relay } from 'viem/tempo'
import { expect, test } from 'vitest'

test.each([undefined, {}, { plugins: [] }])(
  'handleRequest passes through without plugins: %j',
  async (options) => {
    const next: Relay.handleRequest.Handler = async (request, options) => ({
      request,
      options,
    })
    const handle = Relay.handleRequest(next, options)

    expect(handle).toBe(next)
    expect(
      await handle(
        { method: 'eth_getBalance', params: ['0x1234', 'pending'] },
        { chainId: 4217, retryCount: 0, uid: 'balance' },
      ),
    ).toMatchInlineSnapshot(`
      {
        "options": {
          "chainId": 4217,
          "retryCount": 0,
          "uid": "balance",
        },
        "request": {
          "method": "eth_getBalance",
          "params": [
            "0x1234",
            "pending",
          ],
        },
      }
    `)
  },
)

test('handleRequest composes requests in array order and responses in reverse', async () => {
  const plugins: readonly Relay.Plugin[] = Object.freeze([
    (next) => async (request, options) => ({
      outer: await next(
        { ...request, params: [...(request.params ?? []), 'outer'] },
        { ...options, chainId: 4217 },
      ),
    }),
    (next) => async (request, options) => ({
      inner: await next(
        { ...request, params: [...(request.params ?? []), 'inner'] },
        { ...options, uid: 'inner' },
      ),
    }),
  ])
  const handle = Relay.handleRequest(
    async (request, options) => ({ request, options }),
    { plugins },
  )

  expect(
    await handle(
      { method: 'relay_example', params: ['input'] },
      { chainId: 1, retryCount: 0, uid: 'original' },
    ),
  ).toMatchInlineSnapshot(`
    {
      "outer": {
        "inner": {
          "options": {
            "chainId": 4217,
            "retryCount": 0,
            "uid": "inner",
          },
          "request": {
            "method": "relay_example",
            "params": [
              "input",
              "outer",
              "inner",
            ],
          },
        },
      },
    }
  `)
})

test('handleRequest allows a plugin to handle a request locally', async () => {
  const handle = Relay.handleRequest(async () => 'downstream', {
    plugins: [
      (next) => async (request, options) =>
        request.method === 'eth_chainId' ? '0x1069' : next(request, options),
    ],
  })

  expect(await handle({ method: 'eth_chainId' })).toMatchInlineSnapshot(
    `"0x1069"`,
  )
  expect(await handle({ method: 'eth_blockNumber' })).toMatchInlineSnapshot(
    `"downstream"`,
  )
})

test('handleRequest preserves per-request options through plugins', async () => {
  const options = { chainId: 4217, signal: new AbortController().signal }
  const handle = Relay.handleRequest(async (_request, options) => options, {
    plugins: [(next) => (request, options) => next(request, options)],
  })

  expect(await handle({ method: 'eth_chainId' }, options)).toBe(options)
  expect(await handle({ method: 'eth_chainId' })).toMatchInlineSnapshot(
    'undefined',
  )
})

test('handleRequest propagates downstream and plugin errors unchanged', async () => {
  const downstream = new Error('downstream rejected request')
  const plugin = new Error('plugin rejected request')
  const handle = Relay.handleRequest(
    async () => {
      throw downstream
    },
    {
      plugins: [
        (next) => async (request, options) => {
          if (request.method === 'relay_reject') throw plugin
          return next(request, options)
        },
      ],
    },
  )

  await expect(handle({ method: 'eth_blockNumber' })).rejects.toBe(downstream)
  await expect(handle({ method: 'relay_reject' })).rejects.toBe(plugin)
})
