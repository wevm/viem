import { createRequestListener } from '@remix-run/node-fetch-server'
import { Hex, P256, Rlp, Secp256k1 } from 'ox'
import { SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { createClient, http } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  fillTransaction,
  getBlock,
  getTransactionCount,
  prepareTransactionRequest,
  sendRawTransactionSync,
  sendTransaction,
  sendTransactionSync,
  waitForTransactionReceipt,
} from 'viem/actions'
import {
  Account,
  Actions,
  Addresses,
  Relay,
  Transaction,
  withRelay,
} from 'viem/tempo'
import { beforeAll, describe, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'
import type * as Request from './request.js'
import * as Utils from './utils.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

const caller = Tempo.getClient({ chain: Tempo.chain })
const transfer = Actions.token.transfer.call(caller, {
  token: Tempo.addresses.alphaUsd,
  to: recipient.address,
  amount: 1n,
})

beforeAll(async () => {
  await Promise.all(
    [0, 9].map((index) =>
      Actions.faucet.fundSync(Tempo.getClient({ chain: Tempo.chain }), {
        account: Tempo.accounts[index]!,
        timeout: 60_000,
      }),
    ),
  )
  await Actions.fee.setUserTokenSync(caller, {
    account: userAccount,
    token: Tempo.addresses.alphaUsd,
  })
})

test.each([undefined, 1])(
  'preserves relay-filled validity bounds for sequential nonce sponsorship, validAfter: %s',
  async (validAfter) => {
    const block = await getBlock(caller)
    const validBefore = Number(block.timestamp) + 600
    const relay = Relay.create({
      client: caller,
      plugins: [
        {
          async handleRequest(context, next) {
            const { request } = context
            if (request.method === 'eth_fillTransaction') {
              const transaction = request.params![0] as Record<string, unknown>
              context.request = {
                ...request,
                params: [
                  {
                    ...transaction,
                    validBefore: Hex.fromNumber(validBefore),
                    ...(validAfter !== undefined
                      ? { validAfter: Hex.fromNumber(validAfter) }
                      : {}),
                  },
                ],
              }
            }
            await next()
            return context.result
          },
        },
        Relay.feePayer({
          account: feePayerAccount,
          feeToken: Tempo.addresses.alphaUsd,
        }),
      ],
    })
    const server = await createHttpServer(createRequestListener(relay.fetch))
    onTestFinished(async () => {
      await server.close()
    })
    const client = createClient({
      chain: Tempo.chain,
      transport: http(server.url),
    })
    const nonce = await getTransactionCount(caller, {
      address: userAccount.address,
      blockTag: 'pending',
    })

    const request = await prepareTransactionRequest(client, {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
      nonce,
      nonceKey: 0n,
    })
    const serializedTransaction = await userAccount.signTransaction(
      request as never,
    )
    const envelope = TxEnvelopeTempo.deserialize(
      serializedTransaction as `0x76${string}`,
    )

    expect(envelope.validBefore).toBe(validBefore)
    expect(envelope.validAfter).toBe(validAfter)
    expect(
      Secp256k1.recoverAddress({
        payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
          sender: userAccount.address,
        }),
        signature: envelope.feePayerSignature!,
      }),
    ).toBe(feePayerAccount.address.toLowerCase())

    const receipt = await sendRawTransactionSync(caller, {
      serializedTransaction,
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
  },
)

test.each(
  ['requested', 'configured'].flatMap((selection) =>
    [false, true].map((feeTokenFirst) => ({ selection, feeTokenFirst })),
  ),
)(
  'preserves the $selection token through an unprepared local sponsorship fill, feeTokenFirst: $feeTokenFirst',
  async ({ selection, feeTokenFirst }) => {
    const plugins = [
      Relay.feePayer({
        account: feePayerAccount,
        ...(selection === 'configured'
          ? { feeToken: Tempo.addresses.alphaUsd }
          : {}),
      }),
      Relay.feeToken(),
    ]
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.pathUsd],
      plugins: feeTokenFirst ? [...plugins].reverse() : plugins,
    })
    const result = (await relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          ...(selection === 'requested'
            ? { feeToken: Tempo.addresses.alphaUsd }
            : {}),
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.addresses.alphaUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
        },
      ],
    })) as Relay.Plugin.FillResult
    const transaction = Utils.normalizeTempoTransaction(result.tx)
    expect(transaction.feeToken?.toLowerCase()).toBe(
      Tempo.addresses.alphaUsd.toLowerCase(),
    )
    const receipt = await sendRawTransactionSync(caller, {
      serializedTransaction: await userAccount.signTransaction(
        transaction as never,
      ),
    })
    expect(receipt.status).toBe('success')
    expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
  },
)

test.each([true, false])('sponsorship accepted: %s', async (accepted) => {
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          validate: () => accepted,
        }),
      ],
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
    feeToken: Tempo.addresses.alphaUsd,
  })
  expect(capabilities?.sponsored).toBe(accepted)
  expect(Boolean(transaction.feePayerSignature)).toBe(accepted)
  const signed = await (async () => {
    if (accepted) return userAccount.signTransaction(transaction as never)
    const envelope = TxEnvelopeTempo.deserialize(
      (await Transaction.serialize(transaction as never)) as `0x76${string}`,
    )
    const signature = await userAccount.sign({
      hash: TxEnvelopeTempo.getSignPayload(envelope),
    })
    return TxEnvelopeTempo.serialize(envelope, {
      signature: SignatureEnvelope.from(signature),
    })
  })()
  const receipt = await sendRawTransactionSync(client, {
    serializedTransaction: signed,
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(
    (accepted ? feePayerAccount : userAccount).address.toLowerCase(),
  )
})

