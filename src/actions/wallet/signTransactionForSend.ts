import type { LocalAccount } from '../../accounts/types.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import { fromRlp } from '../../utils/encoding/fromRlp.js'
import type { SerializeTransactionFn } from '../../utils/transaction/serializeTransaction.js'

/** @internal */
export async function signTransactionForSend(
  account: LocalAccount,
  request: TransactionRequest,
  serializer?: SerializeTransactionFn | undefined,
) {
  const serialized = (await account.signTransaction(request as never, {
    serializer,
  })) as Hex
  const { multisig, signatures = [] } = request as TransactionRequest & {
    multisig?: unknown
    signatures?: readonly Hex[] | undefined
  }
  if (!serializer || !multisig || isSerializedTempoTransaction(serialized))
    return serialized
  return await serializer({
    ...request,
    signatures: [...signatures, serialized],
  } as never)
}

function isSerializedTempoTransaction(serialized: Hex) {
  if (!serialized.startsWith('0x76') && !serialized.startsWith('0x78'))
    return false
  try {
    const envelope = fromRlp(`0x${serialized.slice(4)}`)
    return Array.isArray(envelope) && envelope.length >= 13
  } catch {
    return false
  }
}
