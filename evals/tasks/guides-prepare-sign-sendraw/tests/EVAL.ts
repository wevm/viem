import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const recipient = '0x4242424242424242424242424242424242424242'
const sender = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

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
  expect(sourceText).toMatch(/\bActions\.transaction\.prepare\s*\(/)
  expect(sourceText).toMatch(/\bActions\.transaction\.sendRaw\s*\(/)
  expect(sourceText).toMatch(/\bActions\.transaction\.sign\s*\(/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('prepares, signs, and broadcasts a raw payment', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const { hash, receipt } = await example()
  expect(receipt.status).toBe('success')
  expect(receipt.transactionHash).toBe(hash)
  const transaction = await rpc('eth_getTransactionByHash', [hash])
  const mined = await rpc('eth_getTransactionReceipt', [hash])
  expect(transaction.hash).toBe(hash)
  expect(transaction.from.toLowerCase()).toBe(sender)
  expect(transaction.to.toLowerCase()).toBe(recipient.toLowerCase())
  expect(mined.status).toBe('0x1')
  expect(mined.transactionHash).toBe(hash)
  expect(BigInt(await rpc('eth_getBalance', [recipient, 'latest']))).toBe(
    before + 10n ** 18n,
  )
}, 120_000)
