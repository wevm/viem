import { readFileSync, readdirSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const recipient = '0x4242424242424242424242424242424242424242'
const sender = '0x09E993fd7D5A600eF78722F4bFb092ea9Af70e8E'

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

beforeAll(async () => {
  await rpc('anvil_setBalance', [sender, '0x1bc16d674ec80000'])
}, 60_000)

test('exports a zero-input Viem example', () => {
  const source = readdirSync('src', { recursive: true })
    .filter((file) => String(file).endsWith('.ts'))
    .map((file) => readFileSync(`src/${file}`, 'utf8'))
    .join('\n')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).not.toMatch(/waitForReceipt|getReceipt/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('sends 0.5 ETH and returns the confirmed receipt directly', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const receipt = await example()
  expect(receipt.status).toBe('success')
  expect(BigInt(await rpc('eth_getBalance', [recipient, 'latest']))).toBe(
    before + 500_000_000_000_000_000n,
  )
  const mined = await rpc('eth_getTransactionReceipt', [
    receipt.transactionHash,
  ])
  expect(mined.from.toLowerCase()).toBe(sender.toLowerCase())
}, 120_000)
