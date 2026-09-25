import {
  type Frame,
  type FrameSignature,
  getSerializedTransactionType,
  getTransactionType,
  type Hex,
  parseTransaction,
  serializeTransaction,
  type TransactionSerializable,
  type TransactionSerializableEIP8141,
  type TransactionSerializedEIP8141,
} from 'viem'
import { expectTypeOf, test } from 'vitest'

test('eip8141', () => {
  const transaction = {
    chainId: 1,
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        mode: 'verify',
      },
    ],
    nonce: 7,
    sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    signatures: [{ scheme: 'secp256k1' }],
  } as const satisfies TransactionSerializableEIP8141

  expectTypeOf(transaction).toExtend<TransactionSerializable>()
  expectTypeOf(
    serializeTransaction(transaction),
  ).toEqualTypeOf<TransactionSerializedEIP8141>()
  expectTypeOf(
    serializeTransaction({ ...transaction, type: 'eip8141' }),
  ).toEqualTypeOf<TransactionSerializedEIP8141>()
  expectTypeOf(getTransactionType(transaction)).toEqualTypeOf<'eip8141'>()
  expectTypeOf(
    getTransactionType({ ...transaction, blobVersionedHashes: [] }),
  ).toEqualTypeOf<'eip8141'>()
  expectTypeOf(
    getTransactionType({ ...transaction, type: 'eip1559' }),
  ).toEqualTypeOf<'eip1559'>()
  expectTypeOf(getSerializedTransactionType('0x06')).toEqualTypeOf<'eip8141'>()
  expectTypeOf(
    parseTransaction('0x06'),
  ).toEqualTypeOf<TransactionSerializableEIP8141>()
  expectTypeOf<
    TransactionSerializableEIP8141['chainId']
  >().toEqualTypeOf<number>()
  expectTypeOf<TransactionSerializableEIP8141['nonce']>().toEqualTypeOf<
    number | undefined
  >()
  expectTypeOf<
    TransactionSerializableEIP8141<Hex, Hex>['nonce']
  >().toEqualTypeOf<Hex | undefined>()
  expectTypeOf<TransactionSerializableEIP8141<Hex>['frames']>().toEqualTypeOf<
    readonly Frame<Hex>[]
  >()
  expectTypeOf<TransactionSerializableEIP8141['signatures']>().toEqualTypeOf<
    readonly FrameSignature[] | undefined
  >()

  // @ts-expect-error frame envelopes do not have an outer recipient
  serializeTransaction({ ...transaction, to: transaction.sender })
  // @ts-expect-error frame envelopes do not have an outer signature
  serializeTransaction({ ...transaction, r: '0x01', s: '0x02', yParity: 0 })
  // @ts-expect-error nonces use Viem's number convention
  serializeTransaction({ ...transaction, nonce: 1n })
  // @ts-expect-error chain IDs use Viem's number convention
  serializeTransaction({ ...transaction, chainId: 1n })
  // @ts-expect-error EIP-4844 sidecars do not match the PeerDAS wrapper
  serializeTransaction({ ...transaction, sidecars: [] })
})
