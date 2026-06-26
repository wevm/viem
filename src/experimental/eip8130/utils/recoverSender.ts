import type { Address } from 'abitype'
import type { ErrorType } from '../../../errors/utils.js'
import { recoverAddress } from '../../../utils/signature/recoverAddress.js'
import type { TransactionSerializable8130 } from '../types/transaction.js'
import { getSenderSignatureHash8130 } from './hashTransaction.js'

export type RecoverSenderAddress8130Parameters = {
  /**
   * A parsed / serializable EIP-8130 transaction. Must carry `senderAuth`.
   */
  transaction: TransactionSerializable8130
}

export type RecoverSenderAddress8130ErrorType = ErrorType

/**
 * Resolves the sender (`from`) address of an EIP-8130 transaction.
 *
 * - **Configured-actor path** (`transaction.from` set): returns it as-is. The
 *   `senderAuth` is `authenticator || data` and the sender is explicit.
 * - **EOA path** (`transaction.from` omitted): the `senderAuth` is a raw 65-byte
 *   secp256k1 signature with no authenticator prefix. The sender is recovered
 *   via `ecrecover` over the sender signature hash (computed with `from` empty,
 *   exactly as the wire encodes it), matching the node's behaviour.
 *
 * Use this where a relayer / payer needs the resolved sender for an EOA-path
 * transaction (e.g. to bind the payer signature to the recovered sender), since
 * the wire format omits `from` in that case.
 *
 * @example
 * const from = await recoverSenderAddress8130({ transaction: parsed })
 */
export async function recoverSenderAddress8130(
  parameters: RecoverSenderAddress8130Parameters,
): Promise<Address> {
  const { transaction } = parameters
  if (transaction.from) return transaction.from
  if (!transaction.senderAuth || transaction.senderAuth === '0x')
    throw new Error(
      'Cannot recover sender: transaction has neither `from` nor `senderAuth`.',
    )
  // EOA path: sender hash is computed with `from` empty (the wire form).
  const hash = getSenderSignatureHash8130({ ...transaction, from: undefined })
  return recoverAddress({ hash, signature: transaction.senderAuth })
}
