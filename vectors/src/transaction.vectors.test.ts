/// <reference types="@types/bun" />

import { join } from 'node:path'
import { describe, expect, test } from 'bun:test'

import { privateKeyToAddress } from '../../src/accounts/utils/privateKeyToAddress.js'
import { parseTransaction, recoverTransactionAddress } from '../../src/index.js'
import { serializeTransaction } from '../../src/utils/transaction/serializeTransaction.js'
import { readGzippedJson } from '../utils.js'

const transactions_ = await readGzippedJson(
  join(import.meta.dir, './transaction.json.gz'),
)
const transactions = transactions_.map(
  ({ transaction, signature, ...rest }) => ({
    ...rest,
    transaction: {
      ...transaction,
      gas: transaction.gas ? BigInt(transaction.gas) : undefined,
      gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
      maxFeePerBlobGas: transaction.maxFeePerBlobGas
        ? BigInt(transaction.maxFeePerBlobGas)
        : undefined,
      maxFeePerGas: transaction.maxFeePerGas
        ? BigInt(transaction.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
        ? BigInt(transaction.maxPriorityFeePerGas)
        : undefined,
      nonce: transaction.nonce ? Number(transaction.nonce) : undefined,
      value: transaction.value ? BigInt(transaction.value) : undefined,
    },
    signature: {
      ...signature,
      v: signature.v ? BigInt(signature.v) : undefined,
    },
  }),
)

describe('parseTransaction', () => {
  transactions.forEach(
    ({ name, serialized, serializedSigned, signature, transaction }) => {
      test(`${name}`, () => {
        if (transaction.accessList?.length === 0) delete transaction.accessList
        if (transaction.data === '0x') delete transaction.data
        if (!transaction.gas) delete transaction.gas
        if (!transaction.gasPrice) delete transaction.gasPrice
        if (!transaction.maxFeePerGas) delete transaction.maxFeePerGas
        if (!transaction.maxFeePerBlobGas) delete transaction.maxFeePerBlobGas
        if (!transaction.maxPriorityFeePerGas)
          delete transaction.maxPriorityFeePerGas
        if (!transaction.nonce) delete transaction.nonce
        if (!transaction.value) delete transaction.value
        expect(parseTransaction(serialized)).toEqual(transaction)
        expect(parseTransaction(serializedSigned)).toEqual({
          ...transaction,
          ...signature,
        })
      })
    },
  )
})

describe('serializeTransaction', () => {
  transactions.forEach(({ name, serialized, transaction }) => {
    test(`${name}`, () => {
      expect(serializeTransaction(transaction)).toEqual(serialized)
    })
  })
})

describe('recoverTransactionAddress', () => {
  transactions.forEach(
    ({ name, privateKey, serializedSigned }) => {
      test(`${name}`, async () => {
        expect(
          await recoverTransactionAddress({
            serializedTransaction: serializedSigned,
          }),
        ).toEqual(privateKeyToAddress(privateKey))
      })
    },
  )
})
