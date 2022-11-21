import { Block, RpcBlock } from '../../types'
import { deserializeTransactionResult } from '../transaction'

export function deserializeBlock({
  baseFeePerGas,
  difficulty,
  extraData,
  gasLimit,
  gasUsed,
  hash,
  logsBloom,
  miner,
  mixHash,
  nonce,
  number,
  parentHash,
  receiptsRoot,
  sealFields,
  sha3Uncles,
  size,
  stateRoot,
  timestamp,
  totalDifficulty,
  transactions: transactions_,
  transactionsRoot,
  uncles,
}: RpcBlock): Block {
  const transactions = transactions_.map((transaction) => {
    if (typeof transaction === 'string') return transaction
    return deserializeTransactionResult(transaction)
  })
  return {
    baseFeePerGas: baseFeePerGas ? BigInt(baseFeePerGas) : null,
    difficulty: BigInt(difficulty),
    extraData,
    gasLimit: BigInt(gasLimit),
    gasUsed: BigInt(gasUsed),
    hash,
    logsBloom,
    miner,
    mixHash,
    nonce,
    number: number ? BigInt(number) : null,
    parentHash,
    receiptsRoot,
    sealFields,
    sha3Uncles,
    size: BigInt(size),
    stateRoot,
    timestamp: BigInt(timestamp),
    totalDifficulty: totalDifficulty ? BigInt(totalDifficulty) : null,
    transactions,
    transactionsRoot,
    uncles,
  }
}
