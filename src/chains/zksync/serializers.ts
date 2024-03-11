import type { Signature } from '../../index.js'
import type { ChainSerializers } from '../../types/chain.js'
import type { TransactionSerializable } from '../../types/transaction.js'
import { concatHex } from '../../utils/data/concat.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { toRlp } from '../../utils/encoding/toRlp.js'
import { serializeTransaction as serializeTransaction_ } from '../../utils/transaction/serializeTransaction.js'
import type {
  ZkSyncTransactionSerializable,
  ZkSyncTransactionSerializableEIP712,
  ZkSyncTransactionSerializedEIP712,
} from './types/transaction.js'
import { assertEip712Transaction } from './utils/assertEip712Transaction.js'
import { isEIP712Transaction } from './utils/isEip712Transaction.js'

export function serializeTransaction(
  transaction: ZkSyncTransactionSerializable,
  signature?: Signature,
) {
  if (isEIP712Transaction(transaction))
    return serializeTransactionEIP712(
      transaction as ZkSyncTransactionSerializableEIP712,
    )
  return serializeTransaction_(
    transaction as TransactionSerializable,
    signature,
  )
}

export const serializers = {
  transaction: serializeTransaction,
} as const satisfies ChainSerializers

export type SerializeTransactionEIP712ReturnType =
  ZkSyncTransactionSerializedEIP712

function serializeTransactionEIP712(
  transaction: ZkSyncTransactionSerializableEIP712,
): SerializeTransactionEIP712ReturnType {
  const {
    chainId,
    gas,
    nonce,
    to,
    from,
    value,
    maxFeePerGas,
    maxPriorityFeePerGas,
    customSignature,
    factoryDeps,
    paymaster,
    paymasterInput,
    gasPerPubdata,
    data,
  } = transaction

  assertEip712Transaction(transaction)

  const serializedTransaction = [
    nonce ? toHex(nonce) : '0x',
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : '0x',
    maxFeePerGas ? toHex(maxFeePerGas) : '0x',
    gas ? toHex(gas) : '0x',
    to ?? '0x',
    value ? toHex(value) : '0x',
    data ?? '0x0',
    toHex(chainId),
    toHex(''),
    toHex(''),
    toHex(chainId),
    from ?? '0x',
    gasPerPubdata ? toHex(gasPerPubdata) : '0x',
    factoryDeps ?? [],
    customSignature ?? '0x', // EIP712 signature
    paymaster && paymasterInput ? [paymaster, paymasterInput] : [],
  ]

  return concatHex([
    '0x71',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionEIP712ReturnType
}
