import { Address, Secp256k1, type TransactionRequest } from 'ox'
import { TxEnvelopeTempo } from 'ox/tempo'
import { tempoLocalnet } from 'viem/chains'
import { Client, http, withRelay } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { createServer } from '~test/http.js'

const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const feePayerKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const sender = Address.fromPublicKey(
  Secp256k1.getPublicKey({ privateKey: senderKey }),
)

// Sponsored envelope pending a fee payer signature (TIP-76).
const envelope = TxEnvelopeTempo.from({
  calls: [{ to: '0x0000000000000000000000000000000000000000', value: 0n }],
  chainId: tempoLocalnet.id,
  feePayerSignature: null,
  gas: 100_000n,
  maxFeePerGas: 1_000_000_000n,
  nonce: 1n,
})
const signature = Secp256k1.sign({
  payload: TxEnvelopeTempo.getSignPayload(envelope),
  privateKey: senderKey,
})

// Fee payer handoff format (`0x78`): what the sign hook broadcasts for
// sponsored requests.
const sponsoredHandoff = TxEnvelopeTempo.serialize(envelope, {
  format: 'feePayer',
  signature,
})
// Pending marker form (`0x76` + `feePayerSignature: null`): what non-viem
// clients (e.g. alloy) broadcast.
const sponsoredMarker = TxEnvelopeTempo.serialize(envelope, { signature })

// The relay's co-signed result.
const cosigned = TxEnvelopeTempo.serialize(
  {
    ...envelope,
    feePayerSignature: Secp256k1.sign({
      payload: TxEnvelopeTempo.getFeePayerSignPayload(envelope, { sender }),
      privateKey: feePayerKey,
    }),
  },
  { signature },
)

// Non-sponsored envelope (no fee payer involvement).
const plain = (() => {
  const envelope = TxEnvelopeTempo.from({
    calls: [{ to: '0x0000000000000000000000000000000000000000', value: 0n }],
    chainId: tempoLocalnet.id,
    gas: 100_000n,
    maxFeePerGas: 1_000_000_000n,
    nonce: 1n,
  })
  return TxEnvelopeTempo.serialize(envelope, {
    signature: Secp256k1.sign({
      payload: TxEnvelopeTempo.getSignPayload(envelope),
      privateKey: senderKey,
    }),
  })
})()

/** Boots a recording JSON-RPC server; results resolve per method. */
async function createRpcServer(
  results: Record<string, (params: readonly unknown[] | undefined) => unknown>,
) {
  const requests: { method: string; params?: unknown }[] = []
  const server = await createServer((req, res) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      requests.push({ method: request.method, params: request.params })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          result: results[request.method]?.(request.params) ?? null,
        }),
      )
    })
  })
  return { ...server, requests }
}

function getClient(options: {
  defaultUrl: string
  policy?: 'sign-only' | 'sign-and-broadcast' | undefined
  relayUrl: string
}) {
  return Client.create({
    chain: tempoLocalnet,
    transport: withRelay(
      http(options.defaultUrl),
      http(options.relayUrl),
      options.policy ? { policy: options.policy } : {},
    ),
  })
}

test('forwards non-send methods to the default transport', async () => {
  const relay = await createRpcServer({})
  const node = await createRpcServer({ eth_blockNumber: () => '0x1' })
  try {
    const client = getClient({ defaultUrl: node.url, relayUrl: relay.url })

    const blockNumber = await client.request({ method: 'eth_blockNumber' })

    expect(blockNumber).toBe('0x1')
    expect(node.requests).toEqual([
      { method: 'eth_blockNumber', params: undefined },
    ])
    expect(relay.requests).toEqual([])
  } finally {
    await Promise.all([relay.close(), node.close()])
  }
})

test('routes eth_fillTransaction to the relay, preserving `feePayer`', async () => {
  const relay = await createRpcServer({
    eth_fillTransaction: (params) => ({ tx: params?.[0] }),
  })
  const node = await createRpcServer({})
  try {
    const client = getClient({ defaultUrl: node.url, relayUrl: relay.url })

    // `feePayer: true`, omitted, and explicit values all pass through as-is.
    type FillRequest = TransactionRequest.Rpc & {
      feePayer?: Address.Address | boolean | null | undefined
    }
    const requests: readonly FillRequest[] = [
      { feePayer: true, to: sender },
      { to: sender },
      { feePayer: null, to: sender },
      { feePayer: sender, to: sender },
    ]
    for (const request of requests)
      await client.request({
        method: 'eth_fillTransaction',
        params: [request],
      })

    expect(node.requests).toEqual([])
    expect(relay.requests.map((request) => request.params)).toEqual([
      [{ feePayer: true, to: sender }],
      [{ to: sender }],
      [{ feePayer: null, to: sender }],
      [{ feePayer: sender, to: sender }],
    ])
  } finally {
    await Promise.all([relay.close(), node.close()])
  }
})

