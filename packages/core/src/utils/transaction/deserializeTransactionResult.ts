import {
  RpcTransactionResult,
  TransactionResult,
  TransactionResultBase,
} from '../../types'
import { hexToNumber } from '../number'

export const transactionType = {
  legacy: '0x0',
  eip2930: '0x1',
  eip1559: '0x2',
} as const

export function deserializeTransactionResult({
  accessList,
  blockHash,
  blockNumber,
  from,
  gas,
  gasPrice,
  hash,
  input,
  maxFeePerGas,
  maxPriorityFeePerGas,
  nonce,
  r,
  s,
  to,
  transactionIndex,
  type,
  v,
  value,
}: RpcTransactionResult): TransactionResult {
  const result: TransactionResultBase<bigint, number> = {
    blockHash,
    blockNumber: blockNumber ? BigInt(blockNumber) : null,
    from,
    gas: BigInt(gas),
    hash,
    input,
    nonce: hexToNumber(nonce),
    r,
    s,
    to,
    transactionIndex: transactionIndex ? hexToNumber(transactionIndex) : null,
    v: BigInt(v),
    value: BigInt(value),
  }
  if (type === transactionType.eip2930) {
    return {
      ...result,
      accessList,
      gasPrice: BigInt(gasPrice),
      type: 'eip2930',
    }
  }
  if (type === transactionType.eip1559) {
    return {
      ...result,
      accessList,
      maxFeePerGas: BigInt(maxFeePerGas),
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
      type: 'eip1559',
    }
  }
  return {
    ...result,
    accessList: undefined,
    gasPrice: BigInt(gasPrice),
    type: 'legacy',
  }
}