test('raw sponsorship resolves chain from the signed envelope', async () => {
  const request = await prepareTransactionRequest(
    Tempo.getClient({ chain: Tempo.chain }),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    getClient: ({ chainId }) =>
      Tempo.getClient({
        chain: { ...Tempo.chain, id: chainId },
        batch: { multicall: { deployless: true } },
      }),
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  const result = (await relay.request({
    method: 'eth_signRawTransaction',
    params: [signed],
  })) as `0x${string}`
  const envelope = TxEnvelopeTempo.deserialize(result as `0x76${string}`)
  expect(
    Secp256k1.recoverAddress({
      payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, {
        sender: userAccount.address,
      }),
      signature: envelope.feePayerSignature!,
    }),
  ).toBe(feePayerAccount.address.toLowerCase())
  await expect(
    relay.request(
      { method: 'eth_signRawTransaction', params: [signed] },
      { chainId: 1 },
    ),
  ).rejects.toThrow('Conflicting chain ids.')
})

test('rejects a mismatched resolver before signing a prepared fill', async () => {
  const relay = Relay.create({
    getClient: () => Tempo.getClient({ chain: Tempo.chain }),
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  await expect(
    relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          chainId: 1,
          gas: '0x100000',
          nonce: '0x0',
          maxFeePerGas: '0x1',
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.addresses.alphaUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
        },
      ],
    }),
  ).rejects.toThrow('Conflicting chain ids.')
})

test.each([
  'billing_past_due',
  'billing_required',
  'fee_token_unsupported',
  'spend_limit_exceeded',
  'tx_fee_limit_exceeded',
] as const)('raw sponsorship returns the %s refusal code', async (verdict) => {
  const request = await prepareTransactionRequest(
    Tempo.getClient({ chain: Tempo.chain }),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    client: Tempo.getClient({ chain: Tempo.chain }),
    plugins: [
      Relay.feePayer({ account: feePayerAccount, validate: () => verdict }),
    ],
  })
  await expect(
    relay.request({ method: 'eth_signRawTransaction', params: [signed] }),
  ).rejects.toMatchObject({
    code: -32602,
    data: { code: verdict },
  })
})

test('a failed sponsorship record prevents broadcast', async () => {
  const request = await prepareTransactionRequest(
    Tempo.getClient({ chain: Tempo.chain }),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.addresses.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    client: Tempo.getClient({ chain: Tempo.chain }),
    plugins: [
      Relay.feePayer({
        account: feePayerAccount,
        onSponsored: () => {
          throw new Error('Recording failed')
        },
      }),
    ],
  })
  const before = await Actions.token.getBalance(caller, {
    account: recipient.address,
    token: Tempo.addresses.alphaUsd,
  })
  await expect(
    relay.request({ method: 'eth_sendRawTransactionSync', params: [signed] }),
  ).rejects.toMatchObject({ code: -32603 })
  expect(
    await Actions.token.getBalance(caller, {
      account: recipient.address,
      token: Tempo.addresses.alphaUsd,
    }),
  ).toEqual(before)
})

test('a rejected prepared fill can be signed and sent without sponsorship', async () => {
  const prepared = await prepareTransactionRequest(caller, {
    account: userAccount,
    type: 'tempo',
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feePayer: true,
    gas: 1_000_000n,
    feeToken: Tempo.addresses.alphaUsd,
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      resolveTokens: () => [Tempo.addresses.alphaUsd],

      plugins: [
        Relay.feePayer({ account: feePayerAccount, validate: () => false }),
        Relay.feeToken(),
      ],
    }),
  })
  const { transaction, capabilities } = await fillTransaction(client, {
    ...prepared,
    chain: Tempo.chain,
  })
  expect(transaction.nonceKey).toBe(prepared.nonceKey)
  expect(capabilities?.sponsored).toBe(false)
  expect(transaction.feePayerSignature).toBeUndefined()
  expect(transaction).not.toMatchObject({ feePayer: true })
  const envelope = TxEnvelopeTempo.deserialize(
    (await Transaction.serialize(transaction as never)) as `0x76${string}`,
  )
  const signature = await userAccount.sign({
    hash: TxEnvelopeTempo.getSignPayload(envelope),
  })
  const receipt = await sendRawTransactionSync(client, {
    serializedTransaction: TxEnvelopeTempo.serialize(envelope, {
      signature: SignatureEnvelope.from(signature),
    }),
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(userAccount.address.toLowerCase())
})

