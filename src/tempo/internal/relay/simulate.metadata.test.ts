import { Hex } from 'ox'
import {
  createClient,
  encodeAbiParameters,
  encodeEventTopics,
  http,
  type Log,
} from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Abis, Store } from 'viem/tempo'
import { expect, test } from 'vitest'
import * as Cache from './cache.js'
import { buildBalanceDiffs } from './simulate.js'

const client = createClient({ chain: tempoLocalnet, transport: http() })
const account = '0x0000000000000000000000000000000000000001'
const recipient = '0x0000000000000000000000000000000000000002'

function transfer(index: number): Log {
  return {
    address: Hex.fromNumber(index + 1000, { size: 20 }),
    blockHash: null,
    blockNumber: null,
    data: encodeAbiParameters([{ type: 'uint256' }], [1_000_000n]),
    logIndex: null,
    removed: false,
    topics: encodeEventTopics({
      abi: Abis.tip20,
      eventName: 'Transfer',
      args: { from: account, to: recipient },
    }) as Log['topics'],
    transactionHash: null,
    transactionIndex: null,
  }
}

async function metadata(store: Store.Store, logs: readonly Log[]) {
  for (const log of logs)
    await Cache.memoize(
      async () => ({ decimals: 6, name: 'Dollar', symbol: 'USD' }),
      {
        key: `tokenMetadata:${tempoLocalnet.id}:${log.address}`,
        store,
        ttl: 60_000,
      },
    )
}

test('omits the entire preview when its token count exceeds the budget', async () => {
  const store = Store.memory()
  const logs = Array.from({ length: 101 }, (_, i) => transfer(i))
  await metadata(store, logs)
  expect(
    await buildBalanceDiffs(client, {
      account,
      approvalLogs: [],
      logs,
      store,
      tokenMetadata: {},
    }),
  ).toMatchInlineSnapshot('undefined')
})

test('resolves token metadata within the store concurrency budget', async () => {
  const memory = Store.memory()
  const logs = Array.from({ length: 30 }, (_, i) => transfer(i))
  await metadata(memory, logs)
  const active = new Set<symbol>()
  const store: Store.Store = {
    ...memory,
    async getItem(key) {
      const slot = Symbol()
      active.add(slot)
      try {
        if (active.size > 10) throw new Error('Store concurrency exceeded')
        // Keep reads pending together so exceeding the budget is observable.
        await new Promise((resolve) => setTimeout(resolve, 0))
        return await memory.getItem(key)
      } finally {
        active.delete(slot)
      }
    },
  }
  const result = await buildBalanceDiffs(client, {
    account,
    approvalLogs: [],
    logs,
    store,
    tokenMetadata: {},
  })
  expect(result?.[account]).toEqual(
    logs.map((log) => ({
      address: log.address,
      decimals: 6,
      direction: 'outgoing',
      formatted: '1',
      name: 'Dollar',
      recipients: [recipient],
      symbol: 'USD',
      value: '0xf4240',
    })),
  )
})

test('omits balance diffs when one token has unavailable metadata', async () => {
  const memory = Store.memory()
  const logs = [transfer(0), transfer(1)]
  await metadata(memory, logs)
  const store: Store.Store = {
    ...memory,
    async getItem(key) {
      if (key.endsWith(logs[1]!.address)) throw new Error('Store unavailable')
      return memory.getItem(key)
    },
  }
  expect(
    await buildBalanceDiffs(client, {
      account,
      approvalLogs: [],
      logs,
      store,
      tokenMetadata: {},
    }),
  ).toMatchInlineSnapshot('undefined')
})
