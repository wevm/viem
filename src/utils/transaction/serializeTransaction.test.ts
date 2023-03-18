import { expect, test } from 'vitest'
import { accounts, signTransaction } from '../../_test'
import { serializeTransaction as serializeTransactionEthers } from 'ethers/lib/utils'
import { serializeTransaction } from './serializeTransaction'
import { parseGwei, parseEther } from '../unit'
import { Wallet } from 'ethers'

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

const wallet = new Wallet(sourceAccount.privateKey)

test('Serialize Transaction EIP1559', () => {
  expect(
    serializeTransaction('eip1559', {
      ...BaseTransaction,
      gas: 21001n,
      accessList: [],
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
    }),
  ).toEqual(
    serializeTransactionEthers({
      ...BaseTransaction,
      accessList: [],
      gasLimit: 21001n,
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
      type: 2,
    }),
  )
})

test('Serialize signed transaction EIP1559', async () => {
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
  expect(
    serializeTransaction(
      'eip1559',
      {
        ...BaseTransaction,
        accessList: [],
        gas: 21001n,
        maxFeePerGas: parseGwei('2'),
        maxPriorityFeePerGas: parseGwei('2'),
      },
      signature,
    ),
  ).toEqual(
    await wallet.signTransaction({
      ...BaseTransaction,
      accessList: [],
      maxFeePerGas: parseGwei('2'),
      maxPriorityFeePerGas: parseGwei('2'),
      gasLimit: 21001n,
      type: 2,
    }),
  )
})

test('Serialize Transaction EIP2930', () => {
  expect(
    serializeTransaction('eip2930', {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gas: 21001n,
    }),
  ).toEqual(
    serializeTransactionEthers({
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gasLimit: 21001n,
      type: 1,
    }),
  )
})

test('Serialize signed transaction EIP2930', async () => {
  const signature = signTransaction(
    serializeTransaction('eip2930', {
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gas: 21001n,
    }),
    sourceAccount.privateKey,
  )
  expect(
    serializeTransaction(
      'eip2930',
      {
        ...BaseTransaction,
        accessList: [],
        gasPrice: parseGwei('2'),
        gas: 21001n,
      },
      signature,
    ),
  ).toEqual(
    await wallet.signTransaction({
      ...BaseTransaction,
      accessList: [],
      gasPrice: parseGwei('2'),
      gasLimit: 21001n,
      type: 1,
    }),
  )
})

test('Serialize Legacy Transactions', () => {
  expect(
    serializeTransaction('legacy', {
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gas: 21001n,
    }),
  ).toEqual(
    serializeTransactionEthers({
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gasLimit: 21001n,
    }),
  )
})

test('Serialized signed legacy transaction', async () => {
  const signature = signTransaction(
    serializeTransaction('legacy', {
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gas: 21001n,
    }),
    sourceAccount.privateKey,
  )
  expect(
    serializeTransaction(
      'legacy',
      {
        ...BaseTransaction,
        gasPrice: parseGwei('2'),
        gas: 21001n,
      },
      signature,
    ),
  ).toEqual(
    await wallet.signTransaction({
      ...BaseTransaction,
      gasPrice: parseGwei('2'),
      gasLimit: 21001n,
    }),
  )
})
