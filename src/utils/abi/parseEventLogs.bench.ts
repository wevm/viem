import { bench, describe } from 'vitest'

import { erc20Abi } from '../../constants/abis.js'
import type { Hex } from '../../types/misc.js'
import type { RpcLog } from '../../types/rpc.js'
import { formatLog } from '../formatters/log.js'
import { parseEventLogs } from './parseEventLogs.js'

const transferTopic =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const approvalTopic =
  '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
const swapTopic =
  '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'

const word = (n: bigint) => n.toString(16).padStart(64, '0')
const address = (i: number) =>
  word((BigInt(i + 1) * 0x9e3779b97f4a7c15n) ** 2n).slice(-40)

// Shaped like a busy block: ERC-20 `Transfer` and `Approval`, ERC-721
// `Transfer` (same selector, one more indexed topic), and logs from events
// outside the ABI.
const rpcLogs = Array.from({ length: 1000 }, (_, i): RpcLog => {
  const from = `0x${address(i).padStart(64, '0')}` as const
  const to = `0x${address(i * 7 + 3).padStart(64, '0')}` as const
  const [topics, data] = ((): [Hex[], Hex] => {
    if (i % 10 < 6) return [[transferTopic, from, to], `0x${word(BigInt(i))}`]
    if (i % 10 < 7) return [[approvalTopic, from, to], `0x${'f'.repeat(64)}`]
    if (i % 10 < 8)
      return [[transferTopic, from, to, `0x${word(BigInt(i))}`], '0x']
    return [[swapTopic, from, to], `0x${word(BigInt(i)).repeat(5)}`]
  })()
  return {
    address: `0x${address(i * 13)}`,
    blockHash: `0x${word(1n)}`,
    blockNumber: '0x1312d00',
    data,
    logIndex: `0x${i.toString(16)}`,
    removed: false,
    topics: topics as [Hex, ...Hex[]],
    transactionHash: `0x${word(BigInt(i >> 2))}`,
    transactionIndex: `0x${(i >> 2).toString(16)}`,
  }
})
const logs = rpcLogs.map((log) => formatLog(log))

describe('parseEventLogs (1000 logs)', () => {
  bench('viem: `parseEventLogs` (RpcLog)', () => {
    parseEventLogs({ abi: erc20Abi, logs: rpcLogs })
  })

  bench('viem: `parseEventLogs` (Log)', () => {
    parseEventLogs({ abi: erc20Abi, logs })
  })

  bench('viem: `parseEventLogs` (args filter)', () => {
    parseEventLogs({
      abi: erc20Abi,
      args: { from: `0x${address(0)}` },
      eventName: 'Transfer',
      logs,
    })
  })
})
