import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, test } from 'vitest'
import { signPersonalMessage, verifySignature } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const privateKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const address = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const otherAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const message = 'viem evals: prove account ownership'
// Ground-truth RFC 6979 EIP-191 signature of `message` by `privateKey`,
// computed independently of the code under test.
const knownSignature =
  '0x6f57e6ca624c53a1dd9573a11b6c5f0beb5d37f2790bb2d9ace1fbbb94ccdb2a29b74121c4568d7c38d4d2d0b8a54616da5c242b4b94e1e3d8edd9c6d8dd0aef1b'

// Raw JSON-RPC with retry for transient network errors under parallel load.
async function rpc(method: string, params: unknown[]) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      const { result, error } = (await res.json()) as any
      if (error) throw new Error(error.message)
      return result
    } catch (err) {
      if (attempt >= 2) throw err
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
}

// Warm fork account state so on-chain verification is not cold under load.
beforeAll(async () => {
  for (const account of [address, otherAddress]) {
    await rpc('eth_getCode', [account, 'latest'])
    await rpc('eth_getBalance', [account, 'latest'])
  }
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('signed message round-trips through verification', async () => {
  const signature = await signPersonalMessage({ message, privateKey })
  expect(signature).toMatch(/^0x[0-9a-fA-F]+$/)
  await expect(
    verifySignature(client, { address, message, signature }),
  ).resolves.toBe(true)
}, 120_000)

test('accepts a known-good EIP-191 signature', async () => {
  await expect(
    verifySignature(client, {
      address,
      message,
      signature: knownSignature,
    }),
  ).resolves.toBe(true)
}, 120_000)

test('rejects a tampered message', async () => {
  await expect(
    verifySignature(client, {
      address,
      message: 'viem evals: prove account 0wnership',
      signature: knownSignature,
    }),
  ).resolves.toBe(false)
}, 120_000)

test('rejects the wrong address', async () => {
  await expect(
    verifySignature(client, {
      address: otherAddress,
      message,
      signature: knownSignature,
    }),
  ).resolves.toBe(false)
}, 120_000)
