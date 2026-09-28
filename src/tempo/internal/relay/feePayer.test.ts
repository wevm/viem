import { createRequestListener } from '@remix-run/node-fetch-server'
import { Secp256k1 } from 'ox'
import { SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { createClient } from 'viem'
import {
  fillTransaction,
  prepareTransactionRequest,
  sendRawTransactionSync,
} from 'viem/actions'
import { Actions, Relay, Transaction, withRelay } from 'viem/tempo'
import { beforeAll, expect, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'
import type * as Request from './request.js'
import * as Utils from './utils.js'

const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

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
  await Actions.fee.setUserTokenSync(caller, {
    account: userAccount,
    token: Tempo.addresses.alphaUsd,
  })
})

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
      plugins: [
        Relay.feePayer({ account: feePayerAccount, validate: () => false }),
        Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
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
        (next) => async (request, options) => {
          const result = await next(request, options)
          if (request.method !== 'eth_fillTransaction') return result
          const { sponsor: _, capabilities, ...rest } = result as Request.Result
          const { sponsor: __, ...metadata } = capabilities ?? {}
          return { ...rest, capabilities: metadata }
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
        Relay.feeToken({ resolveTokens: () => [Tempo.addresses.alphaUsd] }),
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
      (next) => (request, options) => {
        if (
          request.method === 'eth_sendRawTransactionSync' &&
          request.params?.[1] !== 5000
        )
          throw new Error('Expected the requested broadcast timeout')
        return next(request, options)
      },
    ],
  })
  const receipt = await relay.request({
    method: 'eth_sendRawTransactionSync',
    params: [await userAccount.signTransaction(prepared as never), 5000],
  })
  expect(receipt).toMatchObject({ status: '0x1' })
})
