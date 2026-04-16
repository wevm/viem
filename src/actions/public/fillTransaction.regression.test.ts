import { expect, test, vi } from 'vitest'
import { createClient, custom, defineChain } from '../../index.js'
import { fillTransaction } from './fillTransaction.js'

const chain = defineChain({
  id: 1,
  name: 'Test Chain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
})

test('behavior: preserve explicit nonce when fill response returns zero', async () => {
  const request = vi.fn(async ({ method, params }: any) => {
    expect(method).toBe('eth_fillTransaction')
    expect(params[0].nonce).toBe('0x5')

    return {
      raw: '0x02',
      tx: {
        hash: `0x${'11'.repeat(32)}`,
        input: '0xdeadbeef',
        nonce: '0x0',
        to: '0x0000000000000000000000000000000000000000',
        type: '0x2',
        value: '0x0',
      },
    }
  })

  const client = createClient({
    chain,
    transport: custom({ request }),
  })

  const result = await fillTransaction(client, {
    data: '0xdeadbeef',
    nonce: 5,
    to: '0x0000000000000000000000000000000000000000',
  })

  expect(result.transaction.nonce).toBe(5)
})
