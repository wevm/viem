import { Block as ProviderBlock } from '../../types/ethereum-provider'
import { hexToNumber } from '../number'

export type Block = ProviderBlock<bigint, number>

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
  transactions,
  transactionsRoot,
  uncles,
}: ProviderBlock): Block {
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
    number: number ? hexToNumber(number) : null,
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
