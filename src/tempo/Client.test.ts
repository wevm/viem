import { expect, test } from 'vitest'

import { tempoLocalnet } from 'viem/chains'
import { Client } from 'viem/tempo'

test('default', () => {
  const client = Client.create()
  expect(client.chain?.name).toBe('Tempo Mainnet')
  expect(client.chain?.id).toBe(4217)
  expect(client.tokens?.length).toBeGreaterThan(0)
  // Decorated namespaces.
  expect(client.fee.getUserToken).toBeTypeOf('function')
  expect(client.fee.estimateFeesPerGas).toBeTypeOf('function')
  expect(client.nonce.getNonce).toBeTypeOf('function')
  expect(client.token.transferSync).toBeTypeOf('function')
  expect(client.address.getBalance).toBeTypeOf('function')
})

test('args: testnet', () => {
  const client = Client.create({ testnet: true })
  expect(client.chain?.id).toBe(42431)
})

test('args: chain overrides testnet', () => {
  const client = Client.create({ chain: tempoLocalnet, testnet: true })
  expect(client.chain?.id).toBe(1337)
})

test('args: feeToken extends the chain', () => {
  const client = Client.create({
    feeToken: '0x20c0000000000000000000000000000000000001',
  })
  expect((client.chain as { feeToken?: unknown })?.feeToken).toBe(
    '0x20c0000000000000000000000000000000000001',
  )
})
