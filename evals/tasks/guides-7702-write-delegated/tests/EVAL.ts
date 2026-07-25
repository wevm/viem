import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
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

async function receipt(hash: string) {
  for (let i = 0; i < 100; i++) {
    const value = await rpc('eth_getTransactionReceipt', [hash])
    if (value) return value
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`no receipt for ${hash}`)
}

const account = '0xFE4EacD82FD985357229cB97e036DD2FcD921eCA'
const deployer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const runtime =
  '0x5f3560e01c80636057361d14601c5780632e64cec1146023575f5ffd5b6004355f55005b5f545f5260205ff3'
const initCode = `0x602c600a5f39602c5ff3${runtime.slice(2)}`

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('writes through delegated code at the account address', async () => {
  const hash = await rpc('eth_sendTransaction', [
    { from: deployer, data: initCode },
  ])
  const deployed = await receipt(hash)
  const delegate = deployed.contractAddress as string
  await rpc('anvil_setBalance', [account, '0x8ac7230489e80000'])
  await rpc('anvil_setCode', [account, `0xef0100${delegate.slice(2)}`])
  await rpc('anvil_setStorageAt', [account, '0x0', `0x${'00'.repeat(32)}`])

  const nonce = BigInt(
    await rpc('eth_getTransactionCount', [account, 'latest']),
  )
  expect(await example()).toBe(741_852_963n)
  expect(
    BigInt(await rpc('eth_getStorageAt', [account, '0x0', 'latest'])),
  ).toBe(741_852_963n)
  expect(
    BigInt(await rpc('eth_getStorageAt', [delegate, '0x0', 'latest'])),
  ).toBe(0n)
  expect(
    BigInt(await rpc('eth_getTransactionCount', [account, 'latest'])),
  ).toBeGreaterThan(nonce)
}, 120_000)
