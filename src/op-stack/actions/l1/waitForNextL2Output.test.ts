import { AbiError, AbiFunction } from 'ox'
import { afterAll, beforeAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'
import { Actions } from 'viem/op-stack'

import { l2OutputOracleAbi } from '../../abis.js'

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
  | {
      error: { code: number; data?: string | undefined; message: string }
      result?: undefined
    }
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

afterAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 30_000)

beforeAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: 18_772_363n,
    jsonRpcUrl: anvil.mainnet.forkUrl,
  })
}, 60_000)

test('returns an already-proposed output', async () => {
  const output = await Actions.l1.waitForNextL2Output(client, {
    l2BlockNumber: 113_400_763n,
    pollingInterval: 10,
    targetChain: optimism,
  })

  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 113401663n,
      "outputIndex": 4536n,
      "outputRoot": "0xe1cbff6699172e5b10391f4329c8b0a490c2d089ff7d68f53fb386b6da6e9043",
      "timestamp": 1702403231n,
    }
  `)
})

test('retries until an output is proposed', async () => {
  const getL2OutputIndexAfter = AbiFunction.fromAbi(
    l2OutputOracleAbi,
    'getL2OutputIndexAfter',
  )
  const selector = AbiFunction.getSelector(getL2OutputIndexAfter)
  const error = AbiError.from('error Error(string message)')
  let calls = 0
  const server = await createProxy((request) => {
    if (!getCallData(request)?.startsWith(selector)) return
    calls++
    if (calls === 1)
      return {
        error: {
          code: 3,
          data: AbiError.encode(error, [
            'L2OutputOracle: cannot get output for a block that has not been proposed',
          ]),
          message: 'execution reverted',
        },
      }
    return undefined
  })
  const proxyClient = Client.create({
    chain: mainnet,
    transport: http(server.url, { retryCount: 0 }),
  })

  try {
    const output = await Actions.l1.waitForNextL2Output(proxyClient, {
      l2BlockNumber: 113_400_763n,
      pollingInterval: 10,
      targetChain: optimism,
    })

    expect({ calls, index: output.outputIndex }).toMatchInlineSnapshot(`
        {
          "calls": 2,
          "index": 4536n,
        }
      `)
  } finally {
    await server.close()
  }
}, 60_000)

test('rejects unexpected polling errors', async () => {
  const selector = AbiFunction.getSelector(
    AbiFunction.fromAbi(l2OutputOracleAbi, 'getL2OutputIndexAfter'),
  )
  const server = await createProxy((request) => {
    if (getCallData(request)?.startsWith(selector))
      return { error: { code: -32_000, message: 'poll failed' } }
    return undefined
  })
  const proxyClient = Client.create({
    chain: mainnet,
    transport: http(server.url, { retryCount: 0 }),
  })

  try {
    await expect(
      Actions.l1.waitForNextL2Output(proxyClient, {
        l2BlockNumber: 113_400_763n,
        pollingInterval: 10,
        targetChain: optimism,
      }),
    ).rejects.toThrow('poll failed')
  } finally {
    await server.close()
  }
}, 60_000)
