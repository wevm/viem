import { expect, test } from 'vitest'
import { accounts, signTransaction } from '../../_test'
import { serializeTransaction } from './serializeTransaction'
import { parseGwei, parseEther } from '../unit'
import { parseTransaction } from './parseTransaction'
import type { EIP1559Serialized } from '../../types/transaction'

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
  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gas: 21001n,
      accessList: [],
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
    },
    { type: 'eip1559' },
  )

  expect(
    parseTransaction({ type: 'eip1559', encodedTransaction: serialized }),
  ).toEqual({
    ...BaseTransaction,
    gas: 21001n,
    accessList: [],
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
  })
})

test('parse signed transaction EIP1559', () => {
  const signature = signTransaction(
    serializeTransaction(
      {
        ...BaseTransaction,
        accessList: [],
        gas: 21001n,
        maxFeePerGas: parseGwei('2'),
        maxPriorityFeePerGas: parseGwei('2'),
      },
      { type: 'eip1559' },
    ),
    sourceAccount.privateKey,
  )

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [],
      gas: 21001n,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
    },
    { type: 'eip1559', signature },
  )
  expect(
    parseTransaction({ type: 'eip1559', encodedTransaction: serialized }),
  ).toEqual({
    ...BaseTransaction,
    accessList: [],
    gas: 21001n,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('2'),
    ...signature,
  })
})

test('parse transaction EIP2930', () => {
  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gas: 21001n,
    },
    { type: 'eip2930' },
  )

  expect(
    parseTransaction({ type: 'eip2930', encodedTransaction: serialized }),
  ).toEqual({
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei('2'),
    gas: 21001n,
  })
})

test('parse signed transaction EIP2930', () => {
  const signature = signTransaction(
    serializeTransaction(
      {
        ...BaseTransaction,
        accessList: [],
        gasPrice: parseGwei('2'),
        gas: 21001n,
      },
      { type: 'eip2930' },
    ),
    sourceAccount.privateKey,
  )

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gas: 21001n,
    },
    { type: 'eip2930', signature },
  )

  expect(
    parseTransaction({ type: 'eip2930', encodedTransaction: serialized }),
  ).toEqual({
    ...BaseTransaction,
    accessList: [],
    gasPrice: parseGwei('2'),
    gas: 21001n,
    ...signature,
  })
})

test('parse legacy transaction', () => {
  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gas: 21001n,
    },
    { type: 'legacy' },
  )

  expect(
    parseTransaction({ type: 'legacy', encodedTransaction: serialized }),
  ).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei('2'),
    gas: 21001n,
  })
})

test('parse signed legacy transaction', () => {
  const signature = signTransaction(
    serializeTransaction(
      {
        ...BaseTransaction,
        gasPrice: parseGwei('2'),
        gas: 21001n,
      },
      { type: 'legacy' },
    ),
    sourceAccount.privateKey,
  )

  const serialized = serializeTransaction(
    {
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gas: 21001n,
    },
    { type: 'legacy', signature },
  )

  expect(
    parseTransaction({ type: 'legacy', encodedTransaction: serialized }),
  ).toEqual({
    ...BaseTransaction,
    gasPrice: parseGwei('2'),
    gas: 21001n,
    r: signature.r,
    s: signature.s,
    v: 37n,
  })
})
