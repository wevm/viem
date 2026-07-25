import { readFileSync, readdirSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sender = '0x09E993fd7D5A600eF78722F4bFb092ea9Af70e8E'
// History-free recipient: anvil dev accounts carry EIP-7702 sweeper
// delegations on real mainnet, so forked transfers to them are swept.
const recipient = '0x4242424242424242424242424242424242424242'
const value = 1_000_000_000_000_000_000n // 1 ETH

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

type RpcResponse = {
  error?: { message: string }
}

async function rpc(method: string, params: unknown[]): Promise<void> {
  let response: RpcResponse | undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      response = await res.json()
      break
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  if (!response) throw new Error('RPC did not return a response')
  if (response.error) throw new Error(response.error.message)
}

function sources() {
  return readdirSync('src', { recursive: true })
    .filter((file) => String(file).endsWith('.ts'))
    .map((file) => readFileSync(`src/${file}`, 'utf8'))
    .join('\n')
}

beforeAll(async () => {
  // Fund the sender (2 ETH) so the transfer plus gas is covered.
  await rpc('anvil_setBalance', [sender, '0x1bc16d674ec80000'])
}, 60_000)

test('uses viem', () => {
  expect(sources()).toMatch(/from ['"]viem/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('builds the account from a custom sign function, not a key helper', () => {
  expect(sources()).not.toMatch(/fromPrivateKey|fromHdKey|fromMnemonic/)
}, 60_000)

test('sends ETH signed by the custom account', async () => {
  const before = await Actions.address.getBalance(client, {
    address: recipient,
  })

  const receipt = await example()
  expect(receipt.from.toLowerCase()).toBe(sender.toLowerCase())
  expect(receipt.status).toBe('success')

  // The transaction must originate from the address derived from the key.
  const transaction = await Actions.transaction.get(client, {
    hash: receipt.transactionHash,
  })
  expect(transaction.from.toLowerCase()).toBe(sender.toLowerCase())

  const after = await Actions.address.getBalance(client, { address: recipient })
  expect(after - before).toBe(value)
}, 120_000)
