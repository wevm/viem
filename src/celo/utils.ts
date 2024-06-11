import type { Address } from 'abitype'
import { trim } from '../utils/data/trim.js'
import type {
  CeloTransactionRequest,
  CeloTransactionSerializable,
  TransactionSerializableCIP64,
} from './types.js'

export function isEmpty(
  value: string | undefined | number | BigInt,
): value is undefined {
  return (
    value === 0 ||
    value === 0n ||
    value === undefined ||
    value === null ||
    value === '0' ||
    value === '' ||
    (typeof value === 'string' &&
      (trim(value as Address).toLowerCase() === '0x' ||
        trim(value as Address).toLowerCase() === '0x00'))
  )
}

export function isPresent(
  value: string | undefined | number | BigInt,
): value is string | number | BigInt {
  return !isEmpty(value)
}

/** @internal */
export function isEIP1559(
  transaction: CeloTransactionSerializable | CeloTransactionRequest,
): boolean {
  return (
    typeof transaction.maxFeePerGas !== 'undefined' &&
    typeof transaction.maxPriorityFeePerGas !== 'undefined'
  )
}

export function isCIP64(
  transaction: CeloTransactionSerializable | CeloTransactionRequest,
): transaction is TransactionSerializableCIP64 {
  /*
   * Enable end user to force the tx to be considered as a CIP-64.
   *
   * The preliminary type will be determined as "eip1559" by src/utils/transaction/getTransactionType.ts
   * and so we need the logic below to check for the specific value instead of checking if just any
   * transaction type is provided. If that's anything else than "cip64" then we need to reevaluate the
   * type based on the transaction fields.
   *
   * Modify with caution and according to https://github.com/celo-org/celo-proposals/blob/master/CIPs/cip-0064.md
   */
  if (transaction.type === 'cip64') {
    return true
  }

  return isEIP1559(transaction) && isPresent(transaction.feeCurrency)
}