test.each([false, true])(
  'external sponsorship preserves status without metadata, prepared: %s',
  async (prepared) => {
    const upstream = Relay.create({
      client: caller,
      plugins: [
        {
          async handleRequest(context, next) {
            const { request } = context
            await next()
            const result = context.result
            if (request.method !== 'eth_fillTransaction') return result
            const {
              sponsor: _,
              capabilities,
              ...rest
            } = result as Request.Result
            const { sponsor: __, ...metadata } = capabilities ?? {}
            return { ...rest, capabilities: metadata }
          },
        },
        Relay.feePayer({ account: feePayerAccount }),
      ],
    })
    const server = await createHttpServer(createRequestListener(upstream.fetch))
    try {
      const client = createClient({
        chain: Tempo.chain,
        transport: withRelay(Tempo.http(), {
          plugins: [
            Relay.feePayer({
              allowedFeePayers: [server.url],
              internal_allowUnsafeUrls: true,
            }),
          ],
        }),
      })
      const parameters = {
        account: userAccount,
        calls: [
          Actions.token.transfer.call(caller, {
            token: Tempo.addresses.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken: Tempo.addresses.alphaUsd,
      }
      const { transaction, capabilities } = await fillTransaction(client, {
        ...(prepared
          ? await prepareTransactionRequest(caller, {
              ...parameters,
              type: 'tempo',
              feePayer: true,
              gas: 1_000_000n,
            })
          : parameters),
        chain: Tempo.chain,
        feeToken: Tempo.addresses.alphaUsd,
        feePayer: server.url as never,
      })
      expect(transaction.feePayerSignature).toBeDefined()
      expect(capabilities?.sponsored).toBe(true)
      expect(capabilities?.sponsor).toBeUndefined()
      const receipt = await sendRawTransactionSync(caller, {
        serializedTransaction: await userAccount.signTransaction(
          transaction as never,
        ),
      })
      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
    } finally {
      await server.close()
    }
  },
)

test('cancelling a fill closes the external fee-payer request', async () => {
  const started = Promise.withResolvers<void>()
  const closed = Promise.withResolvers<void>()
  const server = await createHttpServer((request, response) => {
    request.resume()
    response.on('close', () => closed.resolve())
    started.resolve()
  })
  const controller = new AbortController()
  try {
    const relay = Relay.create({
      client: caller,
      plugins: [
        Relay.feePayer({
          allowedFeePayers: [server.url],
          internal_allowUnsafeUrls: true,
        }),
      ],
    })
    const pending = relay.request(
      {
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            feePayer: server.url,
            feeToken: Tempo.addresses.alphaUsd,
          },
        ],
      },
      { signal: controller.signal, retryCount: 0 },
    )
    const rejected = expect(pending).rejects.toThrow()
    await started.promise
    controller.abort()
    await rejected
    await closed.promise
  } finally {
    controller.abort()
    await server.close()
  }
})

test.each(['validate', 'onSponsored'] as const)(
  'redacts failures in %s with error capabilities enabled',
  async (hook) => {
    const relay = Relay.create({
      resolveTokens: () => [Tempo.addresses.alphaUsd],

      client: caller,
      plugins: [
        Relay.simulate(),
        Relay.feePayer({
          account: feePayerAccount,
          [hook]: async () => {
            await Actions.token.getBalance(caller, {
              account: userAccount.address,
              token: Tempo.addresses.alphaUsd,
            })
            throw new Error('Recording failed')
          },
        }),
        Relay.feeToken(),
      ],
    })
    const response = await relay.fetch(
      new globalThis.Request('https://relay.example', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_fillTransaction',
          params: [
            {
              from: userAccount.address,
              to: recipient.address,
              capabilities: { errors: true },
            },
          ],
        }),
      }),
    )
    expect(await response.json()).toMatchInlineSnapshot(`
    {
      "error": {
        "code": -32603,
        "data": {
          "code": "internal_error",
        },
        "message": "Internal error",
      },
      "id": 1,
      "jsonrpc": "2.0",
    }
  `)
  },
)

test.each([
  'https://untrusted.example/rpc',
  'https://relay.example/other',
  'https://relay.example/rpc?extra=1',
  'https://relay.example.attacker.example/rpc',
  'https://relay.example@attacker.example/rpc',
])(
  'rejects an external fee payer outside the allowlist: %s',
  async (feePayer) => {
    const relay = Relay.create({
      client: caller,
      plugins: [
        Relay.feePayer({ allowedFeePayers: ['https://relay.example/rpc'] }),
      ],
    })
    await expect(
      relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            feePayer,
            to: recipient.address,
          },
        ],
      }),
    ).rejects.toMatchObject({
      code: -32602,
      message: 'External fee payer URL is not allowed.',
    })
  },
)

test('unsafe development URLs still require an allowlist entry', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.feePayer({ internal_allowUnsafeUrls: true })],
  })
  await expect(
    relay.request({
      method: 'eth_fillTransaction',
      params: [{ from: userAccount.address, feePayer: 'http://127.0.0.1:1' }],
    }),
  ).rejects.toMatchObject({
    code: -32602,
    message: 'External fee payer URL is not allowed.',
  })
})

