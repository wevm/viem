import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { replaceTransfer } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

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

// Anvil dev accounts (EIP-7702 code cleared at boot; safe recipients).
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const originalRecipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const replacementRecipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
const value = 1_234_567_890_123_456n

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('replacement lands, original is dropped', async () => {
  const beforeOriginal = BigInt(
    await rpc('eth_getBalance', [originalRecipient, 'latest']),
  )
  const beforeReplacement = BigInt(
    await rpc('eth_getBalance', [replacementRecipient, 'latest']),
  )

  const result = await replaceTransfer(client, {
    sender,
    originalRecipient,
    replacementRecipient,
    value,
  })

  expect(result.originalHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  expect(result.replacementHash).toMatch(/^0x[0-9a-fA-F]{64}$/)
  expect(result.replacementHash).not.toBe(result.originalHash)
  expect(result.landedHash).toBe(result.replacementHash)

  const replacementReceipt = await rpc('eth_getTransactionReceipt', [
    result.replacementHash,
  ])
  expect(replacementReceipt).not.toBeNull()
  expect(replacementReceipt.status).toBe('0x1')
  expect(replacementReceipt.from.toLowerCase()).toBe(sender.toLowerCase())
  expect(replacementReceipt.to.toLowerCase()).toBe(
    replacementRecipient.toLowerCase(),
  )

  const originalReceipt = await rpc('eth_getTransactionReceipt', [
    result.originalHash,
  ])
  expect(originalReceipt).toBeNull()

  const afterOriginal = BigInt(
    await rpc('eth_getBalance', [originalRecipient, 'latest']),
  )
  const afterReplacement = BigInt(
    await rpc('eth_getBalance', [replacementRecipient, 'latest']),
  )
  expect(afterReplacement - beforeReplacement).toBe(value)
  expect(afterOriginal - beforeOriginal).toBe(0n)
}, 90_000)
