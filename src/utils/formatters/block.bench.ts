import { bench, describe } from 'vitest'

import { formatters as celo } from '../../celo/formatters.js'
import { formatters as opStack } from '../../op-stack/formatters.js'
import type { RpcBlock, RpcTransaction } from '../../types/rpc.js'
import { formatters as zksync } from '../../zksync/formatters.js'
import { formatBlock } from './block.js'
import { formatTransaction } from './transaction.js'

const hex = (size: number, seed = 0) =>
  `0x${Array.from({ length: size }, (_, i) => ((i * 31 + seed) & 0xff).toString(16).padStart(2, '0')).join('')}` as const
const quantity = (value: number | bigint) => `0x${value.toString(16)}` as const

function transaction(i: number, type: string) {
  return {
    blockHash: hex(32),
    blockNumber: '0x1312d00',
    from: hex(20, i),
    gas: quantity(21_000 + i),
    gasPrice: quantity(20_000_000_000 + i),
    hash: hex(32, i),
    input: i % 3 ? hex(68, i) : '0x',
    nonce: quantity(i),
    to: hex(20, i + 1),
    transactionIndex: quantity(i),
    value: quantity(BigInt(i) * 10n ** 15n),
    type,
    chainId: '0x1',
    ...(type === '0x7e'
      ? { sourceHash: hex(32, i), mint: '0x0', isSystemTx: false }
      : { v: type === '0x0' ? '0x25' : '0x1', r: hex(32, i), s: hex(32, i) }),
    ...(type !== '0x0' &&
      type !== '0x7e' && { accessList: [], yParity: '0x1' }),
    ...(type === '0x2' && {
      maxFeePerGas: quantity(35_000_000_000),
      maxPriorityFeePerGas: quantity(1_500_000_000),
    }),
  } as unknown as RpcTransaction
}

// Mostly EIP-1559 with some legacy transactions; the OP Stack block starts
// with its L1 attributes deposit.
const block = (deposit: boolean) =>
  ({
    baseFeePerGas: quantity(12_000_000_000),
    difficulty: '0x0',
    extraData: '0x',
    gasLimit: quantity(30_000_000),
    gasUsed: quantity(14_000_000),
    hash: hex(32, 1),
    logsBloom: hex(256),
    miner: hex(20),
    mixHash: hex(32, 2),
    nonce: '0x0000000000000000',
    number: '0x1312d00',
    parentHash: hex(32, 3),
    receiptsRoot: hex(32, 4),
    sha3Uncles: hex(32, 5),
    size: quantity(150_000),
    stateRoot: hex(32, 6),
    timestamp: quantity(1_735_689_600),
    totalDifficulty: null,
    transactions: Array.from({ length: 300 }, (_, i) =>
      transaction(i, deposit && i === 0 ? '0x7e' : i % 10 ? '0x2' : '0x0'),
    ),
    transactionsRoot: hex(32, 7),
    uncles: [],
  }) as unknown as RpcBlock

const eip1559 = transaction(1, '0x2')
const legacy = transaction(1, '0x0')
const ethereumBlock = block(false)
const opStackBlock = block(true)

describe('formatTransaction', () => {
  bench('viem: `formatTransaction` (EIP-1559)', () => {
    formatTransaction(eip1559)
  })

  bench('viem: `formatTransaction` (legacy)', () => {
    formatTransaction(legacy)
  })
})

describe('formatBlock (300 transactions)', () => {
  bench('viem: `formatBlock`', () => {
    formatBlock(ethereumBlock)
  })

  bench('viem: OP Stack `formatters.block`', () => {
    opStack.block.format(opStackBlock as never)
  })

  bench('viem: Celo `formatters.block`', () => {
    celo.block.format(ethereumBlock as never)
  })

  bench('viem: zkSync `formatters.block`', () => {
    zksync.block.format(ethereumBlock as never)
  })
})