describe('policy: sign-only (default)', () => {
  test.each(['eth_sendRawTransaction', 'eth_sendRawTransactionSync'] as const)(
    'sponsored %s: relay co-signs, default broadcasts',
    async (method) => {
      const relay = await createRpcServer({
        eth_signRawTransaction: () => cosigned,
      })
      const node = await createRpcServer({ [method]: () => '0xhash' })
      try {
        const client = getClient({ defaultUrl: node.url, relayUrl: relay.url })

        const result = await client.request({
          method,
          params: [sponsoredHandoff],
        })

        expect(result).toBe('0xhash')
        expect(relay.requests).toEqual([
          { method: 'eth_signRawTransaction', params: [sponsoredHandoff] },
        ])
        expect(node.requests).toEqual([{ method, params: [cosigned] }])
      } finally {
        await Promise.all([relay.close(), node.close()])
      }
    },
  )

  test('pending marker form is re-encoded into the handoff format', async () => {
    const relay = await createRpcServer({
      eth_signRawTransaction: () => cosigned,
    })
    const node = await createRpcServer({
      eth_sendRawTransaction: () => '0xhash',
    })
    try {
      const client = getClient({ defaultUrl: node.url, relayUrl: relay.url })

      await client.request({
        method: 'eth_sendRawTransaction',
        params: [sponsoredMarker],
      })

      expect(relay.requests).toEqual([
        { method: 'eth_signRawTransaction', params: [sponsoredHandoff] },
      ])
      expect(node.requests).toEqual([
        { method: 'eth_sendRawTransaction', params: [cosigned] },
      ])
    } finally {
      await Promise.all([relay.close(), node.close()])
    }
  })

  test('non-sponsored transaction uses the default transport', async () => {
    const relay = await createRpcServer({})
    const node = await createRpcServer({
      eth_sendRawTransaction: () => '0xhash',
    })
    try {
      const client = getClient({ defaultUrl: node.url, relayUrl: relay.url })

      const result = await client.request({
        method: 'eth_sendRawTransaction',
        params: [plain],
      })

      expect(result).toBe('0xhash')
      expect(relay.requests).toEqual([])
      expect(node.requests).toEqual([
        { method: 'eth_sendRawTransaction', params: [plain] },
      ])
    } finally {
      await Promise.all([relay.close(), node.close()])
    }
  })

  test('malformed payloads fall through to the default transport', async () => {
    const relay = await createRpcServer({})
    const node = await createRpcServer({
      eth_sendRawTransaction: () => '0xhash',
    })
    try {
      const client = getClient({ defaultUrl: node.url, relayUrl: relay.url })

      await client.request({
        method: 'eth_sendRawTransaction',
        params: ['0x76deadbeef'],
      })

      expect(relay.requests).toEqual([])
      expect(node.requests).toEqual([
        { method: 'eth_sendRawTransaction', params: ['0x76deadbeef'] },
      ])
    } finally {
      await Promise.all([relay.close(), node.close()])
    }
  })
})

describe('policy: sign-and-broadcast', () => {
  test.each(['eth_sendRawTransaction', 'eth_sendRawTransactionSync'] as const)(
    'sponsored %s: relay handles the submission',
    async (method) => {
      const relay = await createRpcServer({ [method]: () => '0xhash' })
      const node = await createRpcServer({})
      try {
        const client = getClient({
          defaultUrl: node.url,
          policy: 'sign-and-broadcast',
          relayUrl: relay.url,
        })

        const result = await client.request({
          method,
          params: [sponsoredHandoff],
        })

        expect(result).toBe('0xhash')
        expect(relay.requests).toEqual([{ method, params: [sponsoredHandoff] }])
        expect(node.requests).toEqual([])
      } finally {
        await Promise.all([relay.close(), node.close()])
      }
    },
  )
})
