import { bench, describe } from 'vitest'

import { createHttpServer } from '~test/utils.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { erc20Abi, multicall3Abi } from '../../constants/abis.js'
import type { Hex } from '../../types/misc.js'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { encodeFunctionResult } from '../../utils/abi/encodeFunctionResult.js'
import { pad } from '../../utils/data/pad.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { call } from './call.js'
import { multicall } from './multicall.js'

const token = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

// Serves `aggregate3` responses with one `uint256` result per call, cached by
// calldata length so the server adds little to each iteration.
const responses = new Map<number, Hex>()
const server = await createHttpServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    const { id, params } = JSON.parse(body)
    const { data } = params[0] as { data: Hex }
    let result = responses.get(data.length)
    if (!result) {
      const calls = decodeFunctionData({ abi: multicall3Abi, data }).args?.[0]
      result = encodeFunctionResult({
        abi: multicall3Abi,
        functionName: 'aggregate3',
        result: (calls as readonly unknown[]).map(() => ({
          success: true,
          returnData: pad('0x01'),
        })),
      })
      responses.set(data.length, result)
    }
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ jsonrpc: '2.0', id, result }))
  })
})

const getContracts = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    abi: erc20Abi,
    address: token,
    functionName: 'balanceOf',
    args: [pad(numberToHex(i + 1), { size: 20 })],
  })) as {
    abi: typeof erc20Abi
    address: Hex
    functionName: 'balanceOf'
    args: [Hex]
  }[]

const client = createClient({ chain: mainnet, transport: http(server.url) })
for (const [count, batchSize] of [
  [1_000, 1_024],
  [1_000, 0],
  [10_000, 0],
])
  describe(`Multicall ${count} calls (batchSize: ${batchSize})`, () => {
    const contracts = getContracts(count)
    bench('viem: `multicall`', async () => {
      await multicall(client, { batchSize, contracts })
    })
  })

const batchClient = createClient({
  batch: { multicall: { batchSize: 1_000_000 } },
  chain: mainnet,
  transport: http(server.url),
})
for (const count of [1_000, 5_000])
  describe(`Batch ${count} calls into one multicall`, () => {
    const data = getContracts(count).map((contract) =>
      encodeFunctionData(contract),
    )
    bench('viem: `call`', async () => {
      await Promise.all(
        data.map((data) => call(batchClient, { data, to: token })),
      )
    })
  })