test('sponsors a transaction prepared for sender-paid gas', async () => {
  const prepared = await prepareTransactionRequest(caller, {
    account: userAccount,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const client = createClient({
    chain: Tempo.chain,
    transport: withRelay(Tempo.http(), {
      plugins: [Relay.feePayer({ account: feePayerAccount })],
    }),
  })
  const { transaction } = await fillTransaction(client, {
    ...prepared,
    chain: Tempo.chain,
  })
  const receipt = await sendRawTransactionSync(caller, {
    serializedTransaction: await userAccount.signTransaction(
      transaction as never,
    ),
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
})

test('replaces an untrusted fee-payer signature and applies sponsorship recording', async () => {
  const prepared = await prepareTransactionRequest(caller, {
    account: userAccount,
    feePayer: true,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const parameters = {
    ...Utils.formatFillTransactionRequest(caller, {
      ...prepared,
      from: userAccount.address,
    }),
    feePayerSignature: { r: '0x1', s: '0x2', yParity: '0x0' },
  }
  const relay = Relay.create({
    client: caller,
    plugins: [
      Relay.feePayer({
        account: feePayerAccount,
        onSponsored: () => {
          throw new Error('Sponsorship recording unavailable')
        },
      }),
    ],
  })
  await expect(
    relay.request({ method: 'eth_fillTransaction', params: [parameters] }),
  ).rejects.toThrow('Internal error')

  const sponsored = Relay.create({
    client: caller,
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  const result = (await sponsored.request({
    method: 'eth_fillTransaction',
    params: [parameters],
  })) as Request.Result
  const transaction = Utils.normalizeTempoTransaction(result.tx)
  const receipt = await sendRawTransactionSync(caller, {
    serializedTransaction: await userAccount.signTransaction(
      transaction as never,
    ),
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
})

test('preserves the synchronous broadcast timeout after signing', async () => {
  const prepared = await prepareTransactionRequest(caller, {
    account: userAccount,
    feePayer: true,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const relay = Relay.create({
    client: caller,
    plugins: [
      Relay.feePayer({ account: feePayerAccount }),
      {
        async handleRequest(context, next) {
          const { request } = context
          if (
            request.method === 'eth_sendRawTransactionSync' &&
            request.params?.[1] !== 5000
          )
            throw new Error('Expected the requested broadcast timeout')
          return next()
        },
      },
    ],
  })
  const receipt = await relay.request({
    method: 'eth_sendRawTransactionSync',
    params: [await userAccount.signTransaction(prepared as never), 5000],
  })
  expect(receipt).toMatchObject({ status: '0x1' })
})

test('does not sign a cached sponsored fill that skipped validation', async () => {
  const { transaction } = await fillTransaction(caller, {
    account: userAccount,
    feeToken: Tempo.addresses.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.addresses.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const relay = Relay.create({
    client: caller,
    plugins: [
      {
        handleRequest: async () => ({
          tx: Utils.formatTempoTransaction(transaction as never),
          capabilities: { sponsored: true },
        }),
      },
      Relay.feePayer({ account: feePayerAccount, validate: () => false }),
    ],
  })
  const result = (await relay.request({
    method: 'eth_fillTransaction',
    params: [{ from: userAccount.address }],
  })) as Request.Result
  expect(result.tx.feePayerSignature).toBeUndefined()
})

test('refuses to sign a transaction changed after sponsorship validation', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [
      {
        async handleRequest(context, next) {
          await next()
          if (context.request.method !== 'eth_fillTransaction') return
          const result = context.result as Request.Result
          context.result = { ...result, tx: { ...result.tx, nonce: '0xffff' } }
        },
      },
      Relay.feePayer({ account: feePayerAccount, validate: () => true }),
    ],
  })
  await expect(
    relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          feeToken: Tempo.addresses.alphaUsd,
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.addresses.alphaUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
        },
      ],
    }),
  ).rejects.toMatchObject({
    code: -32602,
    message: 'Sponsored transaction changed after validation.',
  })
})

test.each([0, 3])(
  'external sponsorship does not retry with request retryCount: %s',
  async (retryCount) => {
    const failures = [{ code: -32603, message: 'Temporarily unavailable' }]
    const server = await createHttpServer((request, response) => {
      request.resume()
      response.setHeader('Content-Type', 'application/json')
      response.end(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: failures.shift() ?? {
            code: -32602,
            message: 'Repeated request',
          },
        }),
      )
    })
    try {
      const relay = Relay.create({
        client: caller,
        plugins: [
          Relay.feePayer({
            allowedFeePayers: [server.url],
            internal_allowUnsafeUrls: true,
          }),
        ],
      })
      await expect(
        relay.request(
          {
            method: 'eth_fillTransaction',
            params: [
              {
                from: userAccount.address,
                feeToken: Tempo.addresses.alphaUsd,
                feePayer: server.url,
              },
            ],
          },
          { retryCount, retryDelay: 0 },
        ),
      ).rejects.toMatchObject({
        code: -32603,
        message: 'Temporarily unavailable',
      })
    } finally {
      await server.close()
    }
  },
)

test
  .skipIf(Tempo.nodeEnv !== 'localnet')
  .each(['sendTransaction', 'sendTransactionSync'] as const)(
  'plain HTTP transport: %s sponsors a sender without a fee-token balance',
  async (action) => {
    const relay = Relay.create({
      client: caller,
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          feeToken: Addresses.pathUsd,
        }),
      ],
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
      amount: 1n,
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

    const sponsorBalance = await Actions.token.getBalance(client, {
      account: feePayerAccount.address,
      token: Addresses.pathUsd,
    })

    const parameters = {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
    } as const

    const receipt =
      action === 'sendTransactionSync'
        ? await sendTransactionSync(client, parameters)
        : await waitForTransactionReceipt(client, {
            hash: await sendTransaction(client, parameters),
          })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
    expect(receipt.feeToken).toBe(Addresses.pathUsd)

    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token,
        })
      ).amount,
    ).toMatchInlineSnapshot(`0n`)

    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`1n`)

    expect(
      (
        await Actions.token.getBalance(client, {
          account: feePayerAccount.address,
          token: Addresses.pathUsd,
        })
      ).amount,
    ).toBeLessThan(sponsorBalance.amount)
  },
)

