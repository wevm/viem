import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getStorageProof } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const slot0 =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('returns account and storage proof for USDC slot 0', async () => {
  const proof = await getStorageProof(client, {
    address: usdc,
    storageKey: slot0,
  })
  expect(proof.accountProof.length).toBeGreaterThan(0)
  expect(proof.storageHash).toMatch(/^0x[0-9a-f]{64}$/i)
  expect(proof.storageProof.length).toBeGreaterThan(0)
  const entry = proof.storageProof.find((e) => BigInt(e.key) === 0n)
  expect(entry).toBeDefined()
  expect(entry!.proof.length).toBeGreaterThan(0)
  expect(typeof entry!.value).toBe('bigint')
}, 60_000)
