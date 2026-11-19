import { bench, describe } from 'vitest'

import type { RpcLog } from '../../types/rpc.js'
import { formatLog } from './log.js'
import { formatTransactionReceipt } from './transactionReceipt.js'

const hex = (size: number, seed = 0) =>
  `0x${Array.from({ length: size }, (_, i) => ((i * 31 + seed) & 0xff).toString(16).padStart(2, '0')).join('')}` as const

const logs = Array.from(
  { length: 1000 },
  (_, i) =>
    ({
      address: hex(20, i % 10),
      blockHash: hex(32),
      blockNumber: '0x1312d00',
      blockTimestamp: '0x67fc559f',
      data: hex(32, i),
      logIndex: `0x${i.toString(16)}`,
      removed: false,
      topics: [hex(32, 1), hex(32, i), hex(32, i + 1)],
      transactionHash: hex(32, i >> 2),
      transactionIndex: `0x${(i >> 2).toString(16)}`,
    }) as RpcLog,
)
const args = { from: hex(20, 1), to: hex(20, 2), value: 1n }

const receipt = {
  blockHash: hex(32),
  blockNumber: '0x1312d00',
  contractAddress: null,
  cumulativeGasUsed: '0x1c9c380',
  effectiveGasPrice: '0x4a817c800',
  from: hex(20, 1),
  gasUsed: '0x1c9c380',
  logs: logs.slice(0, 500),
  logsBloom: hex(256),
  status: '0x1',
  to: hex(20, 2),
  transactionHash: hex(32, 3),
  transactionIndex: '0x0',
  type: '0x2',
} as const

describe('formatLog', () => {
  bench('1000 logs', () => {
    for (const log of logs) formatLog(log)
  })

  bench('1000 logs, with event name and args', () => {
    for (const log of logs) formatLog(log, { args, eventName: 'Transfer' })
  })

  bench('formatTransactionReceipt, 500 logs', () => {
    formatTransactionReceipt(receipt as never)
  })
})
