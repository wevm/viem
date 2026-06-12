import { expect, test } from 'vitest'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { RpcBlock } from '../../types/rpc.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { getL2BlockNumberAtTimestamp } from './getL2BlockNumberAtTimestamp.js'

function block(number: bigint, timestamp: bigint) {
  return {
    number: numberToHex(number),
    timestamp: numberToHex(timestamp),
    transactions: [],
  } as unknown as RpcBlock
}

function client({
  latest = block(100n, 200n),
  parent = block(99n, 198n),
}: {
  latest?: RpcBlock
  parent?: RpcBlock
} = {}) {
  return createClient({
    transport: custom({
      async request({ method, params }) {
        if (method !== 'eth_getBlockByNumber') return null
        if (params[0] === 'latest') return latest
        if (params[0] === numberToHex(99n)) return parent
        return null
      },
    }),
  })
}

test('default', async () => {
  await expect(
    getL2BlockNumberAtTimestamp(client(), {
      timestamp: 180n,
    }),
  ).resolves.toBe(90n)
})

test('behavior: future timestamp', async () => {
  await expect(
    getL2BlockNumberAtTimestamp(client(), {
      timestamp: 202n,
    }),
  ).rejects.toThrow('Timestamp is in the future relative to L2 head.')
})

test('behavior: zero block time', async () => {
  await expect(
    getL2BlockNumberAtTimestamp(
      client({
        parent: block(99n, 200n),
      }),
      {
        timestamp: 198n,
      },
    ),
  ).rejects.toThrow('L2 block time is zero.')
})

test('behavior: unaligned timestamp', async () => {
  await expect(
    getL2BlockNumberAtTimestamp(client(), {
      timestamp: 199n,
    }),
  ).rejects.toThrow('Timestamp does not align with the L2 block time.')
})

test('behavior: predates genesis', async () => {
  await expect(
    getL2BlockNumberAtTimestamp(client(), {
      timestamp: -2n,
    }),
  ).rejects.toThrow('Timestamp predates L2 genesis.')
})
