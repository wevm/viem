import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { FundingPolicy, KeyAuthorization } from 'ox/tempo'
import { createClient, http } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Addresses, tempoActions } from 'viem/tempo'
import { expect, test } from 'vitest'
import { authorize } from './accessKey.js'

const owner = Account.fromSecp256k1(
  '0x0000000000000000000000000000000000000000000000000000000000000001',
)
const key = Account.fromP256(
  '0x0000000000000000000000000000000000000000000000000000000000000002',
  { access: owner },
)
const expiry = 2_000_000_000

// This wallet endpoint signs real grants and records the JSON-RPC wire parameters.
async function serve({ supported = true } = {}) {
  const requests: { method: string; params: Record<string, unknown>[] }[] = []
  const server = createServer(async (req, res) => {
    let body = ''
    for await (const chunk of req) body += chunk
    const request = JSON.parse(body)
    requests.push(request)
    res.setHeader('Content-Type', 'application/json')
    if (!supported || request.method !== 'wallet_authorizeAccessKey') {
      res.end(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          error: { code: -32601, message: 'Method not found' },
        }),
      )
      return
    }
    const options = request.params[0]
    if (options.expiry === 0) {
      res.end(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          error: { code: 4001, message: 'User rejected authorization' },
        }),
      )
      return
    }
    const keyAuthorization = await owner.signKeyAuthorization(
      options.address
        ? { address: options.address, type: options.keyType }
        : key,
      {
        chainId: BigInt(options.chainId ?? tempoLocalnet.id),
        expiry: options.expiry,
        limits: options.limits?.map(
          (limit: {
            token: `0x${string}`
            limit: string
            period?: number
          }) => ({ ...limit, limit: BigInt(limit.limit) }),
        ),
        scopes: options.scopes,
        fundingPolicy:
          options.fundingPolicy === true
            ? 1n
            : options.fundingPolicy !== undefined
              ? FundingPolicy.fromRpc(options.fundingPolicy)
              : undefined,
      },
    )
    res.end(
      JSON.stringify({
        id: request.id,
        jsonrpc: '2.0',
        result: {
          rootAddress: owner.address,
          keyAuthorization: KeyAuthorization.toRpc(keyAuthorization),
        },
      }),
    )
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  return {
    requests,
    client: createClient({
      account: owner.address,
      chain: tempoLocalnet,
      transport: http(`http://127.0.0.1:${port}`),
    }).extend(tempoActions()),
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  }
}

test('authorize: wallet-managed key and wire encoding', async () => {
  const wallet = await serve()
  try {
    const result = await wallet.client.accessKey.authorize({
      expiry,
      fundingPolicy: true,
      limits: [
        { token: Addresses.pathUsd, limit: 1_000_000_000n, period: 3600 },
      ],
      scopes: [{ address: Addresses.pathUsd, selector: '0xa9059cbb' }],
    })
    expect(wallet.requests).toMatchObject([
      {
        method: 'wallet_authorizeAccessKey',
        params: [
          {
            chainId: '0x539',
            expiry,
            fundingPolicy: true,
            limits: [
              { token: Addresses.pathUsd, limit: '0x3b9aca00', period: 3600 },
            ],
            scopes: [{ address: Addresses.pathUsd, selector: '0xa9059cbb' }],
          },
        ],
      },
    ])
    expect(wallet.requests[0]!.params[0]).not.toHaveProperty('keyType')
    expect(wallet.requests[0]!.params[0]).not.toHaveProperty('address')
    expect(result.rootAddress).toBe(owner.address)
    expect(result.keyAuthorization).toMatchObject({
      address: key.accessKeyAddress,
      type: 'p256',
      chainId: 1337n,
      expiry,
      fundingPolicy: 1n,
      limits: [
        { token: Addresses.pathUsd, limit: 1_000_000_000n, period: 3600 },
      ],
    })
    expect(result.keyAuthorization.signature.type).toBe('secp256k1')
  } finally {
    await wallet.close()
  }
})

test('authorize: external key, policy ID, and chain override', async () => {
  const wallet = await serve()
  try {
    const result = await authorize(wallet.client, {
      accessKey: key,
      expiry,
      chainId: 42431,
      fundingPolicy: 9n,
    })
    expect(wallet.requests[0]!.params).toEqual([
      {
        address: key.accessKeyAddress,
        keyType: 'p256',
        chainId: '0xa5bf',
        expiry,
        fundingPolicy: '0x9',
      },
    ])
    expect(result.keyAuthorization.chainId).toBe(42431n)
    expect(result.keyAuthorization.fundingPolicy).toBe(9n)
  } finally {
    await wallet.close()
  }
})

test('authorize: rejects a different root account', async () => {
  const wallet = await serve()
  try {
    await expect(
      authorize(wallet.client, { account: key.accessKeyAddress, expiry }),
    ).rejects.toThrow('different account')
    expect(wallet.requests).toHaveLength(1)
  } finally {
    await wallet.close()
  }
})

test('authorize: propagates wallet rejection without retrying or sending a transaction', async () => {
  const wallet = await serve()
  try {
    await expect(authorize(wallet.client, { expiry: 0 })).rejects.toThrow(
      'User rejected',
    )
    expect(wallet.requests).toHaveLength(1)
    expect(wallet.requests[0]!.method).toBe('wallet_authorizeAccessKey')
  } finally {
    await wallet.close()
  }
})

test('authorize: inline policy, explicit generated key type, and empty restrictions', async () => {
  const wallet = await serve()
  const policy = {
    admins: [owner.address],
    rules: { maxSlippageBps: 0, sources: { [Addresses.pathUsd]: [] } },
  }
  try {
    const result = await authorize(wallet.client, {
      expiry,
      keyType: 'p256',
      fundingPolicy: policy,
      limits: [],
      scopes: [],
    })
    expect(wallet.requests[0]!.params[0]).toEqual({
      chainId: '0x539',
      expiry,
      keyType: 'p256',
      fundingPolicy: policy,
      limits: [],
      scopes: [],
    })
    expect(result.keyAuthorization.fundingPolicy).toEqual(policy)
    expect(result.keyAuthorization.limits).toEqual([])
  } finally {
    await wallet.close()
  }
})

test('authorize: unsupported wallet RPC does not fall back to submitting a transaction', async () => {
  const wallet = await serve({ supported: false })
  try {
    await expect(authorize(wallet.client, { expiry })).rejects.toThrow(
      'does not exist / is not available',
    )
    expect(wallet.requests).toHaveLength(1)
    expect(wallet.requests[0]!.method).toBe('wallet_authorizeAccessKey')
  } finally {
    await wallet.close()
  }
})
