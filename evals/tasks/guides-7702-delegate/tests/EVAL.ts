import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { delegateAccount } from '../src/index.ts'

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

const deployer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const eoa = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

// Init code deploying runtime `602a60005260206000f3` (returns 42).
const initCode = '0x69602a60005260206000f3600052600a6016f3'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  ),
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('installs an EIP-7702 delegation and returns the delegate address', async () => {
  // Deploy the delegate contract from a dev account (automine).
  const hash = await rpc('eth_sendTransaction', [
    { from: deployer, data: initCode },
  ])
  let receipt: any = null
  for (let i = 0; i < 100 && !receipt; i++) {
    receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (!receipt) await new Promise((r) => setTimeout(r, 100))
  }
  const delegate = receipt.contractAddress as string
  expect(await rpc('eth_getCode', [delegate, 'latest'])).toBe(
    '0x602a60005260206000f3',
  )

  // Clear any delegation left over from the work phase.
  await rpc('anvil_setCode', [eoa, '0x'])

  const delegation = await delegateAccount(client, {
    contractAddress: delegate as `0x${string}`,
  })

  // The EOA code is now the EIP-7702 delegation designator.
  const code = (await rpc('eth_getCode', [eoa, 'latest'])) as string
  expect(code.toLowerCase()).toBe(`0xef0100${delegate.slice(2).toLowerCase()}`)

  // The returned active delegation is the delegate address.
  expect(delegation).toBeDefined()
  expect((delegation as string).toLowerCase()).toBe(delegate.toLowerCase())

  // Calls to the EOA execute the delegated code (returns 42).
  expect(BigInt(await rpc('eth_call', [{ to: eoa }, 'latest']))).toBe(42n)
}, 60_000)
