import {
  resolve,
  type SigningFrame,
  signFrame,
  signing,
} from '../../../frames/internal/transaction.js'
import type { Frame } from '../../../types/frame.js'
import type { TransactionSerializableEIP8141 } from '../../../types/transaction.js'
import {
  type SerializeTransactionFn,
  serializeTransaction,
} from '../../../utils/transaction/serializeTransaction.js'

/** @internal */
export async function signFrameTransaction(
  transaction: TransactionSerializableEIP8141,
  serializer: SerializeTransactionFn = serializeTransaction,
) {
  transaction = resolve(transaction)

  for (const payloadsOnly of [true, false]) {
    const frames: Frame[] = []
    for (const frame of transaction.frames)
      frames.push(
        (frame as SigningFrame)[signing]
          ? await signFrame(frame, transaction, { payloadsOnly })
          : frame,
      )
    transaction = resolve({ ...transaction, frames })
  }

  const {
    from: _from,
    gas: _gas,
    ...envelope
  } = transaction as TransactionSerializableEIP8141 & {
    from?: string | undefined
    gas?: bigint | undefined
  }
  return serializer(envelope)
}
