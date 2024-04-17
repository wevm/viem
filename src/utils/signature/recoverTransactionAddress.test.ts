import { expect, test } from 'vitest'
import { accounts, forkBlockNumber } from '../../../test/src/constants.js'
import { publicClient, walletClient } from '../../../test/src/utils.js'
import {
  privateKeyToAccount,
  sign,
  signTransaction,
  signatureToHex,
} from '../../accounts/index.js'
import type { TransactionSerializable } from '../../types/transaction.js'
import { hexToBytes, keccak256, serializeTransaction } from '../index.js'
import { recoverTransactionAddress } from './recoverTransactionAddress.js'

const transaction: TransactionSerializable = {
  chainId: 1,
  maxFeePerGas: 2n,
  maxPriorityFeePerGas: 1n,
  to: '0x0000000000000000000000000000000000000000',
  value: 1n,
}

test('default', async () => {
  const address = await recoverTransactionAddress({
    serializedTransaction:
      '0x02f8f2018263a0830f4240850a2278a43483025e3d94be9a129909ebcb954bc065536d2bfafbd170d27a80b88455a2ba6800000000000000000000000049caf2309cbafdfa4ab28d11ae18c3ec9b1cdde0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000004d882cd000000000000000000000000000000000000000000000000000000000825d6838c080a02cd166f0be193729bd1cb9e4fb378bc8d956c48abda93425520284c360ff5d43a01934de732de08ba0b890dd6a3f331b4f8dace1b5dccbf1de0118ee4f620fc64b',
  })
  expect(address).toMatchInlineSnapshot(
    `"0x01087f4e1dbc0c52690A9397677dD90983711c37"`,
  )
})

test('signature (hex)', async () => {
  const serializedTransaction = serializeTransaction(transaction)
  const signature = await sign({
    hash: keccak256(serializedTransaction),
    privateKey: accounts[0].privateKey,
  })
  const address = await recoverTransactionAddress({
    serializedTransaction,
    signature: signatureToHex(signature),
  })
  expect(address.toLowerCase()).toBe(accounts[0].address)
})

test('signature (bytes)', async () => {
  const serializedTransaction = serializeTransaction(transaction)
  const signature = await sign({
    hash: keccak256(serializedTransaction),
    privateKey: accounts[0].privateKey,
  })
  const address = await recoverTransactionAddress({
    serializedTransaction,
    signature: hexToBytes(signatureToHex(signature)),
  })
  expect(address.toLowerCase()).toBe(accounts[0].address)
})

test('via `walletClient.signTransaction`', async () => {
  const serializedTransaction = await walletClient.signTransaction({
    account: privateKeyToAccount(accounts[0].privateKey),
    to: '0x0000000000000000000000000000000000000000',
    value: 1n,
    type: 'eip1559',
  })
  const address = await recoverTransactionAddress({
    serializedTransaction,
  })
  expect(address.toLowerCase()).toBe(accounts[0].address)
})

test('via account `signTransaction`', async () => {
  const serializedTransaction = await signTransaction({
    transaction,
    privateKey: accounts[0].privateKey,
  })
  const address = await recoverTransactionAddress({
    serializedTransaction,
  })
  expect(address.toLowerCase()).toBe(accounts[0].address)
})

test('via `getTransaction`', async () => {
  const transaction = await publicClient.getTransaction({
    blockNumber: forkBlockNumber - 10n,
    index: 0,
  })
  const serializedTransaction = serializeTransaction(transaction)
  const address = await recoverTransactionAddress({
    serializedTransaction,
  })
  expect(address.toLowerCase()).toBe(transaction.from)
})
