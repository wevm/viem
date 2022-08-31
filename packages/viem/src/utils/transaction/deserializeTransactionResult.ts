import { TransactionResult } from '../../types/ethereum-provider'

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
  v,
  value,
}: TransactionResult): TransactionResult<bigint> {
  return {
    accessList,
    blockHash,
    blockNumber: BigInt(blockNumber),
    from,
    gas: BigInt(gas),
    gasPrice: BigInt(gasPrice),
    hash,
    input,
    maxFeePerGas: maxFeePerGas ? BigInt(maxFeePerGas) : undefined,
    maxPriorityFeePerGas: maxPriorityFeePerGas
      ? BigInt(maxPriorityFeePerGas)
      : undefined,
    nonce: BigInt(nonce),
    r,
    s,
    to,
    transactionIndex: BigInt(transactionIndex),
    v: BigInt(v),
    value: BigInt(value),
  }
}
