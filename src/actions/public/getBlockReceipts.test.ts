import { assertType, expect, test, vi } from 'vitest'

import { mainnet } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcTransactionReceipt } from '../../types/rpc.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { getBlockReceipts } from './getBlockReceipts.js'

const blockHash = `0x${'1'.repeat(64)}` as Hash
const transactionHash = `0x${'2'.repeat(64)}` as Hash
const logsBloom = `0x${'0'.repeat(512)}` as Hex

const receipt = {
  blockHash,
  blockNumber: '0x1',
  contractAddress: null,
  cumulativeGasUsed: '0x2',
  effectiveGasPrice: '0x3',
  from: '0x0000000000000000000000000000000000000001',
  gasUsed: '0x4',
  logs: [
    {
      address: '0x0000000000000000000000000000000000000003',
      blockHash,
      blockNumber: '0x1',
      blockTimestamp: '0x5',
      data: '0x',
      logIndex: '0x0',
      removed: false,
      topics: [],
      transactionHash,
      transactionIndex: '0x0',
    },
  ],
  logsBloom,
  status: '0x1',
  to: '0x0000000000000000000000000000000000000002',
  transactionHash,
  transactionIndex: '0x0',
  type: '0x2',
} satisfies RpcTransactionReceipt

function getMockClient() {
  const client = createPublicClient({
    chain: mainnet,
    transport: custom({ request: async () => [] }),
  })
  const spy = vi.spyOn(client, 'request').mockResolvedValue([] as never)
  return { client, spy }
}

test('default', async () => {
  const { client, spy } = getMockClient()

  const receipts = await getBlockReceipts(client)
  assertType<TransactionReceipt[]>(receipts)
  expect(receipts).toEqual([])
  expect(spy).toHaveBeenCalledWith(
    {
      method: 'eth_getBlockReceipts',
      params: ['latest'],
    },
    { dedupe: false },
  )
})

test('args: blockNumber', async () => {
  const { client, spy } = getMockClient()

  await getBlockReceipts(client, {
    blockNumber: 42n,
  })

  expect(spy).toHaveBeenCalledWith(
    {
      method: 'eth_getBlockReceipts',
      params: ['0x2a'],
    },
    { dedupe: true },
  )
})

test('args: blockHash', async () => {
  const { client, spy } = getMockClient()

  await getBlockReceipts(client, {
    blockHash,
  })

  expect(spy).toHaveBeenCalledWith(
    {
      method: 'eth_getBlockReceipts',
      params: [blockHash],
    },
    { dedupe: true },
  )
})

test('args: blockTag', async () => {
  const { client, spy } = getMockClient()

  await getBlockReceipts(client, {
    blockTag: 'safe',
  })

  expect(spy).toHaveBeenCalledWith(
    {
      method: 'eth_getBlockReceipts',
      params: ['safe'],
    },
    { dedupe: false },
  )
})

test('empty block', async () => {
  const { client } = getMockClient()

  expect(await getBlockReceipts(client)).toEqual([])
})

test('formats receipts', async () => {
  const client = createPublicClient({
    chain: mainnet,
    transport: custom({ request: async () => [receipt] }),
  })

  const [formatted] = await getBlockReceipts(client)

  expect(formatted!.blockNumber).toBe(1n)
  expect(formatted!.cumulativeGasUsed).toBe(2n)
  expect(formatted!.effectiveGasPrice).toBe(3n)
  expect(formatted!.gasUsed).toBe(4n)
  expect(formatted!.logs[0]!.blockNumber).toBe(1n)
  expect(formatted!.logs[0]!.blockTimestamp).toBe(5n)
  expect(formatted!.logs[0]!.logIndex).toBe(0)
  expect(formatted!.status).toBe('success')
  expect(formatted!.transactionIndex).toBe(0)
  expect(formatted!.type).toBe('eip1559')
})

test('chain w/ custom transaction receipt formatter', async () => {
  const client = createPublicClient({
    chain: {
      ...mainnet,
      formatters: {
        transactionReceipt: defineTransactionReceipt({
          format: () => ({ custom: true as const }),
        }),
      },
    },
    transport: custom({ request: async () => [receipt] }),
  })

  const [formatted] = await getBlockReceipts(client)

  expect(formatted!.custom).toBe(true)
})

test('throws if block not found', async () => {
  const client = createPublicClient({
    chain: mainnet,
    transport: custom({ request: async () => null }),
  })

  await expect(
    getBlockReceipts(client, {
      blockNumber: 69420694206942n,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at number "69420694206942" could not be found.

    Version: viem@x.y.z]
  `)
})
