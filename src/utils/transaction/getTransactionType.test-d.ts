import { expectTypeOf, test } from 'vitest'
import type {
  TransactionSerializable,
  TransactionSerializableEIP1559,
  TransactionSerializableEIP2930,
  TransactionSerializableLegacy,
} from '../../index.js'
import type { TransactionSerializableEIP4844 } from '../../types/transaction.js'
import { getTransactionType } from './getTransactionType.js'

test('empty', () => {
  expectTypeOf(getTransactionType({})).toEqualTypeOf<string>()
})

test('opaque', () => {
  expectTypeOf(getTransactionType({} as TransactionSerializable)).toEqualTypeOf<
    'legacy' | 'eip1559' | 'eip2930' | 'eip4844'
  >()
  expectTypeOf(
    getTransactionType({} as TransactionSerializableLegacy),
  ).toEqualTypeOf<'legacy'>()
  expectTypeOf(
    getTransactionType({} as TransactionSerializableEIP1559),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(
    getTransactionType({} as TransactionSerializableEIP2930),
  ).toEqualTypeOf<'eip2930'>()
  expectTypeOf(
    getTransactionType({} as TransactionSerializableEIP4844),
  ).toEqualTypeOf<'eip4844'>()
})

test('const: type', () => {
  expectTypeOf(getTransactionType({ type: 'legacy' })).toEqualTypeOf<'legacy'>()
  expectTypeOf(
    getTransactionType({ type: 'eip1559' }),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(
    getTransactionType({ type: 'eip2930' }),
  ).toEqualTypeOf<'eip2930'>()
  expectTypeOf(
    getTransactionType({ type: 'eip4844' }),
  ).toEqualTypeOf<'eip4844'>()
})

test('const: legacy attributes', () => {
  expectTypeOf(getTransactionType({ gasPrice: 1n })).toEqualTypeOf<'legacy'>()
  expectTypeOf(
    getTransactionType({ gasPrice: 1n, maxFeePerGas: undefined }),
  ).toEqualTypeOf<'legacy'>()
  expectTypeOf(
    getTransactionType({ gasPrice: 1n, maxFeePerBlobGas: undefined }),
  ).toEqualTypeOf<'legacy'>()
})

test('const: eip1559 attributes', () => {
  expectTypeOf(
    getTransactionType({ maxFeePerGas: 1n }),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(
    getTransactionType({ maxPriorityFeePerGas: 1n }),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(
    getTransactionType({ maxFeePerGas: 1n, maxPriorityFeePerGas: 1n }),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(
    getTransactionType({ maxFeePerGas: 1n, gasPrice: undefined }),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(
    getTransactionType({ accessList: [], maxFeePerGas: 1n }),
  ).toEqualTypeOf<'eip1559'>()
})

test('const: eip2930 attributes', () => {
  expectTypeOf(
    getTransactionType({ accessList: [] }),
  ).toEqualTypeOf<'eip2930'>()
  expectTypeOf(
    getTransactionType({ accessList: [], maxFeePerGas: undefined }),
  ).toEqualTypeOf<'eip2930'>()
  expectTypeOf(
    getTransactionType({ accessList: [], gasPrice: undefined }),
  ).toEqualTypeOf<'eip2930'>()
  expectTypeOf(
    getTransactionType({ accessList: [], gasPrice: 1n }),
  ).toEqualTypeOf<'eip2930'>()
})

test('const: 4844 attributes', () => {
  expectTypeOf(getTransactionType({ blobs: [] })).toEqualTypeOf<'eip4844'>()
  expectTypeOf(
    getTransactionType({ blobs: [], gasPrice: undefined }),
  ).toEqualTypeOf<'eip4844'>()
  expectTypeOf(
    getTransactionType({ blobs: [], maxFeePerGas: undefined }),
  ).toEqualTypeOf<'eip4844'>()
  expectTypeOf(
    getTransactionType({ blobs: [], maxFeePerGas: 1n }),
  ).toEqualTypeOf<'eip4844'>()
  expectTypeOf(
    getTransactionType({ blobs: [], maxPriorityFeePerGas: undefined }),
  ).toEqualTypeOf<'eip4844'>()
  expectTypeOf(
    getTransactionType({ blobs: [], maxPriorityFeePerGas: 1n }),
  ).toEqualTypeOf<'eip4844'>()
  expectTypeOf(getTransactionType({ sidecars: [] })).toEqualTypeOf<'eip4844'>()
  expectTypeOf(
    getTransactionType({ blobVersionedHashes: [] }),
  ).toEqualTypeOf<'eip4844'>()
})
