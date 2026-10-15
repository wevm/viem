import { expect, test } from 'vitest'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { size } from '../../utils/data/size.js'
import { openPayer } from '../constants.js'
import { estimateGas } from './estimateGas.js'

const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const
const sponsor = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const

function makeClient() {
  const requests: any[] = []
  const client = createClient({
    chain: mainnet,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        if (method === 'eth_estimateGas') {
          requests.push(params[0])
          return '0xe41a'
        }
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
  return { client, requests }
}

test('open payer: sent as the zero address with a recoverable payerAuth stub', async () => {
  const { client, requests } = makeClient()
  const gas = await estimateGas(client, {
    sender,
    calls: [[{ to: sponsor }]],
    payer: openPayer,
  })
  expect(gas).toBe(0xe41an)
  expect(requests[0].payer).toBe('0x0000000000000000000000000000000000000000')
  expect(size(requests[0].payerAuth)).toBe(65)
})

test('open payer: an explicit payerAuth is passed through', async () => {
  const { client, requests } = makeClient()
  const payerAuth = `0x${'ab'.repeat(65)}` as const
  await estimateGas(client, {
    sender,
    calls: [[{ to: sponsor }]],
    payer: openPayer,
    payerAuth,
  })
  expect(requests[0].payerAuth).toBe(payerAuth)
})

test('named payer: sent as-is, and the node stubs payerAuth', async () => {
  const { client, requests } = makeClient()
  await estimateGas(client, {
    sender,
    calls: [[{ to: sponsor, value: 1n }]],
    payer: sponsor,
  })
  expect(requests[0].payer).toBe(sponsor)
  expect(requests[0].payerAuth).toBeUndefined()
  expect(requests[0].calls).toEqual([
    [{ to: sponsor, value: '0x1', data: '0x' }],
  ])
})

test('simplified mode: to/data/value are sent as a single call', async () => {
  const { client, requests } = makeClient()
  await estimateGas(client, { sender, to: sponsor, data: '0xdead', value: 2n })
  expect(requests[0]).toMatchInlineSnapshot(`
    {
      "calls": [
        [
          {
            "data": "0xdead",
            "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "value": "0x2",
          },
        ],
      ],
      "maxFeePerGas": "0xffffffffffffffff",
      "maxPriorityFeePerGas": "0xffffffffffffffff",
      "nonceKey": "0x0",
      "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "type": "0x79",
    }
  `)
})

test('nonceKey and validity bounds are hex quantities', async () => {
  const { client, requests } = makeClient()
  const nonceKey =
    0xcfa1e2e7e7f9aa5dddd32bb97e62c5ac22933af6784c4c4199ec8e7f821f81n
  await estimateGas(client, {
    sender,
    calls: [{ to: sponsor }],
    nonceKey,
    validBefore: 1790631361725n,
  })
  expect(BigInt(requests[0].nonceKey)).toBe(nonceKey)
  expect(requests[0].validBefore).toBe('0x1a0e9f23cbd')
  expect(requests[0]).not.toHaveProperty('validAfter')
  expect(requests[0]).not.toHaveProperty('gasLimit')
  expect(requests[0]).not.toHaveProperty('nonceSequence')
})

test('fee fields: forwarded when known, otherwise priced at their 8-byte maximum', async () => {
  const { client, requests } = makeClient()
  await estimateGas(client, {
    sender,
    calls: [{ to: sponsor }],
    maxFeePerGas: 2_001_000_000n,
    maxPriorityFeePerGas: 1_000_000n,
  })
  await estimateGas(client, { sender, calls: [{ to: sponsor }] })
  expect(requests[0].maxFeePerGas).toBe('0x7744d640')
  expect(requests[0].maxPriorityFeePerGas).toBe('0xf4240')
  expect(requests[1].maxFeePerGas).toBe('0xffffffffffffffff')
  expect(requests[1].maxPriorityFeePerGas).toBe('0xffffffffffffffff')
})
