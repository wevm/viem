import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { afterAll, beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})
const requests: unknown[] = []

async function forward(body: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch('http://anvil:8545', {
        body,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return { body: await response.text(), status: response.status }
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw new Error('RPC did not return a response')
}

const server = createServer(async (request, response) => {
  let body = ''
  for await (const chunk of request) body += chunk
  requests.push(JSON.parse(body))

  const upstream = await forward(body)
  response.writeHead(upstream.status, {
    'Content-Type': 'application/json',
  })
  response.end(upstream.body)
})

beforeAll(
  () =>
    new Promise<void>((resolve) => {
      server.listen(18_545, '127.0.0.1', resolve)
    }),
  60_000,
)

afterAll(() => server.close(), 60_000)

test('uses concurrent HTTP batching', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/batch\s*:\s*true/)
  expect(source).toMatch(/Promise\.all\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('returns a node-derived network snapshot', async () => {
  const [blockNumber, chainId, gasPrice] = await Promise.all([
    Actions.block.getNumber(client),
    Actions.chains.getId(client),
    Actions.fee.getGasPrice(client),
  ])
  requests.length = 0
  const result = await example()

  expect(result.blockNumber).toBe(blockNumber)
  expect(result.chainId).toBe(chainId)
  expect(result.gasPrice).toBe(gasPrice)
  expect(requests).toHaveLength(1)

  const [batch] = requests
  expect(Array.isArray(batch)).toBe(true)
  if (!Array.isArray(batch)) throw new Error('expected a JSON-RPC batch')
  expect(batch.map((request) => request.method).sort()).toEqual([
    'eth_blockNumber',
    'eth_chainId',
    'eth_gasPrice',
  ])
}, 60_000)
