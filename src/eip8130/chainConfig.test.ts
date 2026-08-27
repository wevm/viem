import { expect, test } from 'vitest'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { sendTransaction } from '../actions/wallet/sendTransaction.js'
import { createClient } from '../clients/createClient.js'
import { custom } from '../clients/transports/custom.js'
import { defineChain } from '../utils/chain/defineChain.js'
import { toAccount } from './accounts/toAccount.js'
import { eip8130ChainConfig } from './chainConfig.js'
import { aaTransactionType } from './constants.js'
import { key } from './keys.js'
import { erc1167Bytecode } from './utils/proxy.js'

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

test('core sendTransaction submits a native AA_TX_TYPE (0x79) transaction', async () => {
  const owner = privateKeyToAccount(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  )
  const account = toAccount({
    signer: owner,
    userSalt: `0x${'01'.padStart(64, '0')}`,
    code: erc1167Bytecode('0x00000000000000000000000000000000000000Ec'),
    initialActors: [key.k1(owner.address)],
  })

  let submitted: `0x${string}` | undefined
  const client = createClient({
    chain,
    transport: custom({
      async request({ method, params }: { method: string; params: any }) {
        // actor-config read (actor not yet bound → zeroed config)
        if (method === 'eth_call') return `0x${'0'.repeat(192)}`
        // 2D channel-nonce read
        if (method === 'eth_getTransactionCount') return '0x0'
        if (method === 'eth_sendRawTransaction') {
          submitted = params[0]
          return `0x${'11'.repeat(32)}`
        }
        throw new Error(`unexpected ${method}`)
      },
    }),
  })

  const hash = await sendTransaction(client, {
    account,
    calls: [{ to: account.address, data: '0x' }],
    accountChanges: [account.create()],
    gas: 200_000n,
    maxFeePerGas: 1_000_000_000n,
    maxPriorityFeePerGas: 1_000_000n,
  } as never)

  expect(hash).toBe(`0x${'11'.repeat(32)}`)
  expect(submitted?.startsWith(aaTransactionType)).toBe(true)
})
