import type { Hex, TransactionSerializable } from 'viem'
import { privateKeyToAccount, signTransaction } from 'viem/accounts'
import { expectTypeOf, test } from 'vitest'

const privateKey =
  '0x0000000000000000000000000000000000000000000000000000000000000001'
const transaction = {
  chainId: 1,
  frames: [{}],
  sender: '0x0000000000000000000000000000000000000001',
} as const

test('default signing accepts frame transactions', () => {
  const account = privateKeyToAccount(privateKey)
  account.signTransaction(transaction)
  account.signTransaction({ ...transaction, type: 'eip8141' })
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
