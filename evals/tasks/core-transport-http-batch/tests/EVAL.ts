import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { Client } from 'viem'
import { mainnet } from 'viem/chains'
import { afterAll, expect, test } from 'vitest'
import { createTransport, getNetworkSnapshot } from '../src/index.ts'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

// Recording proxy: captures each JSON-RPC body, then forwards it to anvil.
const bodies: unknown[] = []
const server = createServer(async (req, res) => {
  let raw = ''
  for await (const chunk of req) raw += chunk
  bodies.push(JSON.parse(raw))
  const upstream = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw,
  })
  res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
  res.end(await upstream.text())
})

await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
const serverAddress = server.address()
if (!serverAddress || typeof serverAddress === 'string')
  throw new Error('no port')
const client = Client.create({
  chain: mainnet,
  transport: createTransport({
    url: `http://127.0.0.1:${serverAddress.port}`,
  }),
})

afterAll(() => {
  server.close()
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('resolves block number, chain id, and gas price matching raw RPC', async () => {
  const [blockNumber, chainId, gasPrice] = await Promise.all([
    rpc('eth_blockNumber', []),
    rpc('eth_chainId', []),
    rpc('eth_gasPrice', []),
  ])
  const snapshot = await getNetworkSnapshot(client)
  expect(snapshot.blockNumber).toBe(BigInt(blockNumber))
  expect(snapshot.chainId).toBe(Number(chainId))
  expect(snapshot.gasPrice).toBe(BigInt(gasPrice))
}, 30_000)

test('coalesces the three reads into a single JSON-RPC batch request', () => {
  const methods = (body: unknown) =>
    Array.isArray(body) ? body.map((request: any) => request.method) : []
  const batch = bodies
    .map(methods)
    .find((batchMethods) =>
      ['eth_blockNumber', 'eth_chainId', 'eth_gasPrice'].every((method) =>
        batchMethods.includes(method),
      ),
    )
  expect(batch).toBeDefined()
})
