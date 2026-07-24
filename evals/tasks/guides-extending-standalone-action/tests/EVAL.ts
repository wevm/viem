import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { extendAppClient, getAccountSummary } from '../src/index.ts'

const baseClient = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('standalone action reports raw RPC account state', async () => {
  const address = '0x1111111111111111111111111111111111111111'
  // 123456789123456789 wei, nonce 7.
  await rpc('anvil_setBalance', [address, '0x1b69b4bacd05f15'])
  await rpc('anvil_setNonce', [address, '0x7'])

  const client = extendAppClient(baseClient)
  expectTypeOf(client.chain).toEqualTypeOf<
    typeof import('viem/chains').mainnet
  >()
  const summary = await getAccountSummary(client, { address })
  expect(summary).toEqual({ balance: 123456789123456789n, nonce: 7 })

  const [rawBalance, rawNonce] = await Promise.all([
    rpc('eth_getBalance', [address, 'latest']),
    rpc('eth_getTransactionCount', [address, 'latest']),
  ])
  expect(summary.balance).toBe(BigInt(rawBalance))
  expect(summary.nonce).toBe(Number(BigInt(rawNonce)))
})

test('decorated client method returns the same summary', async () => {
  const address = '0x2222222222222222222222222222222222222222'
  // 5 ETH, nonce 42.
  await rpc('anvil_setBalance', [address, '0x4563918244f40000'])
  await rpc('anvil_setNonce', [address, '0x2a'])

  const client = extendAppClient(baseClient)
  const viaMethod = await client.accounts.getSummary({ address })
  expect(viaMethod).toEqual({ balance: 5_000_000_000_000_000_000n, nonce: 42 })

  const viaAction = await getAccountSummary(client, { address })
  expect(viaMethod).toEqual(viaAction)

  const [rawBalance, rawNonce] = await Promise.all([
    rpc('eth_getBalance', [address, 'latest']),
    rpc('eth_getTransactionCount', [address, 'latest']),
  ])
  expect(viaMethod.balance).toBe(BigInt(rawBalance))
  expect(viaMethod.nonce).toBe(Number(BigInt(rawNonce)))
})
