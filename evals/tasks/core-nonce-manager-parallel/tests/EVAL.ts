import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sender = '0x90f79bf6eb2c4f870365e785982e1f101e93b906'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/nonceManager\s*:\s*NonceManager\./)
  expect(source).toMatch(/Promise\.all\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('sends 5 concurrent transfers that all mine with consecutive nonces', async () => {
  const values = [
    1_000_000_000_000_000n,
    2_000_000_000_000_000n,
    3_000_000_000_000_000n,
    4_000_000_000_000_000n,
    5_000_000_000_000_000n,
  ]
  const [startNonce, balanceBefore] = await Promise.all([
    Actions.address.getTransactionCount(client, { address: sender }),
    Actions.address.getBalance(client, { address: recipient }),
  ])

  const hashes = await example()

  expect(hashes).toHaveLength(5)
  expect(new Set(hashes).size).toBe(5)

  const receipts = await Promise.all(
    hashes.map(
      (hash) =>
        Actions.transaction.waitForReceipt(client, { hash, timeout: 30_000 })
          .receipt,
    ),
  )
  for (const receipt of receipts) expect(receipt.status).toBe('success')

  const txs = await Promise.all(
    hashes.map((hash) => Actions.transaction.get(client, { hash })),
  )
  for (const [i, tx] of txs.entries()) {
    expect(tx.from.toLowerCase()).toBe(sender)
    expect(tx.to?.toLowerCase()).toBe(recipient)
    expect(tx.value).toBe(values[i])
  }

  const nonces = txs.map((tx) => Number(tx.nonce)).sort((a, b) => a - b)
  expect(nonces).toEqual([0, 1, 2, 3, 4].map((i) => startNonce + i))

  const balanceAfter = await Actions.address.getBalance(client, {
    address: recipient,
  })
  expect(balanceAfter - balanceBefore).toBe(15_000_000_000_000_000n)
}, 120_000)
