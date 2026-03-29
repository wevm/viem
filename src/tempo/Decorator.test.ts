import {
  createClient,
  createWalletClient,
  custom,
  defineChain,
  http,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { tempoLocalnet, tempoModerato } from 'viem/chains'
import { tempoActions, ZoneNotConfiguredError } from 'viem/tempo'
import { describe, expect, test, vi } from 'vitest'
import { createHttpServer } from '~test/utils.js'
import type { GetZoneInfoRpcReturnType } from './actions/zone.js'
import * as Secp256k1 from './Secp256k1.js'

function createAccount() {
  return privateKeyToAccount(Secp256k1.randomPrivateKey())
}

describe('decorator', () => {
  const client2 = createClient({
    chain: tempoLocalnet,
    transport: http(),
  }).extend(tempoActions())

  test('default', async () => {
    expect(Object.keys(client2)).toMatchInlineSnapshot(`
      [
        "account",
        "batch",
        "cacheTime",
        "ccipRead",
        "chain",
        "dataSuffix",
        "key",
        "name",
        "pollingInterval",
        "request",
        "transport",
        "type",
        "uid",
        "extend",
        "accessKey",
        "amm",
        "dex",
        "faucet",
        "nonce",
        "fee",
        "policy",
        "reward",
        "token",
        "validator",
      ]
    `)
  })

  test('exposes getZoneClient on wallet-capable Tempo clients with zones', () => {
    const client = createWalletClient({
      account: createAccount(),
      chain: tempoModerato,
      transport: http(),
    }).extend(tempoActions())

    expect('getZoneClient' in client).toBe(true)

    const zoneClient = client.getZoneClient({ zone: 26 })
    expect(zoneClient.chain.id).toBe(4217000026)
    expect(zoneClient.chain.name).toBe('Tempo Zone 003')
    expect(zoneClient.chain.sourceId).toBe(tempoModerato.id)
    expect(zoneClient.transport.url).toBe('https://rpc-zone-003.tempoxyz.dev')
  })

  test('inherits HTTP transport settings and does not batch zone requests across accounts', async () => {
    const zoneInfo = {
      chainId: '0xfb5a505a',
      sequencer: '0x1111111111111111111111111111111111111111',
      zoneId: '0x1a',
      zoneTokens: ['0x20c0000000000000000000000000000000000000'],
    } as const

    const hits: {
      authorizationToken: string | undefined
      request: unknown
      testHeader: string | undefined
    }[] = []

    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      const request = JSON.parse(body)
      const requests = Array.isArray(request) ? request : [request]
      hits.push({
        authorizationToken: req.headers['x-authorization-token'] as
          | string
          | undefined,
        request,
        testHeader: req.headers['x-test-header'] as string | undefined,
      })

      const responses = requests.map((request) => ({
        id: request.id,
        jsonrpc: '2.0',
        result: zoneInfo,
      }))

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(Array.isArray(request) ? responses : responses[0]))
    })

    try {
      const chain = defineChain({
        ...tempoModerato,
        zones: {
          ...tempoModerato.zones,
          26: {
            ...tempoModerato.zones[26],
            rpcUrls: { default: { http: [server.url] } },
          },
        },
      })

      const transport = http(undefined, {
        fetchOptions: {
          headers: { 'x-test-header': 'preserved' },
        },
      })

      const clientA = createWalletClient({
        account: createAccount(),
        chain,
        transport,
      }).extend(tempoActions())
      const clientB = createWalletClient({
        account: createAccount(),
        chain,
        transport,
      }).extend(tempoActions())

      await Promise.all([
        clientA.getZoneClient({ zone: 26 }).zone.getZoneInfo(),
        clientB.getZoneClient({ zone: 26 }).zone.getZoneInfo(),
      ])

      expect(hits).toHaveLength(2)
      expect(hits.every((hit) => hit.testHeader === 'preserved')).toBe(true)
      expect(hits.every((hit) => !Array.isArray(hit.request))).toBe(true)
      expect(new Set(hits.map((hit) => hit.authorizationToken)).size).toBe(2)
    } finally {
      await server.close()
    }
  })

  test('supports fully overriding the zone transport', async () => {
    const request = vi.fn(async () => ({
      chainId: '0xfb5a505a',
      sequencer: '0x1111111111111111111111111111111111111111',
      zoneId: '0x1a',
      zoneTokens: ['0x20c0000000000000000000000000000000000000'],
    }))

    const chain = defineChain({
      ...tempoModerato,
      zones: {
        ...tempoModerato.zones,
        26: {
          ...tempoModerato.zones[26],
          rpcUrls: { default: { http: [] } },
        },
      },
    })

    const client = createWalletClient({
      account: createAccount(),
      chain,
      transport: http(),
    }).extend(tempoActions())

    const zoneClient = client.getZoneClient({
      zone: 26,
      transport: custom({ request }),
    })

    await expect(zoneClient.zone.getZoneInfo()).resolves.toEqual({
      chainId: 4217000026,
      sequencer: '0x1111111111111111111111111111111111111111',
      zoneId: 26,
      zoneTokens: ['0x20c0000000000000000000000000000000000000'],
    })
    expect(zoneClient.transport.type).toBe('custom')
    expect(request).toHaveBeenCalledWith({
      method: 'zone_getZoneInfo',
      params: [],
    })
  })

  test('throws a helpful error for unknown zones', () => {
    const client = createWalletClient({
      account: createAccount(),
      chain: tempoModerato,
      transport: http(),
    }).extend(tempoActions())

    expect(() => client.getZoneClient({ zone: 27 as never })).toThrowError(
      ZoneNotConfiguredError,
    )
    expect(() => client.getZoneClient({ zone: 27 as never })).toThrowError(
      /Zone "27" is not configured on chain "Tempo Testnet \(Moderato\)"\./,
    )
    expect(() => client.getZoneClient({ zone: 27 as never })).toThrowError(
      /Configured Zones: 26/,
    )
  })

  test('zone client exposes zone RPC actions', async () => {
    const authorizationTokenInfo = {
      account: '0x2222222222222222222222222222222222222222',
      expiresAt: '0x67d2d7c0',
    } as const
    const zoneInfo = {
      chainId: '0xfb5a505a',
      sequencer: '0x1111111111111111111111111111111111111111',
      zoneId: '0x1a',
      zoneTokens: [
        '0x20c0000000000000000000000000000000000000',
        '0x20c0000000000000000000000000000000aa0001',
      ],
    } as const
    const depositStatus = {
      deposits: [
        {
          amount: '0xf4240',
          depositHash: '0xfeed',
          kind: 'regular',
          memo: null,
          recipient: '0x4444444444444444444444444444444444444444',
          sender: '0x3333333333333333333333333333333333333333',
          status: 'processed',
          token: '0x20c0000000000000000000000000000000000000',
        },
      ],
      processed: true,
      tempoBlockNumber: '0x2a',
      zoneProcessedThrough: '0x2a',
    } as const

    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      const request = JSON.parse(body)
      const rpcRequest = Array.isArray(request) ? request[0] : request

      expect(req.headers['x-authorization-token']).toEqual(expect.any(String))
      expect(rpcRequest.method).toMatch(/^zone_/)
      if (rpcRequest.method === 'zone_getDepositStatus')
        expect(rpcRequest.params).toEqual(['0x2a'])

      const result =
        rpcRequest.method === 'zone_getAuthorizationTokenInfo'
          ? authorizationTokenInfo
          : rpcRequest.method === 'zone_getDepositStatus'
            ? depositStatus
            : zoneInfo

      const response = {
        id: rpcRequest.id,
        jsonrpc: '2.0',
        result,
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(Array.isArray(request) ? [response] : response))
    })

    try {
      const chain = defineChain({
        ...tempoModerato,
        zones: {
          ...tempoModerato.zones,
          26: {
            ...tempoModerato.zones[26],
            rpcUrls: { default: { http: [server.url] } },
          },
        },
      })

      const client = createWalletClient({
        account: createAccount(),
        chain,
        transport: http(),
      }).extend(tempoActions())

      const zoneClient = client.getZoneClient({ zone: 26 })

      const [tokenInfoResponse, zoneInfoResponse, depositStatusResponse] =
        await Promise.all([
          zoneClient.zone.getAuthorizationTokenInfo(),
          zoneClient.zone.getZoneInfo(),
          zoneClient.zone.getDepositStatus({ tempoBlockNumber: 42n }),
        ])

      const rawResponse = await zoneClient.request<{
        Method: 'zone_getZoneInfo'
        Parameters: []
        ReturnType: GetZoneInfoRpcReturnType
      }>({
        method: 'zone_getZoneInfo',
        params: [],
      })

      expect(tokenInfoResponse).toEqual({
        account: authorizationTokenInfo.account,
        expiresAt: BigInt(authorizationTokenInfo.expiresAt),
      })
      expect(zoneInfoResponse).toEqual({
        chainId: Number(BigInt(zoneInfo.chainId)),
        sequencer: zoneInfo.sequencer,
        zoneId: Number(BigInt(zoneInfo.zoneId)),
        zoneTokens: zoneInfo.zoneTokens,
      })
      expect(depositStatusResponse).toEqual({
        deposits: [
          {
            amount: BigInt(depositStatus.deposits[0]!.amount),
            depositHash: '0xfeed',
            kind: 'regular',
            memo: null,
            recipient: '0x4444444444444444444444444444444444444444',
            sender: '0x3333333333333333333333333333333333333333',
            status: 'processed',
            token: '0x20c0000000000000000000000000000000000000',
          },
        ],
        processed: true,
        tempoBlockNumber: BigInt(depositStatus.tempoBlockNumber),
        zoneProcessedThrough: BigInt(depositStatus.zoneProcessedThrough),
      })
      expect(rawResponse).toEqual(zoneInfo)
    } finally {
      await server.close()
    }
  })

  test('zone client can prepare and share authorization tokens before the first RPC request', async () => {
    let hits = 0
    const account = createAccount()
    const sign = vi.spyOn(account, 'sign')

    const server = await createHttpServer(async (req, res) => {
      hits += 1
      expect(req.headers['x-authorization-token']).toEqual(expect.any(String))

      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      const request = JSON.parse(body)
      const rpcRequest = Array.isArray(request) ? request[0] : request

      const response = {
        id: rpcRequest.id,
        jsonrpc: '2.0',
        result: {
          chainId: '0xfb5a505a',
          sequencer: '0x1111111111111111111111111111111111111111',
          zoneId: '0x1a',
          zoneTokens: ['0x20c0000000000000000000000000000000000000'],
        },
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(response))
    })

    try {
      const chain = defineChain({
        ...tempoModerato,
        zones: {
          ...tempoModerato.zones,
          26: {
            ...tempoModerato.zones[26],
            rpcUrls: { default: { http: [server.url] } },
          },
        },
      })

      const client = createWalletClient({
        account,
        chain,
        transport: http(),
      }).extend(tempoActions())

      const zoneClientA = client.getZoneClient({ zone: 26 })
      const zoneClientB = client.getZoneClient({ zone: 26 })

      const [preparedA, preparedB] = await Promise.all([
        zoneClientA.zone.prepareAuthorizationToken(),
        zoneClientB.zone.prepareAuthorizationToken(),
      ])

      expect(sign).toHaveBeenCalledTimes(1)
      expect(hits).toBe(0)
      expect(preparedA.account).toBe(account.address)
      expect(preparedA.expiresAt).toBe(preparedB.expiresAt)
      const expiresIn =
        preparedA.expiresAt - BigInt(Math.floor(Date.now() / 1000))
      expect(expiresIn).toBeGreaterThanOrEqual(1799n)
      expect(expiresIn).toBeLessThanOrEqual(1800n)

      await expect(zoneClientB.zone.getZoneInfo()).resolves.toEqual({
        chainId: 4217000026,
        sequencer: '0x1111111111111111111111111111111111111111',
        zoneId: 26,
        zoneTokens: ['0x20c0000000000000000000000000000000000000'],
      })

      expect(sign).toHaveBeenCalledTimes(1)
      expect(hits).toBe(1)
    } finally {
      await server.close()
      sign.mockRestore()
    }
  })

  test('zone client exposes token actions', async () => {
    const server = await createHttpServer(async (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      for await (const chunk of req) body += chunk

      const request = JSON.parse(body)
      const rpcRequest = Array.isArray(request) ? request[0] : request

      expect(req.headers['x-authorization-token']).toEqual(expect.any(String))
      expect(rpcRequest.method).toBe('eth_call')

      const response = {
        id: rpcRequest.id,
        jsonrpc: '2.0',
        result:
          '0x000000000000000000000000000000000000000000000000000000000000002a',
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(Array.isArray(request) ? [response] : response))
    })

    try {
      const chain = defineChain({
        ...tempoModerato,
        zones: {
          ...tempoModerato.zones,
          26: {
            ...tempoModerato.zones[26],
            rpcUrls: { default: { http: [server.url] } },
          },
        },
      })

      const client = createWalletClient({
        account: createAccount(),
        chain,
        transport: http(),
      }).extend(tempoActions())

      const zoneClient = client.getZoneClient({ zone: 26 })

      await expect(
        zoneClient.token.getBalance({
          token: '0x20c0000000000000000000000000000000000000',
        }),
      ).resolves.toBe(42n)
    } finally {
      await server.close()
    }
  })
})
