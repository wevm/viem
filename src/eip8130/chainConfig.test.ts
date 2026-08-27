import { expect, test } from 'vitest'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import { defineChain } from '../utils/chain/defineChain.js'
import { eip8130ChainConfig } from './chainConfig.js'

const rawReceipt = {
  blockHash: `0x${'ab'.repeat(32)}`,
  blockNumber: '0x1',
  contractAddress: null,
  cumulativeGasUsed: '0x5208',
  effectiveGasPrice: '0x3b9aca00',
  from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  gasUsed: '0x5208',
  logs: [],
  logsBloom: `0x${'00'.repeat(256)}`,
  status: '0x1',
  to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  transactionHash: `0x${'cd'.repeat(32)}`,
  transactionIndex: '0x0',
  type: '0x79',
  // EIP-8130 extension fields:
  payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  phaseStatuses: ['0x1'],
  metadata: '0xdeadbeef',
}

const chain = defineChain({
  ...eip8130ChainConfig,
  id: 84_532,
  name: 'Test 8130',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://example.com'] } },
})

test('core getTransactionReceipt surfaces eip8130 fields natively', async () => {
  const client = createClient({
    chain,
    transport: custom({
      async request({ method }: { method: string }) {
        if (method === 'eth_getTransactionReceipt') return rawReceipt
        throw new Error(`unexpected ${method}`)
      },
    }),
  })

  const receipt = await getTransactionReceipt(client, {
    hash: `0x${'cd'.repeat(32)}`,
  })

  expect(receipt.status).toBe('success')
  expect(receipt.eip8130).toEqual({
    payer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    phaseStatuses: ['0x1'],
    metadata: '0xdeadbeef',
  })
})
