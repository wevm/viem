import type { Signature } from '../index.js'
import type { ChainSerializers } from '../types/chain.js'
import type { TransactionSerializable } from '../types/transaction.js'
import { concatHex } from '../utils/data/concat.js'
import { toHex } from '../utils/encoding/toHex.js'
import { toRlp } from '../utils/encoding/toRlp.js'
import { serializeTransaction as serializeTransaction_ } from '../utils/transaction/serializeTransaction.js'
import { gasPerPubdataDefault } from './constants/number.js'
import type {
  ZksyncTransactionSerializable,
  ZksyncTransactionSerializableEIP712,
  ZksyncTransactionSerializedEIP712,
} from './types/transaction.js'
import { assertEip712Transaction } from './utils/assertEip712Transaction.js'
import { isEIP712Transaction } from './utils/isEip712Transaction.js'

export function serializeTransaction(
  transaction: ZksyncTransactionSerializable,
  signature?: Signature | undefined,
) {
  if (isEIP712Transaction(transaction))
    return serializeTransactionEIP712(
      transaction as ZksyncTransactionSerializableEIP712,
    )
  return serializeTransaction_(
    transaction as TransactionSerializable,
    signature,
  )
}

export const serializers = {
  transaction: serializeTransaction,
} as const satisfies ChainSerializers

type SerializeTransactionEIP712ReturnType = ZksyncTransactionSerializedEIP712

function serializeTransactionEIP712(
  transaction: ZksyncTransactionSerializableEIP712,
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
    data ?? '0x',
    toHex(chainId),
    toHex(''),
    toHex(''),
    toHex(chainId),
    from ?? '0x',
    gasPerPubdata ? toHex(gasPerPubdata) : toHex(gasPerPubdataDefault),
    factoryDeps ?? [],
    customSignature ?? '0x', // EIP712 signature
    paymaster && paymasterInput ? [paymaster, paymasterInput] : [],
  ]

  return concatHex([
    '0x71',
    toRlp(serializedTransaction),
  ]) as SerializeTransactionEIP712ReturnType
}