describe('raw sender verification', () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })

  test('rejects a sender placeholder its signature does not recover', async () => {
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })
    const envelope = TxEnvelopeTempo.deserialize(
      (await userAccount.signTransaction(
        transaction as never,
      )) as TxEnvelopeTempo.Serialized,
    )

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          TxEnvelopeTempo.serialize(envelope, {
            format: 'feePayer',
            sender: recipient.address,
          }),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction sender does not match its signature.]`,
    )

    const result = (await relay.request({
      method: 'eth_signRawTransaction',
      params: [
        TxEnvelopeTempo.serialize(envelope, {
          format: 'feePayer',
          sender: userAccount.address,
        }),
      ],
    })) as `0x76${string}`
    expect(Transaction.deserialize(result).from).toBe(
      userAccount.address.toLowerCase(),
    )
  })

  test('rejects a P256 signature that does not verify for its public key', async () => {
    const signer = Account.fromP256(P256.randomPrivateKey())
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })
    const envelope = TxEnvelopeTempo.deserialize(
      (await signer.signTransaction(
        transaction as never,
      )) as TxEnvelopeTempo.Serialized,
    )
    if (envelope.signature?.type !== 'p256')
      throw new Error('Expected a P256 signature.')
    const publicKey = P256.getPublicKey({ privateKey: P256.randomPrivateKey() })

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          TxEnvelopeTempo.serialize(envelope, {
            signature: { ...envelope.signature, publicKey },
          }),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction signature is invalid.]`,
    )
  })

  test('rejects an access key its sender has not authorized', async () => {
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: userAccount,
    })
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [await accessKey.signTransaction(transaction as never)],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction access key is not authorized for its sender.]`,
    )
  })

  test('rejects a legacy access key signature', async () => {
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: userAccount,
    })
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })
    const envelope = TxEnvelopeTempo.deserialize(
      (await accessKey.signTransaction(
        transaction as never,
      )) as TxEnvelopeTempo.Serialized,
    )
    if (envelope.signature?.type !== 'keychain')
      throw new Error('Expected an access key signature.')

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          TxEnvelopeTempo.serialize(envelope, {
            signature: { ...envelope.signature, version: 'v1' },
          }),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Legacy access key signatures are not supported.]`,
    )
  })

  test('rejects a same-transaction authorization another account signed', async () => {
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: userAccount,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      accessKey,
      account: recipient,
    })
    // Gas estimation rejects the foreign authorization, so attach it after preparation.
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          await accessKey.signTransaction({
            ...transaction,
            keyAuthorization,
          } as never),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction access key is not authorized for its sender.]`,
    )
  })

  test('rejects a same-transaction authorization for another chain', async () => {
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: userAccount,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      accessKey,
      account: userAccount,
      chainId: Tempo.chain.id + 1,
    })
    // Gas estimation rejects the foreign authorization, so attach it after preparation.
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          await accessKey.signTransaction({
            ...transaction,
            keyAuthorization,
          } as never),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction access key is not authorized for its sender.]`,
    )
  })

  test('rejects an expired same-transaction authorization', async () => {
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: userAccount,
    })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      accessKey,
      account: userAccount,
      expiry: Math.floor(Date.now() / 1000) - 60,
    })
    // Gas estimation rejects the expired authorization, so attach it after preparation.
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount.address,
      calls: [transfer],
      feePayer: true,
    })

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          await accessKey.signTransaction({
            ...transaction,
            keyAuthorization,
          } as never),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction access key is not authorized for its sender.]`,
    )
  })

  test('sponsors an access key authorized on chain', async () => {
    const root = Account.fromSecp256k1(generatePrivateKey())
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: root,
    })
    await Actions.faucet.fundSync(caller, { account: root, timeout: 60_000 })
    await Actions.accessKey.authorizeSync(
      Tempo.getClient({ account: root, chain: Tempo.chain }),
      { accessKey, feeToken: Tempo.addresses.alphaUsd },
    )
    const transaction = await prepareTransactionRequest(caller, {
      account: accessKey,
      calls: [transfer],
      feePayer: true,
    })

    const receipt = (await relay.request({
      method: 'eth_sendRawTransactionSync',
      params: [await accessKey.signTransaction(transaction as never)],
    })) as Record<string, unknown>

    const { feePayer, from, status } = receipt
    expect({ feePayer, from, status }).toEqual({
      feePayer: feePayerAccount.address.toLowerCase(),
      from: root.address.toLowerCase(),
      status: '0x1',
    })
  })

  test('sponsors an access key authorized in the same transaction', async () => {
    const root = Account.fromSecp256k1(generatePrivateKey())
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: root,
    })
    await Actions.faucet.fundSync(caller, { account: root, timeout: 60_000 })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      accessKey,
      account: root,
    })
    const transaction = await prepareTransactionRequest(caller, {
      account: accessKey,
      calls: [transfer],
      feePayer: true,
      keyAuthorization,
    })

    const receipt = (await relay.request({
      method: 'eth_sendRawTransactionSync',
      params: [await accessKey.signTransaction(transaction as never)],
    })) as Record<string, unknown>

    const { feePayer, from, status } = receipt
    expect({ feePayer, from, status }).toEqual({
      feePayer: feePayerAccount.address.toLowerCase(),
      from: root.address.toLowerCase(),
      status: '0x1',
    })
  })

  test('rejects a replayed same-transaction authorization', async () => {
    const root = Account.fromSecp256k1(generatePrivateKey())
    const accessKey = Account.fromSecp256k1(generatePrivateKey(), {
      access: root,
    })
    await Actions.faucet.fundSync(caller, { account: root, timeout: 60_000 })
    const keyAuthorization = await Actions.accessKey.signAuthorization(caller, {
      accessKey,
      account: root,
    })
    const transaction = await prepareTransactionRequest(caller, {
      account: accessKey,
      calls: [transfer],
      feePayer: true,
      keyAuthorization,
    })
    await relay.request({
      method: 'eth_sendRawTransactionSync',
      params: [await accessKey.signTransaction(transaction as never)],
    })
    // Gas estimation rejects the consumed authorization, so attach it after preparation.
    const replay = await prepareTransactionRequest(caller, {
      account: accessKey,
      calls: [transfer],
      feePayer: true,
    })

    await expect(
      relay.request({
        method: 'eth_signRawTransaction',
        params: [
          await accessKey.signTransaction({
            ...replay,
            keyAuthorization,
          } as never),
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction access key is not authorized for its sender.]`,
    )
  })
})

