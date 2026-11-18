import { Transaction } from 'ethers'

import { bench, describe } from 'vitest'

import { accounts } from '~test/constants.js'
import type {
  TransactionSerializable,
  TransactionSerializableBase,
} from '../../types/transaction.js'
import { parseEther } from '../unit/parseEther.js'

import { parseTransaction } from './parseTransaction.js'
import { serializeTransaction } from './serializeTransaction.js'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

const legacy = serializeTransaction(
  { ...base, gasPrice: 1n },
  { r: '0x1', s: '0x2', v: 28n },
)
const eip1559 = serializeTransaction(
  { ...base, chainId: 1, maxFeePerGas: 1n },
  { r: '0x1', s: '0x2', yParity: 1 },
)
const eip2930 = serializeTransaction(
  { ...base, chainId: 1, gasPrice: 1n, accessList: [] },
  { r: '0x1', s: '0x2', yParity: 1 },
)

const hex = (size: number, seed = 0) =>
  `0x${Array.from({ length: size }, (_, i) => ((i * 31 + seed) & 0xff).toString(16).padStart(2, '0')).join('')}` as const

const signature = { r: hex(32, 1), s: hex(32, 2), yParity: 1 } as const
const transfer = {
  chainId: 1,
  nonce: 785,
  maxPriorityFeePerGas: 1_500_000_000n,
  maxFeePerGas: 35_000_000_000n,
  gas: 65_000n,
  to: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  data: hex(68, 3),
} satisfies TransactionSerializable
const accessList = {
  ...transfer,
  data: hex(1024, 4),
  accessList: Array.from({ length: 3 }, (_, i) => ({
    address: hex(20, i),
    storageKeys: Array.from({ length: 5 }, (_, j) => hex(32, i * 5 + j)),
  })),
} satisfies TransactionSerializable
const authorizations = {
  ...transfer,
  authorizationList: [0, 1].map((i) => ({
    address: hex(20, 20 + i),
    chainId: 1,
    nonce: 4 + i,
    r: hex(32, 5 + i),
    s: hex(32, 7 + i),
    yParity: i,
  })),
} satisfies TransactionSerializable
const blobs = {
  ...transfer,
  maxFeePerBlobGas: 3_000_000_000n,
  blobVersionedHashes: [
    `0x01${hex(31, 9).slice(2)}`,
    `0x01${hex(31, 10).slice(2)}`,
  ],
  sidecars: [0, 1].map((i) => ({
    blob: hex(131_072, i),
    commitment: hex(48, 11 + i),
    proof: hex(48, 13 + i),
  })),
} satisfies TransactionSerializable

describe('Parse Transaction (Legacy)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(legacy)
  })

  bench('ethers: `Transaction.from`', () => {
    Transaction.from(legacy)
  })
})

describe('Parse Transaction (EIP1559)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(eip1559)
  })

  bench('ethers: `Transaction.from`', () => {
    Transaction.from(eip1559)
  })
})

describe('Parse Transaction (EIP2930)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(eip2930)
  })

  bench('ethers: `Transaction.from`', () => {
    Transaction.from(eip2930)
  })
})

describe('Parse Transaction (EIP1559, ERC-20 transfer)', () => {
  const serialized = serializeTransaction(transfer, signature)

  bench('viem: `parseTransaction`', () => {
    parseTransaction(serialized)
  })
})

describe('Parse Transaction (EIP1559, access list)', () => {
  const serialized = serializeTransaction(accessList, signature)

  bench('viem: `parseTransaction`', () => {
    parseTransaction(serialized)
  })
})

describe('Parse Transaction (EIP7702)', () => {
  const serialized = serializeTransaction(authorizations, signature)

  bench('viem: `parseTransaction`', () => {
    parseTransaction(serialized)
  })
})

describe('Parse Transaction (EIP4844, 2 blobs)', () => {
  const serialized = serializeTransaction(blobs, signature)

  bench('viem: `parseTransaction`', () => {
    parseTransaction(serialized)
  })
})
