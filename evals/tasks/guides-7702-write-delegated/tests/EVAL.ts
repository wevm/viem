import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { writeDelegated } from '../src/index.ts'

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

async function getMinedReceipt(hash: string) {
  for (let i = 0; i < 100; i++) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (receipt) return receipt
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`no receipt for ${hash}`)
}

const deployer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
// Randomly generated history-free keypair: dev accounts and weak vanity keys
// carry residual mainnet state (7702 sweeper code/storage) on the fork.
const eoa = '0xFE4EacD82FD985357229cB97e036DD2FcD921eCA'

// Storage runtime dispatching `store(uint256)` (0x6057361d) to SSTORE slot 0
// and `retrieve()` (0x2e64cec1) to return SLOAD slot 0.
const runtime =
  '0x5f3560e01c80636057361d14601c5780632e64cec1146023575f5ffd5b6004355f55005b5f545f5260205ff3'
// Init code CODECOPYing the 44-byte runtime.
const initCode = `0x602c600a5f39602c5ff3${runtime.slice(2)}`

const retrieveData = '0x2e64cec1'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xd52ca50b7cca7d19e9a2301bd3a1bb5a471db800093e8823db7f9f49f6bed834',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

async function slot0(address: string) {
  return BigInt(await rpc('eth_getStorageAt', [address, '0x0', 'latest']))
}

async function retrieveAt(address: string) {
  return BigInt(
    await rpc('eth_call', [{ to: address, data: retrieveData }, 'latest']),
  )
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('writes through the delegated code at the EOA address', async () => {
  // Deploy the storage implementation from a dev account (automine).
  const hash = await rpc('eth_sendTransaction', [
    { from: deployer, data: initCode },
  ])
  const receipt = await getMinedReceipt(hash)
  expect(receipt.status).toBe('0x1')
  const delegate = receipt.contractAddress as string
  expect(await rpc('eth_getCode', [delegate, 'latest'])).toBe(runtime)

  // Fund the fresh EOA and install the EIP-7702 delegation designator.
  await rpc('anvil_setBalance', [eoa, '0x8ac7230489e80000'])
  expect(await rpc('eth_getCode', [eoa, 'latest'])).toBe('0x')
  await rpc('anvil_setCode', [eoa, `0xef0100${delegate.slice(2)}`])
  const code = (await rpc('eth_getCode', [eoa, 'latest'])) as string
  expect(code.toLowerCase()).toBe(`0xef0100${delegate.slice(2).toLowerCase()}`)
  expect(await slot0(eoa)).toBe(0n)

  const value = 741_852_963n
  const nonceBefore = BigInt(
    await rpc('eth_getTransactionCount', [eoa, 'latest']),
  )

  expect(await writeDelegated(client, { value })).toBe(value)

  // A transaction ran from the EOA itself.
  const nonceAfter = BigInt(
    await rpc('eth_getTransactionCount', [eoa, 'latest']),
  )
  expect(nonceAfter).toBeGreaterThan(nonceBefore)

  // State landed in the EOA's own storage, readable at the EOA address.
  expect(await retrieveAt(eoa)).toBe(value)
  expect(await slot0(eoa)).toBe(value)

  // The implementation contract's own storage is untouched.
  expect(await slot0(delegate)).toBe(0n)

  // The delegation stays active: repeat writes need no further setup.
  const next = 123_456_789n
  expect(await writeDelegated(client, { value: next })).toBe(next)
  expect(await retrieveAt(eoa)).toBe(next)
}, 60_000)
