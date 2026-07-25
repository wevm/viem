import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const slot =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

async function rpc(method: string, params: unknown[]) {
  // Retry transient DNS/socket failures seen under parallel suite load.
  const payload = await (async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch('http://anvil:8545', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        })
        return (await response.json()) as any
      } catch (error) {
        if (attempt === 2) throw error
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  })()
  const { result, error } = payload
  if (error) throw new Error(error.message)
  return result
}

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('returns the USDC account and slot-zero storage proof', async () => {
  const proof = await example()
  const raw = await rpc('eth_getProof', [usdc, [slot], 'latest'])
  const entry = proof.storageProof.find(({ key }) => BigInt(key) === 0n)

  expect(proof.address.toLowerCase()).toBe(usdc.toLowerCase())
  expect(proof.accountProof).toEqual(raw.accountProof)
  expect(proof.balance).toBe(BigInt(raw.balance))
  expect(proof.codeHash).toBe(raw.codeHash)
  expect(proof.nonce).toBe(Number(raw.nonce))
  expect(proof.storageHash).toBe(raw.storageHash)
  expect(entry).toEqual({
    key: raw.storageProof[0].key,
    proof: raw.storageProof[0].proof,
    value: BigInt(raw.storageProof[0].value),
  })
}, 60_000)