describe('raw canonical encoding', () => {
  const relay = Relay.create({
    client: caller,
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })

  test.each(['eth_signRawTransaction', 'eth_sendRawTransactionSync'])(
    'rejects a u64 field past the safe integer range: %s',
    async (method) => {
      const transaction = await prepareTransactionRequest(caller, {
        account: userAccount,
        calls: [transfer],
        feePayer: true,
      })
      const signed = reencode(
        await userAccount.signTransaction(transaction as never),
        {
          field: 'validBefore',
          fn: () => Hex.fromNumber(9_007_199_254_740_993n),
        },
      )

      await expect(
        relay.request({ method, params: [signed] }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.InvalidParamsError: Transaction encoding is not canonical. Re-encode it with in-range field values.]`,
      )
    },
  )

  test('rejects a non-canonical integer encoding', async () => {
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount,
      calls: [transfer],
      feePayer: true,
    })
    const signed = reencode(
      await userAccount.signTransaction(transaction as never),
      { field: 'gas', fn: (gas) => Hex.concat('0x00', gas) },
    )

    await expect(
      relay.request({ method: 'eth_sendRawTransactionSync', params: [signed] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Transaction encoding is not canonical. Re-encode it with in-range field values.]`,
    )
  })
})

test('raw sponsorship overrides an envelope fee token with the sponsor token', async () => {
  const relay = Relay.create({
    client: caller,
    plugins: [
      Relay.feePayer({
        account: feePayerAccount,
        feeToken: Tempo.addresses.alphaUsd,
      }),
    ],
  })
  const transaction = await prepareTransactionRequest(caller, {
    account: userAccount,
    calls: [transfer],
    feePayer: true,
  })
  // The sender's signature does not commit to the fee-payer format's token.
  const partial = TxEnvelopeTempo.serialize(
    {
      ...TxEnvelopeTempo.deserialize(
        (await userAccount.signTransaction(
          transaction as never,
        )) as TxEnvelopeTempo.Serialized,
      ),
      feeToken: Tempo.addresses.pathUsd,
    },
    { format: 'feePayer', sender: userAccount.address },
  )
  expect(Transaction.deserialize(partial).feeToken).toBe(
    Tempo.addresses.pathUsd,
  )

  const receipt = (await relay.request({
    method: 'eth_sendRawTransactionSync',
    params: [partial],
  })) as Record<string, unknown>

  const { feePayer, feeToken, status } = receipt
  expect({ feePayer, feeToken, status }).toEqual({
    feePayer: feePayerAccount.address.toLowerCase(),
    feeToken: Tempo.addresses.alphaUsd,
    status: '0x1',
  })
})

