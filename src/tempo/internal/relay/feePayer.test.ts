import type { Capabilities as TempoCapabilities_ } from 'viem/tempo'
import { http as tempoHttp_ } from 'viem/tempo'
import { Client as CoreClient_ } from 'viem'
import { randomPrivateKey as generatePrivateKey } from 'ox/Secp256k1'
import { Actions as CoreActions_ } from 'viem'
import * as Transaction from 'ox/tempo/TxEnvelopeTempo'
import { tempoLocalnet as chain_ } from 'viem/chains'
import { Account as TempoAccount_ } from 'viem/tempo'
import { withResolvers } from '../../../core/internal/promise.js'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Secp256k1 } from 'ox'
import { SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { http } from 'viem'

import { Account, Actions, Addresses, Relay, withRelay } from 'viem/tempo'
import { beforeAll, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo.js'
import { createServer as createHttpServer } from '~test/http.js'
import type * as Request from './request.js'
import * as Utils from './utils.js'

const userAccount = TempoAccount_.fromSecp256k1(Tempo.accounts[9]!.privateKey)
const feePayerAccount = TempoAccount_.fromSecp256k1(
  Tempo.accounts[0]!.privateKey,
)
const recipient = TempoAccount_.fromSecp256k1(Tempo.accounts[7]!.privateKey)

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
  await CoreActions_.contract.writeSync(caller, {
    ...Actions.fee.setUserToken.call({ token: Tempo.alphaUsd }),
    account: userAccount,
  })
})

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
        ...(selection === 'configured' ? { feeToken: Tempo.alphaUsd } : {}),
      }),
      Relay.feeToken(),
    ]
    const relay = Relay.create({
      client: caller,
      resolveTokens: () => [Tempo.pathUsd],
      plugins: feeTokenFirst ? [...plugins].reverse() : plugins,
    })
    const result = (await relay.request({
      method: 'eth_fillTransaction',
      params: [
        {
          from: userAccount.address,
          ...(selection === 'requested' ? { feeToken: Tempo.alphaUsd } : {}),
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.alphaUsd,
              to: recipient.address,
              amount: 1n,
            }),
          ],
        },
      ],
    })) as Relay.Plugin.FillResult
    const transaction = Utils.normalizeTempoTransaction(result.tx)
    expect(transaction.feeToken?.toLowerCase()).toBe(
      Tempo.alphaUsd.toLowerCase(),
    )
    const receipt = await CoreActions_.transaction.sendRawSync(caller, {
      transaction: await userAccount.signTransaction(transaction as never),
    })
    expect(receipt.status).toBe('success')
    expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
  },
)

test.each([true, false])('sponsorship accepted: %s', async (accepted) => {
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [
        Relay.feePayer({
          account: feePayerAccount,
          validate: () => accepted,
        }),
      ],
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
      feeToken: Tempo.alphaUsd,
    },
  )
  expect(
    (capabilities as TempoCapabilities_.FillTransactionCapabilities | undefined)
      ?.sponsored,
  ).toBe(accepted)
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
  const receipt = await CoreActions_.transaction.sendRawSync(client, {
    transaction: signed,
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(
    (accepted ? feePayerAccount : userAccount).address.toLowerCase(),
  )
})

