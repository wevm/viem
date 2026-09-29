import { expect, test } from 'vitest'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { openPayer } from '../constants.js'
import { getTransaction } from './getTransaction.js'

const hash = `0x${'aa'.repeat(32)}` as const
const sender = '0xb2d257539bede2c12c5892766d1eca7ac913732f' as const
const target = '0x9d2a3b47513a91e37b684c3c1f46183044964a44' as const
const to = '0x1575fbe7293a9cc656608ccfb509daf4988ee745' as const

const body = {
  chainId: '0x509f455',
  sender,
  nonceKey: '0x0',
  nonce: '0x2',
  validAfter: '0x0',
  validBefore: '0x1a0e9f23cbd',
  maxPriorityFeePerGas: '0xf4240',
  maxFeePerGas: '0x77635ac0',
  gas: '0x1372a',
  accountChanges: [{ type: '0x1', target }],
  calls: [[{ to, value: '0x5', data: '0x' }]],
  metadata: '0x',
  payer: '0x0000000000000000000000000000000000000000',
}

const envelope = {
  type: '0x79',
  senderAuth: '0x01',
  payerAuth: '0x02',
  from: sender,
  hash,
  gasPrice: '0x3baa0c40',
  blockHash: `0x${'bb'.repeat(32)}`,
  blockNumber: '0x9ba0',
  transactionIndex: '0x2',
}

function clientReturning(response: unknown) {
  return createClient({
    chain: mainnet,
    transport: custom({
      async request({ method }: { method: string }) {
        if (method === 'eth_getTransactionByHash') return response
        throw new Error(`unexpected RPC: ${method}`)
      },
    }),
  })
}

const expected = {
  chainId: 84538453,
  nonceSequence: 2,
  validAfter: 0,
  validBefore: 1790631361725,
  gas: 0x1372an,
  accountChanges: [{ type: 'delegation', target }],
  calls: [[{ to, value: 5n }]],
  payer: openPayer,
}

test('reads the flat, quantity-encoded response', async () => {
  const tx = await getTransaction(
    clientReturning({ ...envelope, ...body, to: null, value: '0x0' }),
    { hash },
  )
  expect(tx).toMatchObject(expected)
})

test('reads the nested `tx` body and JSON numbers of older nodes', async () => {
  const { nonce: _, gas: __, ...rest } = body
  const tx = await getTransaction(
    clientReturning({
      ...envelope,
      tx: {
        ...rest,
        chainId: 84538453,
        nonceSequence: 2,
        validAfter: 0,
        validBefore: 1790631361725,
        gasLimit: 0x1372a,
        accountChanges: [{ type: 'delegation', target }],
      },
    }),
    { hash },
  )
  expect(tx).toMatchObject(expected)
})

test('a short all-zero payer is open mode; null is self-pay', async () => {
  const open = await getTransaction(
    clientReturning({ ...envelope, ...body, payer: '0x00' }),
    { hash },
  )
  expect(open.payer).toBe(openPayer)
  const self = await getTransaction(
    clientReturning({ ...envelope, ...body, payer: null }),
    { hash },
  )
  expect(self.payer).toBeNull()
})
