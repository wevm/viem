import { AbiFunction } from 'ox'
import { beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

import { disputeGameFactoryAbi } from '../../abis.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

type RpcRequest = {
  id: number
  method: string
  params?: readonly unknown[] | undefined
}

type RpcOverride =
  | { error: { code: number; message: string }; result?: undefined }
  | { error?: undefined; result: unknown }

function getCallData(request: RpcRequest) {
  const call = request.params?.[0]
  if (typeof call !== 'object' || call === null || !('data' in call)) return
  return typeof call.data === 'string' ? call.data : undefined
}

/** Proxies real node responses with optional deterministic RPC overrides. */
function createProxy(
  intercept: (request: RpcRequest) => RpcOverride | undefined,
) {
  return Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', async () => {
      const request = JSON.parse(body) as RpcRequest
      const override = intercept(request)
      res.setHeader('Content-Type', 'application/json')
      if (override) {
        res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', ...override }))
        return
      }
      const response = await fetch(anvil.mainnet.rpcUrl.http, {
        body,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      res.end(await response.text())
    })
  })
}

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('returns an already-proposed game', async () => {
  const game = await Actions.l1.waitForNextGame(client, {
    l2BlockNumber: 144_990_134n,
    limit: 3,
    pollingInterval: 10,
    targetChain: optimism,
  })

  expect(game).toMatchInlineSnapshot(`
    {
      "extraData": "0x0000000000000000000000000000000000000000000000000000000008a46675",
      "index": 13219n,
      "l2BlockNumber": 144991861n,
      "metadata": "0x0000000000000000693cab5f2f32c96920163131333ed15bc523cd7438759c56",
      "rootClaim": "0xb767f8b50875a8f60d71ad79e6d1e7a1bda2a640ffa215cb453211b3f5d7aa9f",
      "timestamp": 1765583711n,
      "usesSuperRoots": false,
    }
  `)
})

test('retries until a game is proposed', async () => {
  const findLatestGames = AbiFunction.fromAbi(
    disputeGameFactoryAbi,
    'findLatestGames',
  )
  const selector = AbiFunction.getSelector(findLatestGames)
  let calls = 0
  const server = await createProxy((request) => {
    if (!getCallData(request)?.startsWith(selector)) return
    calls++
    if (calls === 2)
      return { result: AbiFunction.encodeResult(findLatestGames, []) }
    return undefined
  })
  const proxyClient = Client.create({
    chain: mainnet,
    transport: http(server.url),
  })

  try {
    const game = await Actions.l1.waitForNextGame(proxyClient, {
      l2BlockNumber: 144_990_134n,
      limit: 3,
      pollingInterval: 10,
      targetChain: optimism,
    })

    expect({ calls, index: game.index }).toMatchInlineSnapshot(`
        {
          "calls": 3,
          "index": 13219n,
        }
      `)
  } finally {
    await server.close()
  }
}, 60_000)

test('rejects unexpected polling errors', async () => {
  const selector = AbiFunction.getSelector(
    AbiFunction.fromAbi(disputeGameFactoryAbi, 'gameCount'),
  )
  let calls = 0
  const server = await createProxy((request) => {
    if (!getCallData(request)?.startsWith(selector)) return
    calls++
    if (calls >= 2) return { error: { code: -32_000, message: 'poll failed' } }
    return undefined
  })
  const proxyClient = Client.create({
    chain: mainnet,
    transport: http(server.url, { retryCount: 0 }),
  })

  try {
    await expect(
      Actions.l1.waitForNextGame(proxyClient, {
        l2BlockNumber: 144_990_134n,
        limit: 3,
        pollingInterval: 10,
        targetChain: optimism,
      }),
    ).rejects.toThrow('poll failed')
  } finally {
    await server.close()
  }
}, 60_000)