describe('fee token resolver', () => {
  const feeToken = ({ chainId }: { chainId: number }) =>
    chainId === Tempo.chain.id ? Tempo.addresses.alphaUsd : undefined

  test('resolves the sponsor token from the request chain', async () => {
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.pathUsd],
      plugins: [Relay.feePayer({ account: feePayerAccount, feeToken })],
    })

    const result = (await relay.request({
      method: 'eth_fillTransaction',
      params: [{ from: userAccount.address, calls: [transfer] }],
    })) as Request.Result

    expect(result.tx.feeToken).toBe(Tempo.addresses.alphaUsd)
  })

  test('validated fills retain the resolved fee token in the signed envelope', async () => {
    const events: Relay.feePayer.SponsoredEvent[] = []
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.pathUsd],
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          feeToken,
          onSponsored: (event) => {
            events.push(event)
          },
          validate: () => true,
        }),
      ],
    })

    const result = (await relay.request({
      method: 'eth_fillTransaction',
      params: [{ from: userAccount.address, calls: [transfer] }],
    })) as Request.Result

    expect(result.tx.feeToken).toBe(Tempo.addresses.alphaUsd)
    expect(
      events.map(({ feePayer, feeToken, method, sender, transaction }) => ({
        feePayer,
        feeToken,
        method,
        sender,
        transactionFeeToken: TxEnvelopeTempo.deserialize(
          transaction as TxEnvelopeTempo.Serialized,
        ).feeToken,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "feePayer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "feeToken": "0x20c0000000000000000000000000000000000001",
          "method": "eth_fillTransaction",
          "sender": "0x9ac4fDC8e5D72AaADE30F9Ff52D392D60c68A64a",
          "transactionFeeToken": "0x20c0000000000000000000000000000000000001",
        },
      ]
    `)
  })

  test('raw sponsor signing prefers the chain resolver', async () => {
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.pathUsd],
      plugins: [Relay.feePayer({ account: feePayerAccount, feeToken })],
    })
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount,
      calls: [transfer],
      feePayer: true,
    })

    const result = (await relay.request({
      method: 'eth_signRawTransaction',
      params: [await userAccount.signTransaction(transaction as never)],
    })) as `0x76${string}`

    expect(Transaction.deserialize(result).feeToken).toBe(
      Tempo.addresses.alphaUsd,
    )
  })

  test('an external fee payer chooses its own fee token', async () => {
    const requests: unknown[] = []
    const upstream = Relay.create({
      client: caller,
      plugins: [
        {
          async handleRequest(context, next) {
            if (context.request.method === 'eth_fillTransaction')
              requests.push(context.request.params?.[0])
            return next()
          },
        },
        Relay.feePayer({ account: feePayerAccount }),
      ],
    })
    const server = await createHttpServer(createRequestListener(upstream.fetch))
    onTestFinished(async () => {
      await server.close()
    })
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.alphaUsd],
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          allowedFeePayers: [server.url],
          feeToken: () => Tempo.addresses.pathUsd,
          internal_allowUnsafeUrls: true,
        }),
      ],
    })

    await relay.request({
      method: 'eth_fillTransaction',
      params: [
        { from: userAccount.address, calls: [transfer], feePayer: server.url },
      ],
    })

    expect(
      requests.map((request) => (request as { feeToken?: unknown }).feeToken),
    ).toEqual([Tempo.addresses.alphaUsd])
  })
})

describe('fee-payer signature validity', () => {
  // Prepared fills skip the node, so the relay's own bound check refuses them.
  const prepared = {
    calls: [transfer],
    chainId: Hex.fromNumber(Tempo.chain.id),
    from: userAccount.address,
    gas: '0x100000',
    maxFeePerGas: '0x4a817c800',
    nonce: '0x0',
    nonceKey: '0x1',
  }

  test.each([undefined, 7_200])(
    'refuses raw signing with validBefore offset: %s',
    async (offset) => {
      const relay = Relay.create({
        client: caller,
        plugins: [Relay.feePayer({ account: feePayerAccount })],
      })
      const transaction = await prepareTransactionRequest(caller, {
        account: userAccount,
        calls: [transfer],
        feePayer: true,
        nonceKey: 1n,
        ...(offset
          ? { validBefore: Math.floor(Date.now() / 1000) + offset }
          : {}),
      })

      await expect(
        relay.request({
          method: 'eth_signRawTransaction',
          params: [await userAccount.signTransaction(transaction as never)],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.InvalidParamsError: Sponsored transactions require a \`validBefore\` within 3600 seconds.]`,
      )
    },
  )

  test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'refuses validity: %s',
    (validity) => {
      expect(() =>
        Relay.feePayer({ account: feePayerAccount, validity }),
      ).toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.InvalidParamsError: Expected \`validity\` to be a positive integer number of seconds.]`,
      )
    },
  )

  test('bounds fills by the configured validity', async () => {
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.alphaUsd],
      plugins: [Relay.feePayer({ account: feePayerAccount, validity: 600 })],
    })
    const now = Math.floor(Date.now() / 1000)

    const result = (await relay.request({
      method: 'eth_fillTransaction',
      params: [
        { from: userAccount.address, calls: [transfer], nonceKey: '0x1' },
      ],
    })) as Request.Result
    const validBefore = Number(result.tx.validBefore)
    expect(validBefore).toBeGreaterThan(now)
    expect(validBefore).toBeLessThanOrEqual(now + 600 + 5)

    await expect(
      relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            from: userAccount.address,
            calls: [transfer],
            nonceKey: '0x1',
            validBefore: Hex.fromNumber(now + 1_200),
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Sponsored transactions require a \`validBefore\` within 600 seconds.]`,
    )
  })

  test.each(['', false, 0, '0x0'] as const)(
    'refuses fills whose validBefore cannot bound the signature: %j',
    async (validBefore) => {
      const relay = Relay.create({
        client: caller,
        resolveTokens: () => [Tempo.addresses.alphaUsd],
        plugins: [Relay.feePayer({ account: feePayerAccount })],
      })

      await expect(
        relay.request({
          method: 'eth_fillTransaction',
          params: [{ ...prepared, validBefore }],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[RpcResponse.InvalidParamsError: Sponsored transactions require a \`validBefore\` within 3600 seconds.]`,
      )
    },
  )

  test('identical fill retries share one sign payload', async () => {
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.alphaUsd],
      plugins: [Relay.feePayer({ account: feePayerAccount })],
    })
    const request = {
      method: 'eth_fillTransaction',
      params: [
        { from: userAccount.address, calls: [transfer], nonceKey: '0x1' },
      ],
    } as const

    const first = (await relay.request(request)) as Request.Result
    const second = (await relay.request(request)) as Request.Result

    expect(Number(first.tx.validBefore) % 300).toBe(0)
    expect(second.tx).toEqual(first.tx)
  })

  test('refuses fills whose validAfter is at or past the generated validBefore', async () => {
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.addresses.alphaUsd],
      plugins: [Relay.feePayer({ account: feePayerAccount })],
    })

    await expect(
      relay.request({
        method: 'eth_fillTransaction',
        params: [
          {
            ...prepared,
            validAfter: Hex.fromNumber(
              Math.floor(Date.now() / 1000) + 3_600 + 300,
            ),
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.InvalidParamsError: Sponsored transactions require a \`validBefore\` within 3600 seconds.]`,
    )
  })
})

