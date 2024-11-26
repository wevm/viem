import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { accounts } from '../../../test/src/constants.js'
import {
  privateKeyToAccount,
  serializeSignature,
  sign,
  signTransaction,
} from '../../accounts/index.js'
import { getTransaction } from '../../actions/index.js'
import { walletActions } from '../../clients/decorators/wallet.js'

import { kzg } from '../../../test/src/kzg.js'
import type {
  TransactionSerializable,
  TransactionSerializableEIP4844,
  TransactionSerializedLegacy,
} from '../../types/transaction.js'
import { sidecarsToVersionedHashes } from '../blob/sidecarsToVersionedHashes.js'
import { toBlobSidecars } from '../blob/toBlobSidecars.js'
import {
  getAddress,
  hexToBytes,
  keccak256,
  serializeTransaction,
  stringToHex,
} from '../index.js'
import { recoverTransactionAddress } from './recoverTransactionAddress.js'

const client = anvilMainnet.getClient().extend(walletActions)

const transaction = {
  chainId: 1,
  maxFeePerGas: 2n,
  maxPriorityFeePerGas: 1n,
  to: '0x0000000000000000000000000000000000000000',
  value: 1n,
} as const satisfies TransactionSerializable

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
    signature: serializeSignature(signature),
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
    signature: hexToBytes(serializeSignature(signature)),
  })
  expect(address.toLowerCase()).toBe(accounts[0].address)
})

test('4844 tx', async () => {
  const sidecars = toBlobSidecars({ data: stringToHex('abcd'), kzg })
  const blobVersionedHashes = sidecarsToVersionedHashes({ sidecars })
  const transaction4844 = {
    ...transaction,
    blobVersionedHashes,
    sidecars,
  } satisfies TransactionSerializableEIP4844

  const signableTransaction = serializeTransaction({
    ...transaction4844,
    sidecars: false,
  })
  const signature = await sign({
    hash: keccak256(signableTransaction),
    privateKey: accounts[0].privateKey,
  })
  const serializedTransaction = serializeTransaction(transaction4844, signature)

  const address = await recoverTransactionAddress({
    serializedTransaction,
    signature,
  })
  expect(address.toLowerCase()).toBe(accounts[0].address)
})

test('via `walletClient.signTransaction`', async () => {
  const serializedTransaction = await client.signTransaction({
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
  const transaction = await getTransaction(client, {
    blockNumber: anvilMainnet.forkBlockNumber - 10n,
    index: 0,
  })
  const serializedTransaction = serializeTransaction({
    ...transaction,
    data: transaction.input,
  })
  const address = await recoverTransactionAddress({
    serializedTransaction,
  })
  expect(address).toBe(getAddress(transaction.from))
})

test('legacy', async () => {
  expect(
    await recoverTransactionAddress({
      serializedTransaction:
        '0xf8a90c8507558bdb0082d57a948813f5bcbe6c7071d8bd32d2a4f07599bb5797b080b844a9059cbb00000000000000000000000068674fb6a9ee3749d5d8f71eeed5f254a75ffeea0000000000000000000000000000000000000000000001894b59bd5cd2fc000026a00d39b9cb3369c546185f4ddd6ee6908052c39fe856642726fa93f9a2a83db755a06a8c3928a80275ecef8a0ff00486483f8db6274b5ffd44fbcb8765418e9bec26' as TransactionSerializedLegacy,
    }),
  ).toMatchInlineSnapshot(`"0xb03B8ffAB1f3Ac3CabE4A0B2ED441fDFd3C96C8E"`)
})
