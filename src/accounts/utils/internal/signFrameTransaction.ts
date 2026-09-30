import * as Frame from '../../../frames/Frame.js'
import * as FrameTransaction from '../../../frames/internal/transaction.js'
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
  let request = FrameTransaction.resolve(transaction)

  for (const payloadsOnly of [true, false])
    for (const frame of request.frames)
      if (
        request.frameContext?.entries.some(
          (entry) => entry.frame === frame && entry.signatures.length,
        )
      ) {
        const signed = await Frame.sign(frame, {
          transaction: request,
          payloadsOnly,
        })
        request = FrameTransaction.resolve({
          ...request,
          frames: request.frames.map((candidate) =>
            candidate === frame ? signed : candidate,
          ),
        })
      }

  const {
    frameContext: _frameContext,
    from: _from,
    gas: _gas,
    ...envelope
  } = request as FrameTransaction.Transaction & {
    from?: string | undefined
    gas?: bigint | undefined
  }
  return serializer(envelope)
}