describe('rejected broadcasts', () => {
  test('a base-fee floor rejection reports the sponsorship', async () => {
    const rejected: Relay.feePayer.SponsoredEvent[] = []
    const relay = Relay.create({
      client: caller,
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          onRejected: (event) => {
            rejected.push(event)
          },
        }),
      ],
    })
    const transaction = await prepareTransactionRequest(caller, {
      account: userAccount,
      calls: [transfer],
      feePayer: true,
      feeToken: Tempo.addresses.alphaUsd,
      gas: 1_000_000n,
      maxFeePerGas: 1n,
      maxPriorityFeePerGas: 0n,
    })

    await expect(
      relay.request({
        method: 'eth_sendRawTransaction',
        params: [await userAccount.signTransaction(transaction as never)],
      }),
    ).rejects.toThrow(
      /^(gas price is less than basefee|fee cap less than base fee: max_fee_per_gas 1, base_fee [1-9]\d*)$/,
    )

    expect(
      rejected.map(({ chainId, feePayer, method, sender }) => ({
        chainId,
        feePayer,
        method,
        sender,
      })),
    ).toMatchInlineSnapshot(`
      [
        {
          "chainId": 1337,
          "feePayer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "method": "eth_sendRawTransaction",
          "sender": "0x9ac4fdc8e5d72aaade30f9ff52d392d60c68a64a",
        },
      ]
    `)
  })

  test.each([
    { response: undefined, maxFeePerGas: 1n },
    {
      response: { code: -32000, message: 'transaction underpriced' },
      maxFeePerGas: 1n,
    },
    {
      response: { code: -32000, message: 'gas price is less than basefee' },
      maxFeePerGas: 600_000_000n,
    },
    {
      response: { code: -32000, message: 'gas price is less than basefee' },
      maxFeePerGas: 1n,
      minimumBaseFee: 1n,
    },
    {
      response: {
        code: -32000,
        message:
          'fee cap less than base fee: max_fee_per_gas 600000000, base_fee 1200000000',
      },
      maxFeePerGas: 600_000_000n,
    },
    {
      response: {
        code: -32000,
        message:
          'fee cap less than base fee: max_fee_per_gas 1, base_fee 600000000',
      },
      maxFeePerGas: 1n,
      minimumBaseFee: 1n,
    },
    {
      response: {
        code: -32603,
        message:
          'fee cap less than base fee: max_fee_per_gas 1, base_fee 600000000',
      },
      maxFeePerGas: 1n,
    },
  ])(
    'ambiguous broadcast failures stay unreported: $response.message',
    async ({ response, maxFeePerGas, minimumBaseFee }) => {
      const server = await createHttpServer((request, res) => {
        request.resume()
        if (!response) {
          res.destroy()
          return
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ jsonrpc: '2.0', id: 0, error: response }))
      })
      onTestFinished(async () => {
        await server.close()
      })
      const rejected: Relay.feePayer.SponsoredEvent[] = []
      const relay = Relay.create({
        client: createClient({
          chain: Tempo.chain,
          transport: http(server.url, { retryCount: 0 }),
        }),
        resolveTokens: () => [Tempo.addresses.alphaUsd],
        plugins: [
          Relay.feePayer({
            account: feePayerAccount,
            minimumBaseFee,
            onRejected: (event) => {
              rejected.push(event)
            },
          }),
        ],
      })
      const transaction = await prepareTransactionRequest(caller, {
        account: userAccount,
        calls: [transfer],
        feePayer: true,
        feeToken: Tempo.addresses.alphaUsd,
        gas: 1_000_000n,
        maxFeePerGas,
        maxPriorityFeePerGas: 0n,
      })

      await expect(
        relay.request({
          method: 'eth_sendRawTransaction',
          params: [await userAccount.signTransaction(transaction as never)],
        }),
      ).rejects.toThrow()

      expect(rejected).toEqual([])
    },
  )
})

/** Positions of Tempo envelope RLP fields rewritten by fixtures. */
const fields = { gas: 3, validBefore: 8 } as const

/** Returns a serialized Tempo envelope with one top-level RLP field rewritten, keeping its original signature. */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
function reencode(serialized: Hex.Hex, options: reencode.Options) {
  const { field, fn } = options
  const items = [...(Rlp.toHex(Hex.slice(serialized, 1)) as readonly Hex.Hex[])]
  items[fields[field]] = fn(items[fields[field]]!)
  return Hex.concat(Hex.slice(serialized, 0, 1), Rlp.fromHex(items))
}

declare namespace reencode {
  type Options = {
    /** Envelope field to rewrite. */
    field: keyof typeof fields
    /** Returns the replacement RLP item for the field's encoded value. */
    fn: (value: Hex.Hex) => Hex.Hex
  }
}
