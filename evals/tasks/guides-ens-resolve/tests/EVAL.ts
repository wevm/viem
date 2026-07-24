import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { resolveEnsAddress, resolveEnsName } from '../src/index.ts'

const vitalik = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' as const

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('resolves an ENS name to its address', async () => {
  const address = await resolveEnsAddress(client, { name: 'vitalik.eth' })
  expect(address?.toLowerCase()).toBe(vitalik.toLowerCase())
}, 60_000)

test('reverse-resolves an address to its primary name', async () => {
  await expect(resolveEnsName(client, { address: vitalik })).resolves.toBe(
    'vitalik.eth',
  )
}, 60_000)
