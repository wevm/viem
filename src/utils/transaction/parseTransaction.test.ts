import { expect, test } from 'vitest'
import { accounts, signTransaction } from '../../_test'
import { serializeTransaction } from './serializeTransaction'
import { parseGwei, parseEther } from '../unit'
import { parseTransaction } from './parseTransaction'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]
const data = '0x' as const

const BaseTransaction = {
  chainId: 1,
  data,
  to: targetAccount.address,
  nonce: 785,
  value: parseEther('1'),
}

test('parse transaction EIP1559', () => {
  const serialized = serializeTransaction('eip1559', {
    ...BaseTransaction,
    gas: 21001n,
    accessList: [],
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
  })

  expect(parseTransaction('eip1559', serialized)).toEqual({
    ...BaseTransaction,
    gas: 21001n,
    accessList: [],
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
  })
})

test('parse signed transaction EIP1559', () => {
  const signature = signTransaction(
    serializeTransaction('eip1559', {
      ...BaseTransaction,
      accessList: [],
      gas: 21001n,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
    }),
    sourceAccount.privateKey,
  )

  const serialized = serializeTransaction(
    'eip1559',
    {
      ...BaseTransaction,
      accessList: [],
      gas: 21001n,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
    },
    signature,
  )
  expect(parseTransaction('eip1559', serialized)).toEqual({
    ...BaseTransaction,
    accessList: [],
    gas: 21001n,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    ...signature,
  })
})

test('parse transaction EIP2930', () => {
  const serialized = serializeTransaction('eip2930', {
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei('2'),
    gas: 21001n,
  })

  expect(parseTransaction('eip2930', serialized)).toEqual({
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei('2'),
    gas: 21001n,
  })
})

test('parse signed transaction EIP2930', () => {
  const signature = signTransaction(
    serializeTransaction('eip2930', {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gas: 21001n,
    }),
    sourceAccount.privateKey,
  )

  const serialized = serializeTransaction(
    'eip2930',
    {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gas: 21001n,
    },
    signature,
  )

  expect(parseTransaction('eip2930', serialized)).toEqual({
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei('2'),
    gas: 21001n,
    ...signature,
  })
})

test('parse legacy transaction', () => {
  const serialized = serializeTransaction('legacy', {
    ...BaseTransaction,
    gasPrice: parseGwei('2'),
    gas: 21001n,
  })

  expect(parseTransaction('legacy', serialized)).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei('2'),
    gas: 21001n,
  })
})

test('parse signed legacy transaction', () => {
  const signature = signTransaction(
    serializeTransaction('legacy', {
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gas: 21001n,
    }),
    sourceAccount.privateKey,
  )

  const serialized = serializeTransaction(
    'legacy',
    {
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gas: 21001n,
    },
    signature,
  )

  expect(parseTransaction('legacy', serialized)).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei('2'),
    gas: 21001n,
    r: signature.r,
    s: signature.s,
    v: 37n,
  })
})
