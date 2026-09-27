import type { Hex, TransactionSerializable } from 'viem'
import {
  privateKeyToAccount,
  type SignTransactionErrorType,
  signTransaction,
} from 'viem/accounts'
import { expectTypeOf, test } from 'vitest'

const privateKey =
  '0x0000000000000000000000000000000000000000000000000000000000000001'
const transaction = {
  chainId: 1,
  frames: [{}],
  sender: '0x0000000000000000000000000000000000000001',
} as const

test('default signing excludes frame transactions', () => {
  const account = privateKeyToAccount(privateKey)
  // @ts-expect-error frame transactions require a capable serializer
  account.signTransaction(transaction)
  // @ts-expect-error explicit frame transactions require a capable serializer
  account.signTransaction({ ...transaction, type: 'eip8141' })
  // @ts-expect-error frame transactions require a capable serializer
  signTransaction({ privateKey, transaction })
  expectTypeOf(
    signTransaction({
      privateKey,
      transaction: { chainId: 1, maxFeePerGas: 1n },
    }),
  ).toEqualTypeOf<Promise<`0x02${string}`>>()
  expectTypeOf(
    account.signTransaction({ chainId: 1, maxFeePerGas: 1n }),
  ).toEqualTypeOf<Promise<Hex>>()
})

test('custom serializers accept frame transactions', () => {
  const serializer = (_transaction: TransactionSerializable): Hex => '0x06'
  const account = privateKeyToAccount(privateKey)
  expectTypeOf(
    account.signTransaction(transaction, { serializer }),
  ).toEqualTypeOf<Promise<Hex>>()
  expectTypeOf(
    signTransaction({ privateKey, transaction, serializer }),
  ).toEqualTypeOf<Promise<`0x06${string}`>>()
})

test('unsupported transaction error is present in the error union', () => {
  expectTypeOf<
    Extract<
      SignTransactionErrorType,
      {
        name: 'SignTransaction.UnsupportedTransactionTypeError'
      }
    >
  >().not.toBeNever()
})