test('raw sponsorship resolves chain from the signed envelope', async () => {
  const { request } = await CoreActions_.transaction.prepare(
    Tempo.getClient({}),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    getClient: ({ chainId }) =>
      CoreClient_.create({
        chain: { ...chain_, id: chainId },
        transport: tempoHttp_(Tempo.rpcUrl),
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
    getClient: () => Tempo.getClient({}),
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
              token: Tempo.alphaUsd,
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
  const { request } = await CoreActions_.transaction.prepare(
    Tempo.getClient({}),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    client: Tempo.getClient({}),
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
  const { request } = await CoreActions_.transaction.prepare(
    Tempo.getClient({}),
    {
      account: userAccount,
      calls: [
        Actions.token.transfer.call(caller, {
          token: Tempo.alphaUsd,
          to: recipient.address,
          amount: 1n,
        }),
      ],
      feePayer: true,
      feeToken: Tempo.alphaUsd,
    },
  )
  const signed = await userAccount.signTransaction(request as never)
  const relay = Relay.create({
    client: Tempo.getClient({}),
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
    token: Tempo.alphaUsd,
  })
  await expect(
    relay.request({ method: 'eth_sendRawTransactionSync', params: [signed] }),
  ).rejects.toMatchObject({ code: -32603 })
  expect(
    await Actions.token.getBalance(caller, {
      account: recipient.address,
      token: Tempo.alphaUsd,
    }),
  ).toEqual(before)
})

test('a rejected prepared fill can be signed and sent without sponsorship', async () => {
  const { request: prepared } = await CoreActions_.transaction.prepare(caller, {
    account: userAccount,
    type: 'tempo',
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
    feePayer: true,
    gas: 1_000_000n,
    feeToken: Tempo.alphaUsd,
  })
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      resolveTokens: () => [Tempo.alphaUsd],

      plugins: [
        Relay.feePayer({ account: feePayerAccount, validate: () => false }),
        Relay.feeToken(),
      ],
    }),
  })
  const { transaction, capabilities } = await CoreActions_.transaction.fill(
    client,
    {
      ...prepared,
      chain: chain_,
    },
  )
  expect(transaction.nonceKey).toBe(
    (prepared as typeof prepared & { nonceKey?: bigint }).nonceKey,
  )
  expect(
    (capabilities as TempoCapabilities_.FillTransactionCapabilities | undefined)
      ?.sponsored,
  ).toBe(false)
  expect(transaction.feePayerSignature).toBeUndefined()
  expect(transaction).not.toMatchObject({ feePayer: true })
  const envelope = TxEnvelopeTempo.deserialize(
    (await Transaction.serialize(transaction as never)) as `0x76${string}`,
  )
  const signature = await userAccount.sign({
    hash: TxEnvelopeTempo.getSignPayload(envelope),
  })
  const receipt = await CoreActions_.transaction.sendRawSync(client, {
    transaction: TxEnvelopeTempo.serialize(envelope, {
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
      const client = CoreClient_.create({
        chain: chain_,
        transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
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
            token: Tempo.alphaUsd,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feeToken: Tempo.alphaUsd,
      } as const
      const { transaction, capabilities } = await CoreActions_.transaction.fill(
        client,
        {
          ...(prepared
            ? (
                await CoreActions_.transaction.prepare(caller, {
                  ...parameters,
                  type: 'tempo',
                  feePayer: true,
                  gas: 1_000_000n,
                })
              ).request
            : parameters),
          chain: chain_,
          feeToken: Tempo.alphaUsd,
          feePayer: server.url,
        },
      )
      expect(transaction.feePayerSignature).toBeDefined()
      expect(
        (
          capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsored,
      ).toBe(true)
      expect(
        (
          capabilities as
            | TempoCapabilities_.FillTransactionCapabilities
            | undefined
        )?.sponsor,
      ).toBeUndefined()
      const receipt = await CoreActions_.transaction.sendRawSync(caller, {
        transaction: await userAccount.signTransaction(transaction as never),
      })
      expect(receipt.status).toBe('success')
      expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
    } finally {
      await server.close()
    }
  },
)

test('cancelling a fill closes the external fee-payer request', async () => {
  const started = withResolvers<void>()
  const closed = withResolvers<void>()
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
            feeToken: Tempo.alphaUsd,
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
      resolveTokens: () => [Tempo.alphaUsd],

      client: caller,
      plugins: [
        Relay.simulate(),
        Relay.feePayer({
          account: feePayerAccount,
          [hook]: async () => {
            await Actions.token.getBalance(caller, {
              account: userAccount.address,
              token: Tempo.alphaUsd,
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
  const { request: prepared } = await CoreActions_.transaction.prepare(caller, {
    account: userAccount,
    feeToken: Tempo.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
        to: recipient.address,
        amount: 1n,
      }),
    ],
  })
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [Relay.feePayer({ account: feePayerAccount })],
    }),
  })
  const { transaction } = await CoreActions_.transaction.fill(client, {
    ...prepared,
    chain: chain_,
  })
  const receipt = await CoreActions_.transaction.sendRawSync(caller, {
    transaction: await userAccount.signTransaction(transaction as never),
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
})

test('replaces an untrusted fee-payer signature and applies sponsorship recording', async () => {
  const { request: prepared } = await CoreActions_.transaction.prepare(caller, {
    account: userAccount,
    feePayer: true,
    feeToken: Tempo.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
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
  const receipt = await CoreActions_.transaction.sendRawSync(caller, {
    transaction: await userAccount.signTransaction(transaction as never),
  })
  expect(receipt.status).toBe('success')
  expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
})

test('preserves the synchronous broadcast timeout after signing', async () => {
  const { request: prepared } = await CoreActions_.transaction.prepare(caller, {
    account: userAccount,
    feePayer: true,
    feeToken: Tempo.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
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
    params: [
      await CoreActions_.transaction.sign(caller, {
        ...prepared,
        account: userAccount,
      }),
      5000,
    ],
  })
  expect(receipt).toMatchObject({ status: '0x1' })
})

test('does not sign a cached sponsored fill that skipped validation', async () => {
  const { transaction } = await CoreActions_.transaction.fill(caller, {
    account: userAccount,
    feeToken: Tempo.alphaUsd,
    calls: [
      Actions.token.transfer.call(caller, {
        token: Tempo.alphaUsd,
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
          feeToken: Tempo.alphaUsd,
          calls: [
            Actions.token.transfer.call(caller, {
              token: Tempo.alphaUsd,
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
                feeToken: Tempo.alphaUsd,
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
  .skipIf('localnet' !== 'localnet')
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
      transport: http(server.url),
    })

    const account = Account.fromSecp256k1(generatePrivateKey())
    const token = Tempo.alphaUsd

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
        ? await CoreActions_.transaction.sendSync(client, parameters)
        : await CoreActions_.transaction.waitForReceipt(client, {
            hash: await CoreActions_.transaction.send(client, parameters),
          }).receipt

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

test('transferSync uses an external sponsor through withRelay', async () => {
  const upstream = Relay.create({
    client: caller,
    plugins: [Relay.feePayer({ account: feePayerAccount })],
  })
  const server = await createHttpServer(createRequestListener(upstream.fetch))
  onTestFinished(async () => {
    await server.close()
  })
  const client = CoreClient_.create({
    chain: chain_,
    transport: withRelay(tempoHttp_(Tempo.rpcUrl), {
      plugins: [
        Relay.feePayer({
          allowedFeePayers: [server.url],
          internal_allowUnsafeUrls: true,
        }),
      ],
    }),
  })

  const { receipt } = await Actions.token.transferSync(client, {
    account: userAccount,
    token: Tempo.alphaUsd,
    to: recipient.address,
    amount: 1n,
    feeToken: Tempo.alphaUsd,
    feePayer: server.url,
  })

  expect(receipt).toMatchObject({
    status: 'success',
    feePayer: feePayerAccount.address.toLowerCase(),
  })
})
